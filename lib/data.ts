import type { Landmark, PhotoFrame, QuizRank } from './types';

/**
 * Mock Tallinn landmarks. distanceKm simulates the user's current position so the
 * dashboard can sort closest → farthest without real GPS (hackathon scope).
 */
export const LANDMARKS: Landmark[] = [
  {
    id: 'viru-gate',
    name: 'Viru Gate',
    shortName: 'Viru Gate',
    tagline: 'The medieval gateway to Old Town',
    description:
      'The twin towers of Viru Gate once guarded the eastern entrance to Tallinn. Today they are the most photographed doorway into the cobbled streets of the Old Town.',
    distanceKm: 0.2,
    latitude: 59.4372,
    longitude: 24.7536,
    trivia: {
      question: 'Look up as you pass through Viru Gate — how many round towers stand guard here?',
      answers: ['2', 'two'],
      points: 10,
      funFact: 'The two towers date back to the 14th century and are part of the old city wall.',
    },
  },
  {
    id: 'town-hall-square',
    name: 'Town Hall Square',
    shortName: 'Raekoja Plats',
    tagline: 'The beating heart of the Old Town',
    description:
      'Raekoja plats has been a market and meeting place for over 800 years. The Gothic Town Hall on its edge is the oldest in Northern Europe.',
    distanceKm: 0.6,
    latitude: 59.4372,
    longitude: 24.7453,
    trivia: {
      question: 'A weather vane tops the Town Hall tower. Which old guardian of Tallinn is it?',
      answers: ['old thomas', 'thomas', 'vana toomas'],
      points: 20,
      funFact: 'Old Thomas (Vana Toomas) has watched over the square since 1530.',
    },
  },
  {
    id: 'alexander-nevsky',
    name: 'Alexander Nevsky Cathedral',
    shortName: 'Nevsky',
    tagline: 'Onion domes over Toompea Hill',
    description:
      'Perched atop Toompea Hill, this ornate Russian Orthodox cathedral is famous for its black onion domes and richly decorated facade.',
    distanceKm: 1.1,
    latitude: 59.4358,
    longitude: 24.7385,
    trivia: {
      question: 'Count the large onion domes crowning the cathedral — how many are there?',
      answers: ['5', 'five'],
      points: 20,
      funFact: 'Five onion domes house eleven bells, the largest weighing nearly 15 tonnes.',
    },
  },
];

/**
 * Reward frames. Each is locked until a milestone is reached.
 * Order: from easiest to unlock to hardest.
 */
export const FRAMES: PhotoFrame[] = [
  {
    id: 'classic-blue',
    name: 'Classic Blue',
    description: 'A clean Tallinn-blue border. Available from the start.',
    unlock: { type: 'stamps', threshold: 0 },
    color: '#0072CE',
  },
  {
    id: 'explorer',
    name: 'Explorer Frame',
    description: 'Earned after your first stamp.',
    unlock: { type: 'stamps', threshold: 1 },
    color: '#0072CE',
  },
  {
    id: 'medieval',
    name: 'Medieval Frame',
    description: 'Collect 3 stamps to unlock the full Old Town crest.',
    unlock: { type: 'stamps', threshold: 3 },
    color: '#1F3A5F',
  },
  {
    id: 'quiz-master',
    name: 'Quiz Master Frame',
    description: 'Reach 30 trivia points to prove your knowledge.',
    unlock: { type: 'points', threshold: 30 },
    color: '#0072CE',
  },
  {
    id: 'golden',
    name: 'Golden Frame',
    description: 'Reach 50 trivia points for the ultimate souvenir.',
    unlock: { type: 'points', threshold: 50 },
    color: '#D4A017',
  },
];

/** Quiz Master rank ladder based on total trivia points. */
export const RANKS: QuizRank[] = [
  { title: 'Curious Visitor', minPoints: 0 },
  { title: 'Local Explorer', minPoints: 10 },
  { title: 'Old Town Scholar', minPoints: 30 },
  { title: 'Quiz Master', minPoints: 50 },
];

export function rankForPoints(points: number): QuizRank {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (points >= rank.minPoints) current = rank;
  }
  return current;
}

export function nextRank(points: number): QuizRank | null {
  return RANKS.find((r) => r.minPoints > points) ?? null;
}
