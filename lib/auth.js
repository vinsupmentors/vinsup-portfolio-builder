import crypto from 'crypto';

const SECRET = process.env.ADMIN_SECRET || 'vsa-change-this-secret-2026';
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'cpmadhu24@gmail.com').toLowerCase();
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Vinsup@2026';

export function makeToken() {
  const exp = Date.now() + 12 * 3600 * 1000; // 12 hours
  const sig = crypto.createHmac('sha256', SECRET).update(String(exp)).digest('hex');
  return exp + '.' + sig;
}

export function checkToken(t) {
  if (!t) return false;
  const [exp, sig] = String(t).split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const good = crypto.createHmac('sha256', SECRET).update(String(exp)).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good));
  } catch {
    return false;
  }
}
