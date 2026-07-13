import { put, get, del, head } from '@vercel/blob';

const DIR = 'vsa/students/';
const INDEX = 'vsa/index.json';
const LEGACY = 'vsa/submissions.json';
// Set BLOB_ACCESS=public in env vars if you ever use a Public blob store instead.
const ACCESS = process.env.BLOB_ACCESS || 'private';

export function storageReady() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

async function readJson(path, useCache) {
  let res;
  try {
    res = await get(path, { access: ACCESS, useCache: !!useCache });
  } catch {
    try {
      res = await get(path, { access: ACCESS });
    } catch {
      return null;
    }
  }
  if (!res || !res.stream) return null;
  try {
    return JSON.parse(await new Response(res.stream).text());
  } catch {
    return null;
  }
}

function putOpts(extra) {
  return {
    access: ACCESS,
    addRandomSuffix: false,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
    ...extra,
  };
}

export function indexEntry(s) {
  return {
    slug: s.slug,
    name: s.name,
    batch: s.batch,
    course: s.course,
    rollNumber: s.rollNumber,
    phone: s.phone,
    email: s.email,
    status: s.status,
    submittedAt: s.submittedAt,
  };
}

/* ---------- per-student records ---------- */

export async function readStudent(slug) {
  const s = await readJson(DIR + slug + '.json', true);
  if (s) return s;
  // fallback for records created before the per-student migration
  const legacy = await readJson(LEGACY, true);
  if (Array.isArray(legacy)) return legacy.find((x) => x.slug === slug) || null;
  return null;
}

export async function studentExists(slug) {
  try {
    await head(DIR + slug + '.json');
    return true;
  } catch {
    return false;
  }
}

export async function writeStudent(student, { overwrite = true } = {}) {
  await put(
    DIR + student.slug + '.json',
    JSON.stringify(student),
    putOpts({ allowOverwrite: overwrite })
  );
}

export async function deleteStudent(slug) {
  try {
    await del(DIR + slug + '.json');
  } catch {}
}

/* ---------- index (small, for the admin table) ---------- */

export async function readIndex() {
  await migrateLegacy();
  const idx = await readJson(INDEX, false);
  return Array.isArray(idx) ? idx : [];
}

// Update the index atomically: retries with ifMatch so two
// simultaneous submissions never overwrite each other's entry.
export async function updateIndex(mutate) {
  for (let attempt = 0; attempt < 6; attempt++) {
    let etag = null;
    try {
      const meta = await head(INDEX);
      etag = meta && meta.etag ? meta.etag : null;
    } catch {}
    const current = (await readJson(INDEX, false)) || [];
    const next = mutate(current.slice());
    try {
      await put(
        INDEX,
        JSON.stringify(next),
        putOpts({
          allowOverwrite: true,
          cacheControlMaxAge: 0,
          ...(etag ? { ifMatch: etag } : {}),
        })
      );
      return next;
    } catch (e) {
      if (attempt === 5) throw e;
      await new Promise((r) => setTimeout(r, 120 * (attempt + 1) + Math.random() * 250));
    }
  }
}

/* ---------- one-time migration from the old single-file format ---------- */

async function migrateLegacy() {
  const legacy = await readJson(LEGACY, false);
  if (!Array.isArray(legacy) || !legacy.length) return;
  try {
    for (const s of legacy) {
      if (!s.slug) continue;
      await writeStudent(s, { overwrite: true });
    }
    const existing = (await readJson(INDEX, false)) || [];
    const bySlug = new Map(existing.map((e) => [e.slug, e]));
    for (const s of legacy) {
      if (s.slug && !bySlug.has(s.slug)) bySlug.set(s.slug, indexEntry(s));
    }
    await put(INDEX, JSON.stringify([...bySlug.values()]), putOpts({ allowOverwrite: true, cacheControlMaxAge: 0 }));
    await del(LEGACY);
  } catch {
    // migration will retry on the next admin panel load
  }
}

export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
