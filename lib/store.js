import { put, get } from '@vercel/blob';

const KEY = 'vsa/submissions.json';
// Set BLOB_ACCESS=public in env vars if you ever use a Public blob store instead.
const ACCESS = process.env.BLOB_ACCESS || 'private';

export function storageReady() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export async function readAll() {
  let res;
  try {
    res = await get(KEY, { access: ACCESS, useCache: false });
  } catch {
    res = await get(KEY, { access: ACCESS });
  }
  if (!res || !res.stream) return [];
  try {
    const text = await new Response(res.stream).text();
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function writeAll(data) {
  await put(KEY, JSON.stringify(data), {
    access: ACCESS,
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
