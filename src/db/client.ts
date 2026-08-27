import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { eq } from 'drizzle-orm';

import ddl from './ddl.sql?raw';
import * as schema from './schema';
import { SEED_DECOS, SEED_QUIZZES, SEED_SPOTS } from './seedData';

/**
 * Single static user for the local-only phase. Every check-in, point, unlocked
 * Deco and photo is linked to this id, so a future Supabase migration is a
 * single `UPDATE ... SET user_id = <supabase auth uid>`.
 */
export const LOCAL_USER_ID = 'local-default-user';

export type Database = ReturnType<typeof drizzle<typeof schema>>;

let dbPromise: Promise<Database> | null = null;

async function bootstrap(): Promise<Database> {
  const client = await PGlite.create('idb://tallinn-stamp-rally');
  // Multi-statement DDL is the only place we bypass Drizzle — every read/write
  // in the app goes through Drizzle syntax.
  await client.exec(ddl);

  const db = drizzle(client, { schema });
  await seedIfEmpty(db);
  return db;
}

async function seedIfEmpty(db: Database) {
  const existingUser = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.id, LOCAL_USER_ID))
    .limit(1);

  if (existingUser.length === 0) {
    await db.insert(schema.users).values({ id: LOCAL_USER_ID });
    await db.insert(schema.userProfiles).values({ userId: LOCAL_USER_ID, points: 0 });
  }

  const existingSpots = await db.select({ id: schema.spots.id }).from(schema.spots).limit(1);
  if (existingSpots.length === 0) {
    await db.insert(schema.spots).values(SEED_SPOTS);
    await db.insert(schema.quizzes).values(SEED_QUIZZES);
    await db.insert(schema.decos).values(SEED_DECOS);

    // Free Decos start unlocked so the editor is usable from the first launch.
    const free = SEED_DECOS.filter((d) => d.costPoints === 0);
    if (free.length > 0) {
      await db
        .insert(schema.userDecos)
        .values(free.map((d) => ({ userId: LOCAL_USER_ID, decoId: d.id })));
    }
  }
}

/** Lazily creates (once) and returns the Drizzle database handle. */
export function getDb(): Promise<Database> {
  if (!dbPromise) dbPromise = bootstrap();
  return dbPromise;
}
