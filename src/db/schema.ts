import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

/**
 * Schema mirrors the PRD "Data Architecture" section 1:1.
 * `user_id` columns exist from day one so a future Supabase migration is a
 * simple `UPDATE ... SET user_id = <auth uid>` with no schema change.
 */

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const userProfiles = pgTable('user_profiles', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id),
  points: integer('points').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const spots = pgTable('spots', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  description: text('description').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  spotImage: text('spot_image').notNull(),
  stampImage: text('stamp_image').notNull(),
  rewardPoints: integer('reward_points').notNull().default(50),
});

export const userCheckIns = pgTable(
  'user_check_ins',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    spotId: text('spot_id')
      .notNull()
      .references(() => spots.id),
    isActive: boolean('is_active').notNull().default(true),
    checkedInAt: timestamp('checked_in_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.spotId] })],
);

export const quizzes = pgTable('quizzes', {
  id: text('id').primaryKey(),
  spotId: text('spot_id')
    .notNull()
    .references(() => spots.id),
  title: text('title').notNull(),
  question: text('question').notNull(),
  choices: jsonb('choices').$type<string[]>().notNull(),
  correctAnswerIndex: integer('correct_answer_index').notNull(),
  rewardPoints: integer('reward_points').notNull().default(10),
});

export const userQuizCompleted = pgTable(
  'user_quiz_completed',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    quizId: text('quiz_id')
      .notNull()
      .references(() => quizzes.id),
    completedAt: timestamp('completed_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.quizId] })],
);

export const decos = pgTable('decos', {
  id: text('id').primaryKey(),
  /** NULL for general Decos that are not tagged to a Spot. */
  spotId: text('spot_id').references(() => spots.id),
  name: text('name').notNull(),
  costPoints: integer('cost_points').notNull().default(0),
  imageUrl: text('image_url').notNull(),
});

export const userDecos = pgTable(
  'user_decos',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    decoId: text('deco_id')
      .notNull()
      .references(() => decos.id),
    unlockedAt: timestamp('unlocked_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.decoId] })],
);

export const photos = pgTable('photos', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  spotId: text('spot_id').references(() => spots.id),
  /** Storage key inside OPFS — never the binary itself. */
  imagePath: text('image_path').notNull(),
  editorStateJson: jsonb('editor_state_json').$type<unknown>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Spot = typeof spots.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type Deco = typeof decos.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
