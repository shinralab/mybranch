import { NextRequest, NextResponse } from 'next/server'

const TOKEN = process.env.GITHUB_TOKEN

function ghHeaders(): HeadersInit {
  const h: Record<string, string> = { 'User-Agent': 'mybranch.fun/1.0' }
  if (TOKEN) h['Authorization'] = `Bearer ${TOKEN}`
  return h
}

const MIME: Record<string, string> = {
  css: 'text/css', js: 'application/javascript',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp',
  ico: 'image/x-icon', woff: 'font/woff', woff2: 'font/woff2',
  ttf: 'font/ttf', otf: 'font/otf', json: 'application/json',
  txt: 'text/plain', mp3: 'audio/mpeg', ogg: 'audio/ogg',
  mp4: 'video/mp4', webm: 'video/webm',
}

const SAFE      = /^[a-zA-Z0-9._-]+$/
const SAFE_PATH = /^[a-zA-Z0-9._\-/]+$/

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const owner  = searchParams.get('owner')  ?? ''
  const repo   = searchParams.get('repo')   ?? ''
  const branch = searchParams.get('branch') ?? 'main'
  const path   = searchParams.get('path')   ?? ''

  if (!owner || !repo || !path) {
    return new NextResponse('Missing parameters', { status: 400 })
  }

  if (
    !SAFE.test(owner) || !SAFE.test(repo) ||
    !/^[a-zA-Z0-9._\-/]+$/.test(branch) ||
    !SAFE_PATH.test(path) || path.includes('..')
  ) {
    return new NextResponse('Invalid parameters', { status: 400 })
  }

  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`

  try {
    const res = await fetch(url, { headers: ghHeaders() })
    if (!res.ok) return new NextResponse('Not found', { status: 404 })

    const ext  = path.split('.').pop()?.toLowerCase() ?? ''
    const mime = MIME[ext] ?? 'application/octet-stream'
    const buf  = await res.arrayBuffer()

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    })
  } catch {
    return new NextResponse('Fetch error', { status: 502 })
  }
}
