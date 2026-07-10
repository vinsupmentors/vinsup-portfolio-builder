import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkToken } from '../../../../lib/auth';
import { readAll, writeAll } from '../../../../lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  if (!checkToken(cookies().get('vsa_admin')?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, action } = await req.json();
    const all = await readAll();
    const i = all.findIndex((s) => s.id === id);
    if (i === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (action === 'delete') {
      all.splice(i, 1);
    } else if (['approved', 'rejected', 'pending'].includes(action)) {
      all[i].status = action;
      all[i].decidedAt = new Date().toISOString();
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    await writeAll(all);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
