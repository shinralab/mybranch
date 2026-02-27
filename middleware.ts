import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip if not a branch profile path (e.g. /api, /_next, root /)
  if (pathname === '/' || !pathname.startsWith('/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const branch = pathname.slice(1); // e.g. 'mfdoge' or 'MFDOGE'

  // If it's any casing of 'MFDOGE', redirect to uppercase version
  if (branch.toUpperCase() === 'MFDOGE' && branch !== 'MFDOGE') {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.pathname = '/MFDOGE';
    return NextResponse.redirect(canonicalUrl, 301); // permanent redirect
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*', // apply to all paths
};
