import Link from 'next/link'
import { REPO_OWNER, REPO_NAME, ROOT_USER } from '@/lib/github'

interface NavProps {
  crumbs?: { label: string; href?: string }[]
}

export default function Nav({ crumbs }: NavProps) {
  return (
    <nav className="gh-nav">
      {/* Logo / home */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
          <circle cx="10" cy="8" r="3" fill="#ffd700"/>
          <circle cx="10" cy="24" r="3" fill="#39d353"/>
          <circle cx="22" cy="14" r="3" fill="#58a6ff"/>
          <line x1="10" y1="11" x2="10" y2="21" stroke="#484f58" strokeWidth="2"/>
          <path d="M10 13 Q10 14 22 14" stroke="#484f58" strokeWidth="2" fill="none"/>
        </svg>
        <span className="font-mono text-[13px] text-[var(--gh-text)] font-semibold tracking-tight hidden sm:block">
          mybranch.fun
        </span>
      </Link>

      {/* Breadcrumb */}
      {crumbs && crumbs.length > 0 && (
        <div className="flex items-center gap-1 text-[13px] text-[var(--gh-text-muted)] overflow-hidden">
          <span className="text-[var(--gh-text-dim)]">/</span>
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1 truncate">
              {c.href ? (
                <Link href={c.href} className="hover:text-[var(--blue)] transition-colors truncate">
                  {c.label}
                </Link>
              ) : (
                <span className="text-[var(--gh-text)] font-semibold truncate">{c.label}</span>
              )}
              {i < crumbs.length - 1 && <span className="text-[var(--gh-text-dim)]">/</span>}
            </span>
          ))}
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        {/* Link to actual GitHub repo */}
        <a
          href={`https://github.com/${REPO_OWNER}/${REPO_NAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-default text-[11px]"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          {REPO_OWNER}/{REPO_NAME}
        </a>

        {/* Join CTA */}
        <a
          href={`https://github.com/${REPO_OWNER}/${REPO_NAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary text-[11px]"
        >
          + Join the tree
        </a>
      </div>
    </nav>
  )
}
