import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip root, API routes, static files/assets, Next.js internals
  if (
    pathname === '/' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')  // e.g. .js, .png, etc.
  ) {
    return NextResponse.next();
  }

  // Extract the branch name (first path segment)
  const segments = pathname.slice(1).split('/');
  const branch = segments[0];

  // If it's a case variation of 'MFDOGE' but not exact uppercase, redirect
  if (branch.toUpperCase() === 'MFDOGE' && branch !== 'MFDOGE') {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(branch, 'MFDOGE');  // preserves any deeper path if needed (though unlikely here)
    return NextResponse.redirect(url, 307);  // 307 = temporary (good for testing; switch to 301 for production)
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',  // run on all paths
};
