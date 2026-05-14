-- Safe migration: add OwnGoal event type without touching existing events/statistics
-- MySQL variant
INSERT INTO Events (Id, Name)
SELECT 3, 'OwnGoal'
WHERE NOT EXISTS (
  SELECT 1 FROM Events WHERE Id = 3
);

-- PostgreSQL variant
-- INSERT INTO "Events" ("Id", "Name")
-- VALUES (3, 'OwnGoal')
-- ON CONFLICT ("Id") DO UPDATE SET "Name" = EXCLUDED."Name";
