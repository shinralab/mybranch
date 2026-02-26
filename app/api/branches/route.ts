import { NextRequest, NextResponse } from 'next/server'
import { getAllBranches } from '@/lib/github'

export async function GET(_req: NextRequest) {
  try {
    const branches = await getAllBranches()
    return NextResponse.json(
      branches.map(b => ({ name: b.name })),
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    )
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
