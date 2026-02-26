import { NextResponse } from 'next/server'
import { getAllBranchStats } from '@/lib/github'

export async function GET() {
  try {
    const stats = await getAllBranchStats()
    return NextResponse.json(stats, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' }
    })
  } catch {
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
