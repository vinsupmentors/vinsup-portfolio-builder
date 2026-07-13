import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkToken } from '../../../../lib/auth';
import { readIndex, storageReady } from '../../../../lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!checkToken(cookies().get('vsa_admin')?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!storageReady()) {
    return NextResponse.json({
      submissions: [],
      warning:
        'Storage is not connected yet. In the Vercel dashboard open this project → Storage → Create a Blob store and connect it, then redeploy.',
    });
  }
  try {
    const all = await readIndex();
    all.sort((a, b) => String(b.submittedAt || '').localeCompare(String(a.submittedAt || '')));
    return NextResponse.json({ submissions: all });
  } catch {
    return NextResponse.json({ submissions: [], warning: 'Could not read storage. Check the Blob store connection.' });
  }
}
