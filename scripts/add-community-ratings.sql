-- Add post_type column to community_posts if it exists, otherwise create all tables
-- This script is idempotent

-- Create community_posts if not exists
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'allgemein',
  post_type text NOT NULL DEFAULT 'diskussion',
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add post_type column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_posts' AND column_name = 'post_type'
  ) THEN
    ALTER TABLE community_posts ADD COLUMN post_type text NOT NULL DEFAULT 'diskussion';
  END IF;
END$$;

-- Add objektdaten JSONB column for Meinungsbild posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_posts' AND column_name = 'objektdaten'
  ) THEN
    ALTER TABLE community_posts ADD COLUMN objektdaten jsonb;
  END IF;
END$$;

-- Create community_replies if not exists
CREATE TABLE IF NOT EXISTS community_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create community_likes if not exists
CREATE TABLE IF NOT EXISTS community_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES community_replies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id),
  CHECK (post_id IS NOT NULL OR reply_id IS NOT NULL)
);

-- Create Meinungsbild ratings table
CREATE TABLE IF NOT EXISTS community_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rendite text NOT NULL CHECK (rendite IN ('gruen', 'gelb', 'rot')),
  risiko text NOT NULL CHECK (risiko IN ('gruen', 'gelb', 'rot')),
  finanzierung text NOT NULL CHECK (finanzierung IN ('gruen', 'gelb', 'rot')),
  value_add text NOT NULL CHECK (value_add IN ('gruen', 'gelb', 'rot')),
  lage text NOT NULL CHECK (lage IN ('gruen', 'gelb', 'rot')),
  deal_sourcing text NOT NULL CHECK (deal_sourcing IN ('gruen', 'gelb', 'rot')),
  kommentar text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_ratings ENABLE ROW LEVEL SECURITY;

-- Policies for community_posts
DROP POLICY IF EXISTS "Posts readable by authenticated" ON community_posts;
CREATE POLICY "Posts readable by authenticated" ON community_posts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can create posts" ON community_posts;
CREATE POLICY "Users can create posts" ON community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON community_posts;
CREATE POLICY "Users can delete own posts" ON community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Policies for community_replies
DROP POLICY IF EXISTS "Replies readable by authenticated" ON community_replies;
CREATE POLICY "Replies readable by authenticated" ON community_replies FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can create replies" ON community_replies;
CREATE POLICY "Users can create replies" ON community_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own replies" ON community_replies;
CREATE POLICY "Users can delete own replies" ON community_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Policies for community_likes
DROP POLICY IF EXISTS "Likes readable by authenticated" ON community_likes;
CREATE POLICY "Likes readable by authenticated" ON community_likes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can toggle likes" ON community_likes;
CREATE POLICY "Users can toggle likes" ON community_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove own likes" ON community_likes;
CREATE POLICY "Users can remove own likes" ON community_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Policies for community_ratings
DROP POLICY IF EXISTS "Ratings readable by authenticated" ON community_ratings;
CREATE POLICY "Ratings readable by authenticated" ON community_ratings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can create ratings" ON community_ratings;
CREATE POLICY "Users can create ratings" ON community_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ratings" ON community_ratings;
CREATE POLICY "Users can update own ratings" ON community_ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_replies_post ON community_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_post ON community_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_ratings_post ON community_ratings(post_id);
