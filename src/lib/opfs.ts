/**
 * Photo binaries live in the Origin Private File System, never in PGlite.
 * The database only ever stores the key returned by `savePhoto`.
 */

const DIR = 'photos';

const memoryFallback = new Map<string, Blob>();
let opfsAvailable: boolean | null = null;

async function dir(): Promise<FileSystemDirectoryHandle | null> {
  if (opfsAvailable === false) return null;
  try {
    const root = await navigator.storage.getDirectory();
    const handle = await root.getDirectoryHandle(DIR, { create: true });
    opfsAvailable = true;
    return handle;
  } catch {
    // Private-mode Safari and a few embedded webviews have no OPFS. The app
    // keeps working for the session; photos just are not persisted.
    opfsAvailable = false;
    console.warn('[opfs] unavailable — photos will be kept in memory only');
    return null;
  }
}

export function newPhotoKey(id: string, ext = 'png') {
  return `${DIR}/${id}.${ext}`;
}

export async function savePhoto(key: string, blob: Blob): Promise<void> {
  const d = await dir();
  if (!d) {
    memoryFallback.set(key, blob);
    return;
  }
  const name = key.split('/').pop() as string;
  const file = await d.getFileHandle(name, { create: true });
  const writable = await file.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function readPhoto(key: string): Promise<Blob | null> {
  const d = await dir();
  if (!d) return memoryFallback.get(key) ?? null;
  try {
    const name = key.split('/').pop() as string;
    const handle = await d.getFileHandle(name);
    return await handle.getFile();
  } catch {
    return null;
  }
}

export async function deletePhotoFile(key: string): Promise<void> {
  const d = await dir();
  if (!d) {
    memoryFallback.delete(key);
    return;
  }
  try {
    await d.removeEntry(key.split('/').pop() as string);
  } catch {
    /* already gone */
  }
}

/* ---------------------------------------------------- object URL cache --- */

const urlCache = new Map<string, string>();

/** Resolves an OPFS key to a blob: URL, caching the result for the session. */
export async function photoUrl(key: string): Promise<string | null> {
  const cached = urlCache.get(key);
  if (cached) return cached;
  const blob = await readPhoto(key);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(key, url);
  return url;
}

/** Drops a cached URL — call after overwriting a photo so the UI re-reads it. */
export function invalidatePhotoUrl(key: string) {
  const url = urlCache.get(key);
  if (url) URL.revokeObjectURL(url);
  urlCache.delete(key);
}
