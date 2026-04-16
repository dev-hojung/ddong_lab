import type { SessionOptions } from 'iron-session';

export type LabSession = {
  phone?: string;      // Normalized digits-only phone (01012345678)
  isAdmin?: boolean;   // Set by admin password flow
  issuedAt?: number;   // ms epoch
};

const SEVEN_DAYS = 60 * 60 * 24 * 7;

export const sessionOptions: SessionOptions = {
  cookieName: 'bearstein_session',
  password: process.env.SESSION_SECRET || 'dev-only-insecure-secret-please-replace-in-prod-0123456789',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: SEVEN_DAYS,
    path: '/',
  },
};

/** Normalize a phone number to digits only (01012345678). */
export function normalizePhone(raw: string): string {
  return raw.replace(/\D+/g, '');
}

/** Format a digits-only phone for display: 01012345678 → 010-1234-5678 */
export function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, '');
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return d;
}

/** Valid Korean mobile: 01X-XXXX-XXXX, 10 or 11 digits after normalize. */
export function isValidKoreanMobile(digits: string): boolean {
  return /^01[016789]\d{7,8}$/.test(digits);
}
