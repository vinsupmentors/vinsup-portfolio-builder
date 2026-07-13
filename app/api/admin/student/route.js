import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkToken } from '../../../../lib/auth';
import { readStudent } from '../../../../lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  if (!checkToken(cookies().get('vsa_admin')?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  const student = await readStudent(slug);
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ student });
}
