import { NextResponse, type NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type LabSession } from '@/lib/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';

const PUBLIC_PATHS = new Set(['/auth']);
const ADMIN_LOGIN = '/admin/login';

/**
 * Re-check `allowed_phones` at most once per this interval per session.
 * Prevents a Supabase round-trip on every navigation while still enforcing
 * admin revocations within a bounded window.
 */
const REVALIDATION_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

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

  // ── Verify phone still in whitelist (revoke access if admin removed the number) ──
  // Cached per session via `lastCheckedAt` to avoid hitting Supabase on every navigation.
  if (session.phone && !session.isAdmin) {
    const now = Date.now();
    const needsRevalidation =
      !session.lastCheckedAt || now - session.lastCheckedAt > REVALIDATION_INTERVAL_MS;

    if (needsRevalidation) {
      try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
          .from('allowed_phones')
          .select('phone')
          .eq('phone', session.phone)
          .maybeSingle();

        if (error) {
          // Fail-open on transient DB errors but log loudly so silent outages
          // don't become a silent "open to all" security posture.
          console.error(
            '[proxy] allowed_phones revalidation failed; session permitted without re-check.',
            { phone: session.phone, error: error.message },
          );
        } else if (!data) {
          // Phone was removed from whitelist — destroy session
          session.destroy();
          const url = req.nextUrl.clone();
          url.pathname = '/auth';
          return NextResponse.redirect(url);
        } else {
          // Revalidated successfully — stamp the cookie so we skip the next N minutes.
          session.lastCheckedAt = now;
          await session.save();
        }
      } catch (err) {
        console.error(
          '[proxy] allowed_phones revalidation threw; session permitted without re-check.',
          { phone: session.phone, err },
        );
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
