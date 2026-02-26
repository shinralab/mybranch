'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { IconBranch, IconCommit } from '@/components/BranchIcon'

interface Commit {
  sha: string
  message: string
  date: string
  authorLogin: string | null
}

interface ProfileClientProps {
  username: string
  branchName: string
  isRoot: boolean
  isGroup: boolean
  repoOwner: string
  repoName: string
  templateOwner: string
  templateRepo: string
  branches: { name: string }[]
  currentBranch: string
  commits: Commit[]
  lastUpdated: string
}

export default function ProfileClient({
  username,
  branchName,
  isRoot,
  isGroup,
  repoOwner,
  repoName,
  branches,
  currentBranch: initialBranch,
  commits,
  lastUpdated,
}: ProfileClientProps) {
  const [branch, setBranch] = useState(initialBranch)
  const [dropOpen, setDropOpen] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  const iframeSrc = `/api/profile-html?owner=${encodeURIComponent(repoOwner)}&repo=${encodeURIComponent(repoName)}&branch=${encodeURIComponent(branch)}`

  const selectBranch = useCallback((b: string) => {
    setBranch(b)
    setDropOpen(false)
    setIframeLoaded(false)
    setIframeKey(k => k + 1)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropOpen) return
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('[data-branch-dropdown]')) setDropOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [dropOpen])

  const displayBranch = branch.replace(/^(group|club)\//, '')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)' }}>

      {/* ── Repo-style header ──────────────────────────────────────────── */}
      <div style={{ background: 'var(--gh-surface)', borderBottom: '1px solid var(--gh-border)', flexShrink: 0 }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 flex-wrap">

            {/* Branch identity */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{
                  background: isRoot ? 'var(--root-dim)' : isGroup ? '#1c1228' : 'var(--gh-surface-3)',
                  border: `1px solid ${isRoot ? 'var(--root)' : isGroup ? 'var(--purple)' : 'var(--gh-border)'}`,
                  color: isRoot ? 'var(--root)' : isGroup ? 'var(--purple)' : 'var(--gh-text-muted)',
                }}
              >
                {username.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link
                    href="/"
                    className="font-mono text-[13px] hover:text-[var(--blue)] transition-colors"
                    style={{ color: 'var(--gh-text-muted)' }}
                  >
                    {repoOwner}/{repoName}
                  </Link>
                  <span style={{ color: 'var(--gh-text-dim)' }}>@</span>
                  <span
                    className="font-mono font-semibold text-[13px]"
                    style={{ color: isRoot ? 'var(--root)' : isGroup ? 'var(--purple)' : 'var(--green)' }}
                  >
                    {displayBranch}
                  </span>
                  {isRoot && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--root-dim)', color: 'var(--root)', border: '1px solid var(--root)' }}>
                      ★ root
                    </span>
                  )}
                  {isGroup && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ background: '#1c1228', color: 'var(--purple)', border: '1px solid var(--purple)' }}>
                      group
                    </span>
                  )}
                </div>
                <div className="text-[11px] flex items-center gap-2 mt-0.5" style={{ color: 'var(--gh-text-dim)' }}>
                  <IconCommit size={11} />
                  Last updated {lastUpdated}
                </div>
              </div>
            </div>

            {/* Branch switcher */}
            <div className="relative" data-branch-dropdown>
              <button
                onClick={() => setDropOpen(o => !o)}
                className="btn btn-default flex items-center gap-2"
                style={{ fontSize: '12px' }}
              >
                <IconBranch size={12} />
                <span className="font-mono">{displayBranch}</span>
                <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'var(--gh-text-dim)' }}>
                  <path d="M4.427 7.427l3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427z"/>
                </svg>
              </button>

              {dropOpen && (
                <div
                  style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 4px)',
                    background: 'var(--gh-surface-2)', border: '1px solid var(--gh-border)',
                    borderRadius: 'var(--radius)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    zIndex: 200, minWidth: '200px', maxHeight: '280px', overflowY: 'auto',
                  }}
                >
                  <div style={{ padding: '8px', borderBottom: '1px solid var(--gh-border)', fontSize: '11px', color: 'var(--gh-text-dim)' }}>
                    Switch branch
                  </div>
                  {branches.map(b => (
                    <button
                      key={b.name}
                      onClick={() => selectBranch(b.name)}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-[var(--gh-surface-3)] transition-colors"
                      style={{ fontSize: '12px', color: b.name === branch ? 'var(--green)' : 'var(--gh-text)' }}
                    >
                      {b.name === branch && (
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/>
                        </svg>
                      )}
                      {b.name !== branch && <span style={{ width: 10 }} />}
                      <span className="font-mono truncate">{b.name.replace(/^(group|club)\//, '')}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* External links */}
            <a
              href={`https://github.com/${repoOwner}/${repoName}/tree/${encodeURIComponent(branch)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-default"
              style={{ fontSize: '11px' }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div className="gh-tabs" style={{ flexShrink: 0 }}>
        <span className="gh-tab active">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8V1.5Z"/>
          </svg>
          Profile
        </span>
        <a
          href={`https://github.com/${repoOwner}/${repoName}/commits/${encodeURIComponent(branch)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="gh-tab"
        >
          <IconCommit size={14} />
          Commits
          <span style={{
            background: 'var(--gh-surface-3)', border: '1px solid var(--gh-border)',
            borderRadius: '20px', padding: '0 6px', fontSize: '11px', color: 'var(--gh-text-muted)'
          }}>
            {commits.length}+
          </span>
        </a>
        <a
          href={`https://github.com/${repoOwner}/${repoName}/network/members`}
          target="_blank"
          rel="noopener noreferrer"
          className="gh-tab"
        >
          <IconBranch size={14} />
          Forks
        </a>
      </div>

      {/* ── Main: iframe + sidebar ────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', gap: 0 }}>

        {/* Profile iframe — the MySpace canvas */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '12px', background: 'var(--gh-surface)' }}>
          <div
            className="profile-shell"
            style={{ height: '100%', position: 'relative' }}
          >
            {/* Loading shimmer */}
            {!iframeLoaded && (
              <div style={{
                position: 'absolute', inset: 0, background: 'var(--gh-surface-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10, borderRadius: 'var(--radius)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="pulse-slow font-mono text-[12px]" style={{ color: 'var(--gh-text-dim)' }}>
                    loading profile<span className="cursor" />
                  </div>
                </div>
              </div>
            )}

            <iframe
              key={iframeKey}
              src={iframeSrc}
              sandbox="allow-scripts"
              referrerPolicy="no-referrer"
              className="profile-frame"
              title={`${username} profile`}
              onLoad={() => setIframeLoaded(true)}
              style={{ height: '100%' }}
            />
          </div>
        </div>

        {/* Sidebar — git info panel */}
        <div style={{
          width: '240px', flexShrink: 0, overflowY: 'auto',
          background: 'var(--gh-bg)', borderLeft: '1px solid var(--gh-border)',
          padding: '12px',
        }}>
          {/* Recent commits */}
          <div className="gh-sidebar-box">
            <div className="gh-sidebar-box-header">Recent commits</div>
            <div style={{ padding: '8px 0' }}>
              {commits.length === 0 ? (
                <p style={{ padding: '8px 12px', color: 'var(--gh-text-dim)', fontSize: '11px' }}>
                  No commits yet
                </p>
              ) : (
                commits.slice(0, 8).map(c => (
                  <a
                    key={c.sha}
                    href={`https://github.com/${repoOwner}/${repoName}/commit/${c.sha}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 hover:bg-[var(--gh-surface-2)] transition-colors"
                  >
                    <div style={{ fontSize: '11px', color: 'var(--gh-text)', marginBottom: '2px' }} className="truncate">
                      {c.message}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--gh-text-dim)' }} className="flex items-center gap-1">
                      <span className="gh-sha" style={{ fontSize: '10px' }}>{c.sha.slice(0, 7)}</span>
                      {c.authorLogin && <span>{c.authorLogin}</span>}
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Branches on this repo */}
          <div className="gh-sidebar-box">
            <div className="gh-sidebar-box-header">Branches ({branches.length})</div>
            <div style={{ padding: '8px 0', maxHeight: '200px', overflowY: 'auto' }}>
              {branches.slice(0, 20).map(b => (
                <button
                  key={b.name}
                  onClick={() => selectBranch(b.name)}
                  className="w-full text-left px-3 py-1.5 hover:bg-[var(--gh-surface-2)] transition-colors flex items-center gap-1.5"
                >
                  <IconBranch size={11} className="text-[var(--gh-text-dim)] shrink-0" />
                  <span
                    className="font-mono truncate"
                    style={{
                      fontSize: '11px',
                      color: b.name === branch ? 'var(--green)' : 'var(--gh-text-muted)',
                    }}
                  >
                    {b.name.replace(/^(group|club)\//, '')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="gh-sidebar-box">
            <div className="gh-sidebar-box-header">About</div>
            <div className="gh-sidebar-box-body">
              <p style={{ fontSize: '11px', color: 'var(--gh-text-muted)', lineHeight: 1.6 }}>
                This is a profile branch on the mybranch.fun tree.
                The content above is served from{' '}
                <code style={{ fontSize: '10px', color: 'var(--blue)' }}>index.html</code>{' '}
                on branch{' '}
                <code style={{ fontSize: '10px', color: 'var(--green)' }}>{displayBranch}</code>.
              </p>
              <div className="mt-3">
                <Link
                  href="/"
                  className="btn btn-default w-full justify-center"
                  style={{ fontSize: '11px' }}
                >
                  ← All profiles
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
