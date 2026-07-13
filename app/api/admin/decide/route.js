import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkToken } from '../../../../lib/auth';
import {
  readStudent, writeStudent, deleteStudent, updateIndex,
} from '../../../../lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  if (!checkToken(cookies().get('vsa_admin')?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { slug, action } = await req.json();
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

    if (action === 'delete') {
      await deleteStudent(slug);
      await updateIndex((entries) => entries.filter((x) => x.slug !== slug));
      return NextResponse.json({ ok: true });
    }

    if (!['approved', 'rejected', 'pending'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const student = await readStudent(slug);
    if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    student.status = action;
    student.decidedAt = new Date().toISOString();
    await writeStudent(student, { overwrite: true });
    await updateIndex((entries) =>
      entries.map((x) => (x.slug === slug ? { ...x, status: action } : x))
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: 'Something went wrong: ' + (e && e.message ? e.message : 'unknown error') },
      { status: 500 }
    );
  }
}
