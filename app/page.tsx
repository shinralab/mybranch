import Link from 'next/link'
import Nav from '@/components/Nav'
import { getAllBranchStats, getRepoMeta, REPO_OWNER, REPO_NAME, ROOT_USER } from '@/lib/github'
import type { BranchStat } from '@/lib/github'
import { timeAgo, displayName, shortMsg } from '@/lib/utils'
import { IconBranch, IconCommit, IconFork, IconStar, IconEye, IconGroup } from '@/components/BranchIcon'

import { notFound } from 'next/navigation';
import { isReservedBranch } from '@/lib/reserved';
// your other imports...

interface Props {
  params: { branch: string };
}

export default async function ProfilePage({ params }: Props) {
  const branchName = params.branch;

  if (isReservedBranch(branchName)) {
    notFound();  // or your custom reserved message component
  }

  const branchData = await getBranch(branchName);

  if (!branchData || !branchData.exists) {
    notFound();
  }

  // rest of page: iframe, metadata, etc.
}




export const revalidate = 60

function ActivityBar({ count }: { count: number }) {
  // Normalize to 0-5 levels
  const max = 50
  const bars = 7
  return (
    <div className="sparkline">
      {Array.from({ length: bars }).map((_, i) => {
        const val = i === bars - 1 ? count : Math.floor(count * (0.3 + Math.random() * 0.7))
        const h = Math.max(2, Math.min(16, Math.round((val / max) * 16)))
        const level = val === 0 ? '' : val < 5 ? 'l1' : val < 15 ? 'l2' : val < 25 ? 'l3' : val < 40 ? 'l4' : 'l5'
        return (
          <div
            key={i}
            className={`spark-bar contrib-cell ${level}`}
            style={{ height: `${h}px` }}
          />
        )
      })}
    </div>
  )
}

function BranchRow({
  stat,
  rank,
}: {
  stat: BranchStat
  rank: number
}) {
  const isRoot = stat.isRoot
  const isGroup = stat.isGroup
  const name = displayName(stat.name)
  const href = isRoot ? `/${ROOT_USER}` : `/${encodeURIComponent(stat.name)}`

  return (
    <tr className="anim-in" style={{ animationDelay: `${rank * 30}ms` }}>
      <td className="py-2 px-3 w-10">
        <span className={`rank-num text-sm ${rank <= 3 ? 'top' : ''}`}>
          {rank}
        </span>
      </td>

      <td className="py-2 px-3">
        <Link href={href} className="flex items-center gap-2 group">
          {/* Avatar placeholder — letter avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{
              background: isRoot
                ? 'var(--root-dim)'
                : isGroup
                ? '#1c1228'
                : 'var(--gh-surface-3)',
              border: `1px solid ${isRoot ? 'var(--root)' : isGroup ? 'var(--purple)' : 'var(--gh-border)'}`,
              color: isRoot ? 'var(--root)' : isGroup ? 'var(--purple)' : 'var(--gh-text-muted)',
            }}
          >
            {isGroup ? <IconGroup size={12} /> : name.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-[13px] group-hover:text-[var(--blue)] transition-colors"
                style={{ color: isRoot ? 'var(--root)' : 'var(--gh-text)' }}
              >
                {name}
              </span>
              {isRoot && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--root-dim)', color: 'var(--root)', border: '1px solid var(--root)' }}>
                  root
                </span>
              )}
              {isGroup && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: '#1c1228', color: 'var(--purple)', border: '1px solid var(--purple)' }}>
                  group
                </span>
              )}
            </div>
            <div className="text-[11px] text-[var(--gh-text-dim)] truncate max-w-[220px]">
              {shortMsg(stat.lastCommit.message)}
            </div>
          </div>
        </Link>
      </td>

      <td className="py-2 px-3 text-center hidden md:table-cell">
        <ActivityBar count={stat.commitCount} />
      </td>

      <td className="py-2 px-3 text-right hidden sm:table-cell">
        <span className="font-mono text-[12px] text-[var(--green)]">
          +{stat.commitCount}
        </span>
      </td>

      <td className="py-2 px-3 text-right">
        <span className="text-[11px] text-[var(--gh-text-dim)]">
          {timeAgo(stat.lastCommit.date)}
        </span>
      </td>

      <td className="py-2 px-3 text-right">
        <Link href={href} className="btn btn-default text-[11px] py-0.5 px-2">
          view
        </Link>
      </td>
    </tr>
  )
}

export default async function HomePage() {
  let stats: BranchStat[] = []
  let meta = null
  let error: string | null = null

  if (!REPO_OWNER || !REPO_NAME) {
    error = 'Set GITHUB_OWNER and GITHUB_REPO in your environment.'
  } else {
    try {
      ;[stats, meta] = await Promise.all([getAllBranchStats(), getRepoMeta()])
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'RATE_LIMIT') {
        error = 'GitHub API rate limit hit. Add GITHUB_TOKEN to your env vars.'
      } else {
        error = 'Failed to load data from GitHub.'
      }
    }
  }

  // Sort: root first, then by commit count desc, then alpha
  const sorted = [...stats].sort((a, b) => {
    if (a.isRoot) return -1
    if (b.isRoot) return 1
    return b.commitCount - a.commitCount || a.name.localeCompare(b.name)
  })

  const people  = sorted.filter(s => !s.isGroup)
  const groups  = sorted.filter(s => s.isGroup)
  const totalBranches = stats.length
  const totalCommits  = stats.reduce((n, s) => n + s.commitCount, 0)

  return (
    <div className="min-h-screen" style={{ background: 'var(--gh-bg)' }}>
      <Nav />

      {/* ── Repo header ──────────────────────────────────────────────────── */}
      <div className="gh-repo-header">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-3 flex-wrap">
            {/* Avatar - MF DOGE root */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
              style={{ background: 'var(--root-dim)', border: '1px solid var(--root)', color: 'var(--root)' }}
            >
              ⌘
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/${ROOT_USER}`}
                  className="font-mono font-semibold text-[15px] hover:text-[var(--blue)] transition-colors"
                  style={{ color: 'var(--root)' }}
                >
                  {REPO_OWNER}
                </Link>
                <span style={{ color: 'var(--gh-text-dim)' }}>/</span>
                <span className="font-mono font-semibold text-[15px]">{REPO_NAME}</span>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                  style={{ borderColor: 'var(--gh-border)', color: 'var(--gh-text-muted)', background: 'var(--gh-surface-2)' }}
                >
                  Public
                </span>
              </div>

              {meta?.description && (
                <p className="text-[13px] mt-1" style={{ color: 'var(--gh-text-muted)' }}>
                  {meta.description}
                </p>
              )}

              {/* Repo stats */}
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {meta && (
                  <>
                    <a href={`https://github.com/${REPO_OWNER}/${REPO_NAME}/stargazers`}
                      target="_blank" rel="noopener noreferrer" className="gh-stat">
                      <IconStar /> {meta.stargazers_count} stars
                    </a>
                    <a href={`https://github.com/${REPO_OWNER}/${REPO_NAME}/network/members`}
                      target="_blank" rel="noopener noreferrer" className="gh-stat">
                      <IconFork /> {meta.forks_count} forks
                    </a>
                    <a href={`https://github.com/${REPO_OWNER}/${REPO_NAME}/watchers`}
                      target="_blank" rel="noopener noreferrer" className="gh-stat">
                      <IconEye /> {meta.watchers_count} watching
                    </a>
                  </>
                )}
                <span className="gh-stat">
                  <IconBranch /> {totalBranches} branches
                </span>
                <span className="gh-stat">
                  <IconCommit /> {totalCommits} commits
                </span>
              </div>
            </div>

            {/* Primary CTA */}
            <a
              href={`https://github.com/${REPO_OWNER}/${REPO_NAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <IconFork size={13} />
              Fork &amp; join the tree
            </a>
          </div>
        </div>
      </div>

      {/* ── Hero tagline ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="flex-1 min-w-[280px]">
            <h1 className="font-display text-4xl leading-tight mb-3" style={{ color: 'var(--gh-text)', fontStyle: 'italic' }}>
              One tree.<br />
              <span style={{ color: 'var(--root)' }}>Infinite branches.</span>
            </h1>
            <p className="text-[14px] leading-relaxed" style={{ color: 'var(--gh-text-muted)' }}>
              Every branch is a person. Every group is a repo within the repo.
              Fork it. Push your <code className="text-[var(--blue)] bg-[var(--gh-surface-2)] px-1.5 py-0.5 rounded text-[12px]">index.html</code>.
              You&apos;re live. No accounts. No forms. Just git.
            </p>

            <div className="mt-4 gh-code">
              <span style={{ color: 'var(--gh-text-dim)' }}>$</span>{' '}
              <span style={{ color: 'var(--green)' }}>git clone</span>{' '}
              <span style={{ color: 'var(--blue)' }}>https://github.com/{REPO_OWNER}/{REPO_NAME}</span>
              <br />
              <span style={{ color: 'var(--gh-text-dim)' }}>$</span>{' '}
              <span style={{ color: 'var(--green)' }}>git checkout -b</span>{' '}
              <span style={{ color: 'var(--yellow)' }}>your-username</span>
              <br />
              <span style={{ color: 'var(--gh-text-dim)' }}>#</span>{' '}
              <span style={{ color: 'var(--gh-text-dim)' }}>edit index.html → be whoever you are</span>
              <br />
              <span style={{ color: 'var(--gh-text-dim)' }}>$</span>{' '}
              <span style={{ color: 'var(--green)' }}>git push origin</span>{' '}
              <span style={{ color: 'var(--yellow)' }}>your-username</span>
              <br />
              <span style={{ color: 'var(--gh-text-dim)' }}>#</span>{' '}
              <span style={{ color: 'var(--green)' }}>↳ open a PR → you&apos;re on the tree</span>
            </div>
          </div>

          {/* Quick stats panel */}
          <div className="gh-sidebar-box w-full md:w-60 shrink-0">
            <div className="gh-sidebar-box-header">📊 Tree Stats</div>
            <div className="gh-sidebar-box-body space-y-3">
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--gh-text-muted)', fontSize: '12px' }}>People</span>
                <span className="font-mono font-semibold" style={{ color: 'var(--green)' }}>
                  {people.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--gh-text-muted)', fontSize: '12px' }}>Groups</span>
                <span className="font-mono font-semibold" style={{ color: 'var(--purple)' }}>
                  {groups.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--gh-text-muted)', fontSize: '12px' }}>Total commits</span>
                <span className="font-mono font-semibold" style={{ color: 'var(--blue)' }}>
                  {totalCommits}
                </span>
              </div>
              {meta && (
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--gh-text-muted)', fontSize: '12px' }}>Stars</span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--yellow)' }}>
                    {meta.stargazers_count}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--gh-border)' }}>
                <Link
                  href="/graph"
                  className="btn btn-default w-full justify-center text-[11px]"
                >
                  <IconBranch size={12} />
                  View branch graph
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pb-16">

        {error ? (
          <div className="gh-code text-center py-8" style={{ color: 'var(--orange)' }}>
            ⚠ {error}
          </div>
        ) : (
          <>
            {/* People leaderboard */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-mono text-[13px] font-semibold flex items-center gap-2">
                  <IconBranch className="text-[var(--green)]" />
                  <span>People</span>
                  <span className="text-[var(--gh-text-dim)] font-normal">({people.length})</span>
                </h2>
                <Link href="/graph" className="text-[11px] text-[var(--blue)] hover:underline">
                  view graph →
                </Link>
              </div>

              <div style={{ border: '1px solid var(--gh-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <table className="gh-table stagger">
                  <thead>
                    <tr>
                      <th className="w-10">#</th>
                      <th>Branch / Profile</th>
                      <th className="hidden md:table-cell text-center">Activity</th>
                      <th className="hidden sm:table-cell text-right">Commits</th>
                      <th className="text-right">Updated</th>
                      <th className="text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {people.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center" style={{ color: 'var(--gh-text-dim)' }}>
                          No profiles yet. Be the first to fork and push.
                        </td>
                      </tr>
                    ) : (
                      people.map((stat, i) => (
                        <BranchRow key={stat.name} stat={stat} rank={i + 1} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Groups */}
            {groups.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="font-mono text-[13px] font-semibold flex items-center gap-2">
                    <IconGroup className="text-[var(--purple)]" />
                    <span>Groups &amp; Clubs</span>
                    <span className="text-[var(--gh-text-dim)] font-normal">({groups.length})</span>
                  </h2>
                </div>

                <div style={{ border: '1px solid var(--gh-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <table className="gh-table stagger">
                    <thead>
                      <tr>
                        <th className="w-10">#</th>
                        <th>Group</th>
                        <th className="hidden md:table-cell text-center">Activity</th>
                        <th className="hidden sm:table-cell text-right">Commits</th>
                        <th className="text-right">Updated</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map((stat, i) => (
                        <BranchRow key={stat.name} stat={stat} rank={i + 1} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}

        {/* How it works */}
        <section className="mt-12 pt-8" style={{ borderTop: '1px solid var(--gh-border-muted)' }}>
          <h2 className="font-mono text-[12px] font-semibold mb-4" style={{ color: 'var(--gh-text-muted)' }}>
            HOW IT WORKS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { step: '01', title: 'Fork the repo', desc: 'Hit the fork button on GitHub to copy the template to your account.', color: 'var(--blue)' },
              { step: '02', title: 'Create your branch', desc: 'git checkout -b your-username. This is your node on the tree.', color: 'var(--green)' },
              { step: '03', title: 'Build your profile', desc: 'Edit index.html. Full HTML/CSS/JS. Go wild. It\'s your space.', color: 'var(--yellow)' },
              { step: '04', title: 'Open a PR', desc: 'Push your branch and open a PR. Once merged, you\'re live on mybranch.fun.', color: 'var(--root)' },
            ].map(item => (
              <div
                key={item.step}
                className="p-4 rounded"
                style={{ background: 'var(--gh-surface-2)', border: '1px solid var(--gh-border)' }}
              >
                <div className="font-mono text-[11px] mb-2" style={{ color: item.color }}>{item.step}</div>
                <div className="font-mono text-[13px] font-semibold mb-1">{item.title}</div>
                <div className="text-[12px]" style={{ color: 'var(--gh-text-muted)' }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 rounded" style={{ background: 'var(--gh-surface-2)', border: '1px solid var(--gh-border)' }}>
            <p className="text-[12px]" style={{ color: 'var(--gh-text-muted)' }}>
              <span style={{ color: 'var(--root)' }}>★ Groups:</span>{' '}
              Name your branch <code className="gh-sha">group/your-group-name</code> or{' '}
              <code className="gh-sha">club/your-club-name</code> to appear in the Groups section.
              Anyone can branch off your group branch for sub-communities.
              That&apos;s a merge in real git terms — pure poetry.
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--gh-border)', background: 'var(--gh-surface)' }}>
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between flex-wrap gap-4">
          <span className="font-mono text-[11px]" style={{ color: 'var(--gh-text-dim)' }}>
            mybranch.fun · gitdev.fun · one tree · no accounts · just git
          </span>
          <span className="font-mono text-[11px]" style={{ color: 'var(--gh-text-dim)' }}>
            rooted at{' '}
            <Link href={`/${ROOT_USER}`} style={{ color: 'var(--root)' }}>
              {ROOT_USER}
            </Link>
          </span>
        </div>
      </footer>
    </div>
  )
}
