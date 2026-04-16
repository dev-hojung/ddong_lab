import { NextResponse, type NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type LabSession } from '@/lib/session';

const PUBLIC_PATHS = new Set(['/auth']);
const ADMIN_LOGIN = '/admin/login';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next internals, static assets, and API routes (they handle their own auth)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js')
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const session = await getIronSession<LabSession>(req, res, sessionOptions);

  // ── Admin routes ──
  if (pathname.startsWith('/admin')) {
    if (pathname === ADMIN_LOGIN) return res;
    if (!session.isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = ADMIN_LOGIN;
      return NextResponse.redirect(url);
    }
    return res;
  }

  // ── Public auth page ──
  if (PUBLIC_PATHS.has(pathname)) return res;

  // ── Everything else requires a user session (phone) or admin ──
  if (!session.phone && !session.isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
