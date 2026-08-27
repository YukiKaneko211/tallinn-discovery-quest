import { and, asc, desc, eq, sql } from 'drizzle-orm';

import { getDb, LOCAL_USER_ID } from './client';
import * as s from './schema';

/* ------------------------------------------------------------------ spots */

export async function listSpots() {
  const db = await getDb();
  return db.select().from(s.spots).orderBy(asc(s.spots.name));
}

export async function getSpot(spotId: string) {
  const db = await getDb();
  const rows = await db.select().from(s.spots).where(eq(s.spots.id, spotId)).limit(1);
  return rows[0] ?? null;
}

/* --------------------------------------------------------------- check-ins */

export async function listActiveCheckInIds(): Promise<string[]> {
  const db = await getDb();
  const rows = await db
    .select({ spotId: s.userCheckIns.spotId })
    .from(s.userCheckIns)
    .where(and(eq(s.userCheckIns.userId, LOCAL_USER_ID), eq(s.userCheckIns.isActive, true)));
  return rows.map((r) => r.spotId);
}

/**
 * Check in to a Spot.
 * Points are granted only the first time a Spot is ever checked in — re-checking
 * in after an uncheck-in gives no further points, as stated in the uncheck-in
 * confirmation popup ("you won't get points when you check-in again this Spot").
 * Returns the points actually awarded.
 */
export async function checkIn(spotId: string, rewardPoints: number): Promise<number> {
  const db = await getDb();
  const existing = await db
    .select({ spotId: s.userCheckIns.spotId })
    .from(s.userCheckIns)
    .where(and(eq(s.userCheckIns.userId, LOCAL_USER_ID), eq(s.userCheckIns.spotId, spotId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(s.userCheckIns)
      .set({ isActive: true })
      .where(and(eq(s.userCheckIns.userId, LOCAL_USER_ID), eq(s.userCheckIns.spotId, spotId)));
    return 0;
  }

  await db.insert(s.userCheckIns).values({ userId: LOCAL_USER_ID, spotId, isActive: true });
  await addPoints(rewardPoints);
  return rewardPoints;
}

/** Uncheck-in. Points are intentionally NOT recalculated (see PRD). */
export async function uncheckIn(spotId: string) {
  const db = await getDb();
  await db
    .update(s.userCheckIns)
    .set({ isActive: false })
    .where(and(eq(s.userCheckIns.userId, LOCAL_USER_ID), eq(s.userCheckIns.spotId, spotId)));
}

/* ------------------------------------------------------------------ quizzes */

export async function listQuizzes() {
  const db = await getDb();
  return db.select().from(s.quizzes).orderBy(asc(s.quizzes.id));
}

export async function listQuizzesForSpot(spotId: string) {
  const db = await getDb();
  return db.select().from(s.quizzes).where(eq(s.quizzes.spotId, spotId)).orderBy(asc(s.quizzes.id));
}

export async function listCompletedQuizIds(): Promise<string[]> {
  const db = await getDb();
  const rows = await db
    .select({ quizId: s.userQuizCompleted.quizId })
    .from(s.userQuizCompleted)
    .where(eq(s.userQuizCompleted.userId, LOCAL_USER_ID));
  return rows.map((r) => r.quizId);
}

/** Records a correct answer and grants the quiz reward. Idempotent. */
export async function completeQuiz(quizId: string, rewardPoints: number): Promise<number> {
  const db = await getDb();
  const existing = await db
    .select({ quizId: s.userQuizCompleted.quizId })
    .from(s.userQuizCompleted)
    .where(
      and(eq(s.userQuizCompleted.userId, LOCAL_USER_ID), eq(s.userQuizCompleted.quizId, quizId)),
    )
    .limit(1);
  if (existing.length > 0) return 0;

  await db.insert(s.userQuizCompleted).values({ userId: LOCAL_USER_ID, quizId });
  await addPoints(rewardPoints);
  return rewardPoints;
}

/* -------------------------------------------------------------------- decos */

export async function listDecos() {
  const db = await getDb();
  return db.select().from(s.decos).orderBy(asc(s.decos.id));
}

export async function listUnlockedDecoIds(): Promise<string[]> {
  const db = await getDb();
  const rows = await db
    .select({ decoId: s.userDecos.decoId })
    .from(s.userDecos)
    .where(eq(s.userDecos.userId, LOCAL_USER_ID));
  return rows.map((r) => r.decoId);
}

/** Spends points and unlocks a Deco. Returns false when points are insufficient. */
export async function unlockDeco(decoId: string, costPoints: number): Promise<boolean> {
  const db = await getDb();
  const profile = await getProfile();
  if (profile.points < costPoints) return false;

  await db
    .update(s.userProfiles)
    .set({ points: profile.points - costPoints, updatedAt: new Date() })
    .where(eq(s.userProfiles.userId, LOCAL_USER_ID));
  await db.insert(s.userDecos).values({ userId: LOCAL_USER_ID, decoId });
  return true;
}

/* ------------------------------------------------------------------ photos */

export async function listPhotos(spotId?: string) {
  const db = await getDb();
  const where = spotId
    ? and(eq(s.photos.userId, LOCAL_USER_ID), eq(s.photos.spotId, spotId))
    : eq(s.photos.userId, LOCAL_USER_ID);
  return db.select().from(s.photos).where(where).orderBy(desc(s.photos.createdAt));
}

export async function getPhoto(id: string) {
  const db = await getDb();
  const rows = await db.select().from(s.photos).where(eq(s.photos.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function insertPhoto(input: {
  id: string;
  spotId: string | null;
  imagePath: string;
  editorStateJson: unknown;
  createdAt?: Date;
}) {
  const db = await getDb();
  await db.insert(s.photos).values({
    id: input.id,
    userId: LOCAL_USER_ID,
    spotId: input.spotId,
    imagePath: input.imagePath,
    editorStateJson: input.editorStateJson,
    ...(input.createdAt ? { createdAt: input.createdAt } : {}),
  });
}

export async function updatePhoto(
  id: string,
  patch: { spotId?: string | null; imagePath?: string; editorStateJson?: unknown },
) {
  const db = await getDb();
  await db.update(s.photos).set(patch).where(eq(s.photos.id, id));
}

export async function deletePhoto(id: string) {
  const db = await getDb();
  await db.delete(s.photos).where(eq(s.photos.id, id));
}

/* ----------------------------------------------------------------- profile */

export async function getProfile() {
  const db = await getDb();
  const rows = await db
    .select()
    .from(s.userProfiles)
    .where(eq(s.userProfiles.userId, LOCAL_USER_ID))
    .limit(1);
  return rows[0] ?? { userId: LOCAL_USER_ID, points: 0, updatedAt: new Date() };
}

async function addPoints(delta: number) {
  if (!delta) return;
  const db = await getDb();
  await db
    .update(s.userProfiles)
    .set({ points: sql`${s.userProfiles.points} + ${delta}`, updatedAt: new Date() })
    .where(eq(s.userProfiles.userId, LOCAL_USER_ID));
}
