-- Fix: Drop CHECK constraints FIRST, then alter column types

-- Drop all text check constraints on ratings
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS community_ratings_rendite_check;
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS community_ratings_risiko_check;
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS community_ratings_finanzierung_check;
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS community_ratings_value_add_check;
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS community_ratings_lage_check;
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS community_ratings_deal_sourcing_check;
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS check_rendite;
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS check_risiko;
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS check_finanzierung;
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS check_value_add;
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS check_lage;
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS check_deal_sourcing;

-- Now alter columns from text to integer
ALTER TABLE community_ratings
  ALTER COLUMN rendite TYPE integer USING 2,
  ALTER COLUMN risiko TYPE integer USING 2,
  ALTER COLUMN finanzierung TYPE integer USING 2,
  ALTER COLUMN value_add TYPE integer USING 2,
  ALTER COLUMN lage TYPE integer USING 2,
  ALTER COLUMN deal_sourcing TYPE integer USING 2;

-- Add integer check constraints (1=rot, 2=gelb, 3=gruen)
ALTER TABLE community_ratings ADD CONSTRAINT check_rendite CHECK (rendite BETWEEN 1 AND 3);
ALTER TABLE community_ratings ADD CONSTRAINT check_risiko CHECK (risiko BETWEEN 1 AND 3);
ALTER TABLE community_ratings ADD CONSTRAINT check_finanzierung CHECK (finanzierung BETWEEN 1 AND 3);
ALTER TABLE community_ratings ADD CONSTRAINT check_value_add CHECK (value_add BETWEEN 1 AND 3);
ALTER TABLE community_ratings ADD CONSTRAINT check_lage CHECK (lage BETWEEN 1 AND 3);
ALTER TABLE community_ratings ADD CONSTRAINT check_deal_sourcing CHECK (deal_sourcing BETWEEN 1 AND 3);

-- Rename 'lage' to 'lage_markt' to match app code
ALTER TABLE community_ratings RENAME COLUMN lage TO lage_markt;
-- Also rename the constraint
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS check_lage;
ALTER TABLE community_ratings ADD CONSTRAINT check_lage_markt CHECK (lage_markt BETWEEN 1 AND 3);
