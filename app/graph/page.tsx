import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import GraphClient from './GraphClient'
import { getAllBranchStats, REPO_OWNER, REPO_NAME, ROOT_USER } from '@/lib/github'

export const metadata: Metadata = { title: 'Branch Graph · mybranch.fun' }
export const revalidate = 120

export default async function GraphPage() {
  const stats = await getAllBranchStats().catch(() => [])

  const nodes = stats.map(s => ({
    id: s.name,
    label: s.name.replace(/^(group|club)\//, ''),
    isRoot: s.isRoot,
    isGroup: s.isGroup,
    commitCount: s.commitCount,
    lastUpdated: s.lastCommit.date,
    href: s.isRoot ? `/${ROOT_USER}` : `/${encodeURIComponent(s.name)}`,
  }))

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gh-bg)' }}>
      <Nav crumbs={[
        { label: `${REPO_OWNER}/${REPO_NAME}`, href: '/' },
        { label: 'graph' },
      ]} />
      <GraphClient nodes={nodes} rootUser={ROOT_USER} />
    </div>
  )
}
