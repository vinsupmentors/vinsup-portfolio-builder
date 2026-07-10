import { put, list } from '@vercel/blob';

const KEY = 'vsa/submissions.json';

export function storageReady() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export async function readAll() {
  const { blobs } = await list({ prefix: KEY });
  const blob = blobs.find((b) => b.pathname === KEY) || blobs[0];
  if (!blob) return [];
  const res = await fetch(blob.url + '?t=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) return [];
  try {
    return await res.json();
  } catch {
    return [];
  }
}

export async function writeAll(data) {
  await put(KEY, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 0,
  });
}

export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
