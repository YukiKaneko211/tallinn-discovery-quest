import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FRAMES, LANDMARKS } from './data';
import type { PhotoFrame } from './types';

export interface LandmarkProgress {
  /** Whether the user has stamped (checked in) at this landmark. */
  stamped: boolean;
  /** Whether the trivia for this landmark was answered correctly. */
  triviaCorrect: boolean;
}

interface RallyState {
  progress: Record<string, LandmarkProgress>;
  triviaPoints: number;
  /** Frame currently chosen in the souvenir screen. */
  selectedFrameId: string;
  hasHydrated: boolean;

  // actions
  stampLandmark: (id: string) => void;
  answerTrivia: (id: string, points: number) => void;
  selectFrame: (id: string) => void;
  setHasHydrated: (value: boolean) => void;
  reset: () => void;
}

function emptyProgress(): Record<string, LandmarkProgress> {
  return Object.fromEntries(LANDMARKS.map((l) => [l.id, { stamped: false, triviaCorrect: false }]));
}

export const useRallyStore = create<RallyState>()(
  persist(
    (set) => ({
      progress: emptyProgress(),
      triviaPoints: 0,
      selectedFrameId: FRAMES[0].id,
      hasHydrated: false,

      stampLandmark: (id) =>
        set((state) => {
          const existing = state.progress[id];
          if (existing?.stamped) return state;
          return {
            progress: {
              ...state.progress,
              [id]: { stamped: true, triviaCorrect: existing?.triviaCorrect ?? false },
            },
          };
        }),

      answerTrivia: (id, points) =>
        set((state) => {
          const existing = state.progress[id];
          if (existing?.triviaCorrect) return state;
          return {
            progress: {
              ...state.progress,
              [id]: { stamped: existing?.stamped ?? false, triviaCorrect: true },
            },
            triviaPoints: state.triviaPoints + points,
          };
        }),

      selectFrame: (id) => set({ selectedFrameId: id }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      reset: () =>
        set({
          progress: emptyProgress(),
          triviaPoints: 0,
          selectedFrameId: FRAMES[0].id,
        }),
    }),
    {
      name: 'tallinn-stamp-rally',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        progress: state.progress,
        triviaPoints: state.triviaPoints,
        selectedFrameId: state.selectedFrameId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

// ---------------------------------------------------------------------------
// Selectors / derived helpers
// ---------------------------------------------------------------------------

export function stampCount(progress: Record<string, LandmarkProgress>): number {
  return Object.values(progress).filter((p) => p.stamped).length;
}

export function isFrameUnlocked(frame: PhotoFrame, stamps: number, points: number): boolean {
  if (frame.unlock.type === 'stamps') return stamps >= frame.unlock.threshold;
  return points >= frame.unlock.threshold;
}
