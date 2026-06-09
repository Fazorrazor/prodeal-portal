import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If trying to access /admin routes (except login) and no session exists
  if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/admin/login')) {
    if (!session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin/login';
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If trying to access /admin/login but already logged in
  if (req.nextUrl.pathname.startsWith('/admin/login')) {
    if (session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
