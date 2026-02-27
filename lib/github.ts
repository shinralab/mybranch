// ─── Core GitHub data layer ───────────────────────────────────────────────────
// One repo = the whole tree. Branches = people + groups.
// Everything reads from the GitHub API. Zero database.

const OWNER = process.env.GITHUB_OWNER ?? ''
const REPO  = process.env.GITHUB_REPO  ?? ''
const TOKEN = process.env.GITHUB_TOKEN
const ROOT  = (process.env.ROOT_USERNAME ?? 'MFDOGE')

export const REPO_OWNER  = OWNER
export const REPO_NAME   = REPO
export const ROOT_USER   = ROOT


}

// ─── Headers ──────────────────────────────────────────────────────────────────
function headers(): HeadersInit {
  const h: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'mybranch.fun/1.0',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (TOKEN) h['Authorization'] = `Bearer ${TOKEN}`
  return h
}

async function gh<T>(path: string, revalidate = 60): Promise<T> {
  const url = `https://api.github.com${path}`
  const res = await fetch(url, { headers: headers(), next: { revalidate } })
  if (res.status === 403) {
    const body = await res.json().catch(() => ({}))
    if (body?.message?.toLowerCase().includes('rate limit')) {
      throw new Error('RATE_LIMIT')
    }
  }
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${path}`)
  return res.json()
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GHBranch {
  name: string
  commit: { sha: string; url: string }
  protected: boolean
}

export interface GHCommit {
  sha: string
  commit: {
    author: { name: string; email: string; date: string }
    committer: { name: string; email: string; date: string }
    message: string
  }
  author: { login: string; avatar_url: string; html_url: string } | null
  committer: { login: string; avatar_url: string } | null
  parents: { sha: string }[]
}

export interface GHContributor {
  login: string
  avatar_url: string
  html_url: string
  contributions: number
}

export interface BranchStat {
  name: string
  sha: string
  isRoot: boolean
  isGroup: boolean       // branch names starting with 'group/' or 'club/'
  lastCommit: {
    sha: string
    date: string
    message: string
    author: string
    authorAvatar: string | null
    authorLogin: string | null
  }
  commitCount: number
  parentBranch: string | null  // derived from first commit's parent
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

/** All branches in the repo = all nodes in the tree */
export async function getAllBranches(): Promise<GHBranch[]> {
  // Paginate up to 300 branches
  const pages = await Promise.all([
    gh<GHBranch[]>(`/repos/${OWNER}/${REPO}/branches?per_page=100&page=1`),
    gh<GHBranch[]>(`/repos/${OWNER}/${REPO}/branches?per_page=100&page=2`),
    gh<GHBranch[]>(`/repos/${OWNER}/${REPO}/branches?per_page=100&page=3`),
  ])
  return pages.flat().filter(b => b.name !== '') 
}

/** Get a single branch */
export async function getBranch(branch: string): Promise<GHBranch | null> {
  try {
    return await gh<GHBranch>(`/repos/${OWNER}/${REPO}/branches/${encodeURIComponent(branch)}`)
  } catch { return null }
}

/** Last N commits on a branch */
export async function getCommits(branch: string, per_page = 30): Promise<GHCommit[]> {
  try {
    return await gh<GHCommit[]>(
      `/repos/${OWNER}/${REPO}/commits?sha=${encodeURIComponent(branch)}&per_page=${per_page}`,
      120
    )
  } catch { return [] }
}

/** Commit count for a branch vs main (approximate via compare) */
export async function getCommitCount(branch: string): Promise<number> {
  if (branch === 'main') return 0
  try {
    const data = await gh<{ ahead_by: number; behind_by: number }>(
      `/repos/${OWNER}/${REPO}/compare/main...${encodeURIComponent(branch)}`,
      300
    )
    return data.ahead_by ?? 0
  } catch { return 0 }
}

/** Contributors list */
export async function getContributors(): Promise<GHContributor[]> {
  try {
    return await gh<GHContributor[]>(
      `/repos/${OWNER}/${REPO}/contributors?per_page=100`,
      300
    )
  } catch { return [] }
}

/** Rich stats for every branch — powers the leaderboard */
export async function getAllBranchStats(): Promise<BranchStat[]> {
  const branches = await getAllBranches()

  const stats = await Promise.all(
    branches.map(async (b): Promise<BranchStat> => {
      const commits = await getCommits(b.name, 1)
      const last = commits[0] ?? null
      const commitCount = await getCommitCount(b.name)

      return {
        name: b.name,
        sha: b.commit.sha,
        isRoot: b.name === 'main',
        isGroup: b.name.startsWith('group/') || b.name.startsWith('club/'),
        lastCommit: last ? {
          sha: last.sha.slice(0, 7),
          date: last.commit.author.date,
          message: last.commit.message.split('\n')[0].slice(0, 72),
          author: last.commit.author.name,
          authorLogin: last.author?.login ?? null,
          authorAvatar: last.author?.avatar_url ?? null,
        } : {
          sha: b.commit.sha.slice(0, 7),
          date: new Date().toISOString(),
          message: 'initial profile',
          author: b.name,
          authorLogin: null,
          authorAvatar: null,
        },
        commitCount,
        parentBranch: b.name === 'main' ? null : 'main',
      }
    })
  )

  return stats
}

/** Repo-level metadata */
export async function getRepoMeta() {
  try {
    return await gh<{
      name: string
      full_name: string
      description: string
      stargazers_count: number
      forks_count: number
      open_issues_count: number
      watchers_count: number
      created_at: string
      pushed_at: string
      default_branch: string
      html_url: string
    }>(`/repos/${OWNER}/${REPO}`, 300)
  } catch { return null }
}
