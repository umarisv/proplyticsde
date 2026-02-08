-- Fix 1: Allow anonymous read on community_posts (teaser for non-logged-in users)
CREATE POLICY "Posts readable by anyone" ON community_posts FOR SELECT TO anon USING (true);
CREATE POLICY "Replies readable by anyone" ON community_replies FOR SELECT TO anon USING (true);
CREATE POLICY "Likes readable by anyone" ON community_likes FOR SELECT TO anon USING (true);
CREATE POLICY "Ratings readable by anyone" ON community_ratings FOR SELECT TO anon USING (true);

-- Fix 2: Change ratings columns from text to integer (1=rot, 2=gelb, 3=gruen)
ALTER TABLE community_ratings
  ALTER COLUMN rendite TYPE integer USING 2,
  ALTER COLUMN risiko TYPE integer USING 2,
  ALTER COLUMN finanzierung TYPE integer USING 2,
  ALTER COLUMN value_add TYPE integer USING 2,
  ALTER COLUMN lage TYPE integer USING 2,
  ALTER COLUMN deal_sourcing TYPE integer USING 2;

-- Drop old check constraints
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS community_ratings_rendite_check;
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS community_ratings_risiko_check;
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS community_ratings_finanzierung_check;
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS community_ratings_value_add_check;
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS community_ratings_lage_check;
ALTER TABLE community_ratings DROP CONSTRAINT IF EXISTS community_ratings_deal_sourcing_check;

-- Add integer check constraints (1-3)
ALTER TABLE community_ratings ADD CONSTRAINT check_rendite CHECK (rendite BETWEEN 1 AND 3);
ALTER TABLE community_ratings ADD CONSTRAINT check_risiko CHECK (risiko BETWEEN 1 AND 3);
ALTER TABLE community_ratings ADD CONSTRAINT check_finanzierung CHECK (finanzierung BETWEEN 1 AND 3);
ALTER TABLE community_ratings ADD CONSTRAINT check_value_add CHECK (value_add BETWEEN 1 AND 3);
ALTER TABLE community_ratings ADD CONSTRAINT check_lage CHECK (lage BETWEEN 1 AND 3);
ALTER TABLE community_ratings ADD CONSTRAINT check_deal_sourcing CHECK (deal_sourcing BETWEEN 1 AND 3);

-- Fix 3: Rename 'lage' column to 'lage_markt' to match the actions code
ALTER TABLE community_ratings RENAME COLUMN lage TO lage_markt;
