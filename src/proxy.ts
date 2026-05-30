import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // 1. Refresh Supabase token session first (crucial to run on every request)
  const { supabaseResponse, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname;

  // Extract locale from path if present
  const pathnameHasLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  let currentLocale = 'en';
  if (pathnameHasLocale) {
    currentLocale = pathname.split('/')[1];
  }

  // Remove locale prefix to check logical routes
  const logicalPath = pathnameHasLocale
    ? pathname.replace(new RegExp(`^/(${routing.locales.join('|')})`), '')
    : pathname;

  const isAuthPage = logicalPath.startsWith('/login') || logicalPath.startsWith('/signup');
  const isDashboardPage = logicalPath.startsWith('/dashboard');

  // If user is authenticated and trying to visit login/signup or root, redirect to dashboard
  if (user && (isAuthPage || logicalPath === '/' || logicalPath === '')) {
    return NextResponse.redirect(new URL(`/${currentLocale}/dashboard`, request.url));
  }

  // If user is NOT authenticated and trying to visit dashboard, redirect to login
  if (!user && isDashboardPage) {
    return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url));
  }

  // 2. Apply next-intl middleware for routing/localization redirects
  const response = await intlMiddleware(request);

  // 3. Sync Supabase response cookies (which contain the updated auth token) into the final response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, {
      path: cookie.path,
      domain: cookie.domain,
      maxAge: cookie.maxAge,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      httpOnly: cookie.httpOnly,
    });
  });

  return response;
}

export const config = {
  // Match all pathnames except for api, static assets, and images
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
