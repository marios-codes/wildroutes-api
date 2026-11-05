-- Performance case-study seed: 200 tours, 5,000 users, 100,000 reviews.
-- Run ONLY against wildroutes_perf:
--   psql -v ON_ERROR_STOP=1 -U postgres -h localhost -d wildroutes_perf -f scripts/seed-perf.sql

-- Safety guard: TRUNCATE below is destructive, so refuse to run anywhere else.
DO $$
BEGIN
  IF current_database() <> 'wildroutes_perf' THEN
    RAISE EXCEPTION 'Refusing to seed database %, expected wildroutes_perf', current_database();
  END IF;
END $$;

-- Re-runnable: empty everything and restart the id sequences at 1.
-- The review rows below assume user ids 1..5000 and tour ids 1..200.
TRUNCATE "Review", "Booking", "TourCategory", "Category", "Tour", "User" RESTART IDENTITY CASCADE;

INSERT INTO "Tour" ("name", "duration", "difficulty", "rating", "numberOfParticipants")
SELECT
  'Perf Tour ' || i,
  1 + (i % 14),
  (ARRAY['EASY', 'MEDIUM', 'HARD'])[1 + (i % 3)]::"Difficulty",
  1 + (i % 40) / 10.0,
  5 + (i % 20)
FROM generate_series(1, 200) AS i;

-- passwordHash is a placeholder: these users cannot log in.
INSERT INTO "User" ("name", "email", "passwordHash", "updatedAt")
SELECT
  'Perf User ' || i,
  'perf-user-' || i || '@example.test',
  'not-a-real-hash',
  now()
FROM generate_series(1, 5000) AS i;

-- Review n belongs to user (n % 5000) + 1 and its k = n / 5000 (0..19) is that user's k-th review.
-- Tour = (user * 7 + k * 10) % 200 + 1:
--   * k * 10 takes 20 different values mod 200, so a user never repeats a tour
--     (keeps the unique (userId, tourId) constraint satisfied);
--   * 7 is coprime with 200, so every tour receives exactly 500 reviews.
INSERT INTO "Review" ("rating", "comment", "userId", "tourId", "updatedAt")
SELECT
  1 + (n % 5),
  'Perf review ' || n,
  (n % 5000) + 1,
  (((n % 5000) * 7 + (n / 5000) * 10) % 200) + 1,
  now()
FROM generate_series(0, 99999) AS n;

-- Refresh planner statistics, otherwise EXPLAIN estimates are unreliable.
ANALYZE;
