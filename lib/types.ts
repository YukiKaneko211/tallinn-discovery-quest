export interface Landmark {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  /** Distance in km from the user's mock location, used for proximity sorting. */
  distanceKm: number;
  latitude: number;
  longitude: number;
  /** Upfront trivia hook shown before check-in. */
  trivia: {
    question: string;
    /** Accepted answers (lowercased, trimmed). */
    answers: string[];
    /** Points awarded for a correct answer. */
    points: number;
    /** Friendly fact revealed after answering. */
    funFact: string;
  };
}

export type FrameUnlockType = 'stamps' | 'points';

export interface PhotoFrame {
  id: string;
  name: string;
  description: string;
  /** What gates this frame. */
  unlock: {
    type: FrameUnlockType;
    /** Required stamp count or trivia points. */
    threshold: number;
  };
  /** Accent color used to render the SVG frame. */
  color: string;
}

export interface QuizRank {
  title: string;
  minPoints: number;
}
