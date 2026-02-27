import { NextRequest, NextResponse } from 'next/server'

const TOKEN = process.env.GITHUB_TOKEN

function ghHeaders(): HeadersInit {
  const h: Record<string, string> = { 'User-Agent': 'mybranch.fun/1.0' }
  if (TOKEN) h['Authorization'] = `Bearer ${TOKEN}`
  return h
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const owner  = searchParams.get('owner')  ?? ''
  const repo   = searchParams.get('repo')   ?? ''
  const branch = searchParams.get('branch') ?? 'main'

  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/index.html`
  const res = await fetch(url, { headers: ghHeaders() })
  const html = await res.text()

  const base = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`
  const injected = html
    .replace(/href="(?!http|\/\/|#|mailto)(.*?)"/g, `href="${base}$1"`)
    .replace(/src="(?!http|\/\/|data:)(.*?)"/g, `src="${base}$1"`)

  return new NextResponse(injected, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
}
