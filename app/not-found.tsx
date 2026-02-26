import Link from 'next/link'
import Nav from '@/components/Nav'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--gh-bg)', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div className="font-mono" style={{ fontSize: '4rem', color: 'var(--gh-text-dim)', lineHeight: 1, marginBottom: '1rem' }}>
            404
          </div>
          <h1 className="font-display" style={{ fontSize: '1.5rem', fontStyle: 'italic', marginBottom: '.75rem', color: 'var(--gh-text)' }}>
            Branch not found.
          </h1>
          <p style={{ color: 'var(--gh-text-muted)', fontSize: '13px', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            This branch doesn&apos;t exist on the tree yet — or it was pruned.
            If you&apos;re trying to join, open a PR from your fork.
          </p>
          <div className="gh-code" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--gh-text-dim)' }}>$</span>{' '}
            <span style={{ color: 'var(--orange)' }}>fatal</span>
            <span style={{ color: 'var(--gh-text-dim)' }}>: branch not found on remote</span>
            <br />
            <span style={{ color: 'var(--gh-text-dim)' }}>hint</span>
            <span style={{ color: 'var(--gh-text-dim)' }}>: push your branch and open a PR to join</span>
          </div>
          <Link href="/" className="btn btn-primary">
            ← Back to the tree
          </Link>
        </div>
      </div>
    </div>
  )
}
