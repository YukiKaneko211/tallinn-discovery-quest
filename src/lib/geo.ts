export interface LatLng {
  lat: number;
  lng: number;
}

/** Acceptance criteria: default position when no GPS and no stored history. */
export const TALLINN_CITY_HALL: LatLng = { lat: 59.4372, lng: 24.7453 };

const LAST_POS_KEY = 'tsr:last-position';

export type PositionSource = 'gps' | 'last-known' | 'default';

export function readLastKnown(): LatLng | null {
  try {
    const raw = localStorage.getItem(LAST_POS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LatLng;
    if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') return parsed;
  } catch {
    /* ignore corrupt value */
  }
  return null;
}

export function writeLastKnown(pos: LatLng) {
  try {
    localStorage.setItem(LAST_POS_KEY, JSON.stringify(pos));
  } catch {
    /* storage full or blocked */
  }
}

/**
 * Resolves the position to display content for:
 * live GPS → last stored position → Tallinn City Hall.
 */
export function resolveFallbackPosition(): { pos: LatLng; source: PositionSource } {
  const last = readLastKnown();
  if (last) return { pos: last, source: 'last-known' };
  return { pos: TALLINN_CITY_HALL, source: 'default' };
}

const R = 6_371_000; // metres

/** Great-circle distance in metres. */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m / 10) * 10}m away`;
  return `${(m / 1000).toFixed(1)}km away`;
}

/** Radius that activates the quick check-in button (PRD: 200m). */
export const CHECKIN_RADIUS_M = 200;
/** Radius of the "Nearby Spots" list (PRD: 1km). */
export const NEARBY_RADIUS_M = 1000;
