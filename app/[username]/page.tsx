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
  params: Promise<{ username: string }>
  searchParams: Promise<{ branch?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const name = decodeURIComponent(username)
  return {
    title: `${displayName(name)} · mybranch.fun`,
    description: `${displayName(name)}'s profile on mybranch.fun`,
  }
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const branchName = decodeURIComponent(username)

  const isRoot = branchName.toLowerCase() === ROOT_USER.toLowerCase()

  if (!isRoot && isReservedName(branchName)) {
    notFound()
  }

  const branchData = await getBranch(branchName)
  if (!branchData) {
    notFound()
  }

  const [allBranches, commits] = await Promise.all([
    getAllBranches(),
    getCommits(branchName, 20),
  ])

  const isGroup = branchName.startsWith('group/') || branchName.startsWith('club/')
  const username2 = displayName(branchName)
  const lastUpdated = commits[0] ? timeAgo(commits[0].commit.author.date) : 'unknown'

  const commitsForClient = commits.map(c => ({
    sha: c.sha,
    message: c.commit.message.split('\n')[0].slice(0, 72),
    date: c.commit.author.date,
    authorLogin: c.author?.login ?? null,
  }))

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav crumbs={[{ label: `${REPO_OWNER}/${REPO_NAME}`, href: '/' }, { label: username2 }]} />
      <ProfileClient
        username={username2}
        branchName={branchName}
        isRoot={isRoot}
        isGroup={isGroup}
        repoOwner={REPO_OWNER}
        repoName={REPO_NAME}
        templateOwner={REPO_OWNER}
        templateRepo={REPO_NAME}
        branches={allBranches.map(b => ({ name: b.name }))}
        currentBranch={branchName}
        commits={commitsForClient}
        lastUpdated={lastUpdated}
      />
    </div>
  )
}
