import { useEffect, useState } from 'react';

import type { Photo } from '../db/schema';
import { photoUrl } from '../lib/opfs';

/** Resolves OPFS keys to blob URLs for a list of photo rows. */
export function usePhotoUrls(photos: Photo[]): Record<string, string> {
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        photos.map(async (p) => [p.id, await photoUrl(p.imagePath)] as const),
      );
      if (cancelled) return;
      const next: Record<string, string> = {};
      for (const [id, url] of entries) if (url) next[id] = url;
      setUrls(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [photos]);

  return urls;
}
