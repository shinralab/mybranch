import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import ProfileClient from './ProfileClient'
import {
  getAllBranches,
  getBranch,
  getCommits,
  REPO_OWNER,
  REPO_NAME,
  ROOT_USER,
  isReservedName,
} from '@/lib/github'
import { timeAgo, displayName } from '@/lib/utils'

export const revalidate = 60

interface Props {
  params: { username: string }
  searchParams: { branch?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = decodeURIComponent(params.username)
  return {
    title: `${displayName(name)} · mybranch.fun`,
    description: `${displayName(name)}'s profile on mybranch.fun — a living git tree.`,
  }
}

export default async function ProfilePage({ params, searchParams }: Props) {
  // Decode the branch name from the URL
  const rawParam = decodeURIComponent(params.username)

  // Figure out the actual branch name.
  // People branches: /username → branch = username
  // Group branches: /group/name or URL encodes to /group%2Fname
  // We store it as-is and let the URL be the branch identifier
  const branchName = rawParam

  const isRoot = branchName.toLowerCase() === ROOT_USER.toLowerCase()

  const actualBranch = branchName

  // If someone's trying to impersonate root username
  if (!isRoot && isReservedName(branchName) && branchName.toLowerCase() !== ROOT_USER.toLowerCase()) {
    notFound()
  }

  // Resolve the actual branch: root maps to 'main'
  const actualBranch = isRoot ? 'main' : branchName
  const requestedBranch = searchParams.branch ?? actualBranch

  // Check branch exists
  const branchData = await getBranch(requestedBranch)
  

  // Fetch everything in parallel
  const [allBranches, commits] = await Promise.all([
    getAllBranches(),
    getCommits(requestedBranch, 20),
  ])

  const isGroup = branchName.startsWith('group/') || branchName.startsWith('club/')
  const username = displayName(isRoot ? ROOT_USER : branchName)

  const lastUpdated = commits[0]
    ? timeAgo(commits[0].commit.author.date)
    : 'unknown'

  const commitsForClient = commits.map(c => ({
    sha: c.sha,
    message: c.commit.message.split('\n')[0].slice(0, 72),
    date: c.commit.author.date,
    authorLogin: c.author?.login ?? null,
  }))

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav
        crumbs={[
          { label: `${REPO_OWNER}/${REPO_NAME}`, href: '/' },
          { label: username },
        ]}
      />
      <ProfileClient
        username={username}
        branchName={branchName}
        isRoot={isRoot}
        isGroup={isGroup}
        repoOwner={REPO_OWNER}
        repoName={REPO_NAME}
        templateOwner={REPO_OWNER}
        templateRepo={REPO_NAME}
        branches={allBranches.map(b => ({ name: b.name }))}
        currentBranch={requestedBranch}
        commits={commitsForClient}
        lastUpdated={lastUpdated}
      />
    </div>
  )
}
