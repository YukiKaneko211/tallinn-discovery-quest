import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import * as q from '../db/queries';
import type { Deco, Quiz, Spot } from '../db/schema';
import {
  distanceMeters,
  resolveFallbackPosition,
  writeLastKnown,
  type LatLng,
  type PositionSource,
} from '../lib/geo';

interface AppState {
  ready: boolean;
  spots: Spot[];
  quizzes: Quiz[];
  decos: Deco[];
  checkedInIds: Set<string>;
  completedQuizIds: Set<string>;
  unlockedDecoIds: Set<string>;
  points: number;
  position: LatLng;
  positionSource: PositionSource;
  /** Manual override used by the demo GPS simulator. */
  setSimulatedPosition: (pos: LatLng | null) => void;
  simulated: boolean;

  checkIn: (spotId: string) => Promise<number>;
  uncheckIn: (spotId: string) => Promise<void>;
  completeQuiz: (quizId: string) => Promise<number>;
  unlockDeco: (decoId: string) => Promise<boolean>;
  refreshPhotosToken: number;
  notifyPhotosChanged: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [decos, setDecos] = useState<Deco[]>([]);
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());
  const [completedQuizIds, setCompletedQuizIds] = useState<Set<string>>(new Set());
  const [unlockedDecoIds, setUnlockedDecoIds] = useState<Set<string>>(new Set());
  const [points, setPoints] = useState(0);
  const [refreshPhotosToken, setRefreshPhotosToken] = useState(0);

  const fallback = useMemo(() => resolveFallbackPosition(), []);
  const [position, setPosition] = useState<LatLng>(fallback.pos);
  const [positionSource, setPositionSource] = useState<PositionSource>(fallback.source);
  const [simulated, setSimulated] = useState(false);
  const simulatedRef = useRef(false);

  /* --------------------------------------------------------- initial load */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [sp, qz, dc, ci, cq, ud, profile] = await Promise.all([
        q.listSpots(),
        q.listQuizzes(),
        q.listDecos(),
        q.listActiveCheckInIds(),
        q.listCompletedQuizIds(),
        q.listUnlockedDecoIds(),
        q.getProfile(),
      ]);
      if (cancelled) return;
      setSpots(sp);
      setQuizzes(qz);
      setDecos(dc);
      setCheckedInIds(new Set(ci));
      setCompletedQuizIds(new Set(cq));
      setUnlockedDecoIds(new Set(ud));
      setPoints(profile.points);
      setReady(true);
    })().catch((err) => {
      console.error('[app] failed to initialise database', err);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------------ geolocation */
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (p) => {
        if (simulatedRef.current) return;
        const next = { lat: p.coords.latitude, lng: p.coords.longitude };
        setPosition(next);
        setPositionSource('gps');
        writeLastKnown(next);
      },
      () => {
        // Keep whatever fallback we resolved at start-up — the acceptance
        // criteria say to display content from the last / default position.
      },
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 12_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const setSimulatedPosition = useCallback((pos: LatLng | null) => {
    if (pos) {
      simulatedRef.current = true;
      setSimulated(true);
      setPosition(pos);
      setPositionSource('gps');
    } else {
      simulatedRef.current = false;
      setSimulated(false);
      const fb = resolveFallbackPosition();
      setPosition(fb.pos);
      setPositionSource(fb.source);
    }
  }, []);

  /* ---------------------------------------------------------------- actions */
  const checkIn = useCallback(
    async (spotId: string) => {
      const spot = spots.find((s) => s.id === spotId);
      const awarded = await q.checkIn(spotId, spot?.rewardPoints ?? 0);
      setCheckedInIds((prev) => new Set(prev).add(spotId));
      if (awarded) setPoints((p) => p + awarded);
      return awarded;
    },
    [spots],
  );

  const uncheckIn = useCallback(async (spotId: string) => {
    await q.uncheckIn(spotId);
    setCheckedInIds((prev) => {
      const next = new Set(prev);
      next.delete(spotId);
      return next;
    });
  }, []);

  const completeQuiz = useCallback(
    async (quizId: string) => {
      const quiz = quizzes.find((z) => z.id === quizId);
      const awarded = await q.completeQuiz(quizId, quiz?.rewardPoints ?? 0);
      setCompletedQuizIds((prev) => new Set(prev).add(quizId));
      if (awarded) setPoints((p) => p + awarded);
      return awarded;
    },
    [quizzes],
  );

  const unlockDeco = useCallback(
    async (decoId: string) => {
      const deco = decos.find((d) => d.id === decoId);
      if (!deco) return false;
      const ok = await q.unlockDeco(decoId, deco.costPoints);
      if (!ok) return false;
      setUnlockedDecoIds((prev) => new Set(prev).add(decoId));
      setPoints((p) => p - deco.costPoints);
      return true;
    },
    [decos],
  );

  const notifyPhotosChanged = useCallback(() => setRefreshPhotosToken((t) => t + 1), []);

  const value: AppState = {
    ready,
    spots,
    quizzes,
    decos,
    checkedInIds,
    completedQuizIds,
    unlockedDecoIds,
    points,
    position,
    positionSource,
    setSimulatedPosition,
    simulated,
    checkIn,
    uncheckIn,
    completeQuiz,
    unlockDeco,
    refreshPhotosToken,
    notifyPhotosChanged,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

/** Spots decorated with the distance from the current position, nearest first. */
export function useSpotsByDistance() {
  const { spots, position } = useApp();
  return useMemo(
    () =>
      spots
        .map((s) => ({
          spot: s,
          distance: distanceMeters(position, { lat: s.latitude, lng: s.longitude }),
        }))
        .sort((a, b) => a.distance - b.distance),
    [spots, position],
  );
}
