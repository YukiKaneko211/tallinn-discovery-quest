CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_profiles" (
  "user_id" text PRIMARY KEY NOT NULL REFERENCES "users"("id"),
  "points" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "spots" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "address" text NOT NULL,
  "description" text NOT NULL,
  "latitude" real NOT NULL,
  "longitude" real NOT NULL,
  "spot_image" text NOT NULL,
  "stamp_image" text NOT NULL,
  "reward_points" integer DEFAULT 50 NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_check_ins" (
  "user_id" text NOT NULL REFERENCES "users"("id"),
  "spot_id" text NOT NULL REFERENCES "spots"("id"),
  "is_active" boolean DEFAULT true NOT NULL,
  "checked_in_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_check_ins_pk" PRIMARY KEY ("user_id", "spot_id")
);

CREATE TABLE IF NOT EXISTS "quizzes" (
  "id" text PRIMARY KEY NOT NULL,
  "spot_id" text NOT NULL REFERENCES "spots"("id"),
  "title" text NOT NULL,
  "question" text NOT NULL,
  "choices" jsonb NOT NULL,
  "correct_answer_index" integer NOT NULL,
  "reward_points" integer DEFAULT 10 NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_quiz_completed" (
  "user_id" text NOT NULL REFERENCES "users"("id"),
  "quiz_id" text NOT NULL REFERENCES "quizzes"("id"),
  "completed_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_quiz_completed_pk" PRIMARY KEY ("user_id", "quiz_id")
);

CREATE TABLE IF NOT EXISTS "decos" (
  "id" text PRIMARY KEY NOT NULL,
  "spot_id" text REFERENCES "spots"("id"),
  "name" text NOT NULL,
  "cost_points" integer DEFAULT 0 NOT NULL,
  "image_url" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_decos" (
  "user_id" text NOT NULL REFERENCES "users"("id"),
  "deco_id" text NOT NULL REFERENCES "decos"("id"),
  "unlocked_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_decos_pk" PRIMARY KEY ("user_id", "deco_id")
);

CREATE TABLE IF NOT EXISTS "photos" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id"),
  "spot_id" text REFERENCES "spots"("id"),
  "image_path" text NOT NULL,
  "editor_state_json" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "photos_user_spot_idx" ON "photos" ("user_id", "spot_id");
CREATE INDEX IF NOT EXISTS "quizzes_spot_idx" ON "quizzes" ("spot_id");
CREATE INDEX IF NOT EXISTS "decos_spot_idx" ON "decos" ("spot_id");
