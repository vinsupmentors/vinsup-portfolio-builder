import { NextResponse } from 'next/server';
import { makeToken, ADMIN_EMAIL, ADMIN_PASSWORD } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { email, password } = await req.json();
  if (String(email || '').toLowerCase().trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set('vsa_admin', makeToken(), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 43200,
    });
    return res;
  }
  return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('vsa_admin', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
