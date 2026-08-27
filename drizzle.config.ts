import type { Config } from 'drizzle-kit';

/**
 * The app creates its tables at runtime from `src/db/ddl.sql`, which is the
 * source of truth for the browser build. This config exists so the same schema
 * can be pushed to a Postgres/Supabase instance when the cloud phase starts:
 *
 *   DATABASE_URL=... npx drizzle-kit push
 */
export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
} satisfies Config;
