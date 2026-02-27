import { NextRequest, NextResponse } from 'next/server'

const TOKEN = process.env.GITHUB_TOKEN

function ghHeaders(): HeadersInit {
  const h: Record<string, string> = { 'User-Agent': 'mybranch.fun/1.0' }
  if (TOKEN) h['Authorization'] = `Bearer ${TOKEN}`
  return h
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function errorPage(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:'Commit Mono','JetBrains Mono',monospace;
  background:#0d1117;color:#8b949e;
  display:flex;align-items:center;justify-content:center;
  min-height:100vh;padding:2rem;text-align:center;
}
.wrap{max-width:420px}
.icon{font-size:3rem;margin-bottom:1.5rem;display:block}
h1{color:#e6edf3;font-size:1rem;font-weight:600;margin-bottom:.75rem;font-family:inherit}
p{font-size:.8rem;line-height:1.7;color:#8b949e}
code{
  display:inline-block;background:#161b22;
  border:1px solid #30363d;border-radius:4px;
  padding:1px 6px;font-size:.75rem;color:#58a6ff;
}
.sha{
  display:inline-block;margin-top:1rem;
  font-size:.7rem;color:#484f58;letter-spacing:.05em;
}
</style>
</head>
<body>
<div class="wrap">
  <span class="icon">🌿</span>
  <h1>${esc(title)}</h1>
  <p>${body}</p>
  <div class="sha">mybranch.fun</div>
</div>
</body>
</html>`
}

const SAFE = /^[a-zA-Z0-9._-]+$/

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const owner  = searchParams.get('owner')  ?? ''
  const repo   = searchParams.get('repo')   ?? ''
  const branch = searchParams.get('branch') ?? 'main'

  //if (!owner || !repo) {
  //  return new NextResponse(errorPage('Missing parameters', 'owner and repo are required.'), {
  //    status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' },
  //  })
  //}

  //if (!SAFE.test(owner) || !SAFE.test(repo) || !/^[a-zA-Z0-9._\-/]+$/.test(branch)) {
    //return new NextResponse(errorPage('Invalid parameters', 'Parameters contain disallowed characters.'), {
      //status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' },
    //})
  //}

  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/index.html`

  try {
    const res = await fetch(url, { headers: ghHeaders() })

    if (res.status === 404) {
      return new NextResponse(
        errorPage(
          'Profile not set up yet',
          `No <code>index.html</code> found on branch <code>${esc(branch)}</code>.<br><br>
           Add one to the root of your fork and push it. Full HTML/CSS/JS — make it yours.`
        ),
        { status: 200, headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        }}
      )
    }

    if (!res.ok) {
      return new NextResponse(
        errorPage('Load error', `GitHub returned HTTP ${res.status}. Try again shortly.`),
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    const html = await res.text()

  const base = `<base href="/api/profile-asset?owner=${owner}&repo=${repo}&branch=${branch}&path=">`
  const injected = html.replace('<head>', '<head>' + base)

    return new NextResponse(injected, {
  
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
        'X-Robots-Tag': 'noindex',
      },
    })
  } catch {
    return new NextResponse(
      errorPage('Network error', 'Could not reach GitHub. Please try again.'),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }
}
