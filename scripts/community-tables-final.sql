-- Drop old tables if they exist with conflicts, then recreate cleanly
DROP TABLE IF EXISTS community_ratings CASCADE;
DROP TABLE IF EXISTS community_likes CASCADE;
DROP TABLE IF EXISTS community_replies CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;

-- Community Posts
CREATE TABLE community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'allgemein',
  post_type text NOT NULL DEFAULT 'diskussion',
  objektdaten jsonb,
  tags text[] DEFAULT '{}',
  views integer DEFAULT 0,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Community Replies
CREATE TABLE community_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Community Likes
CREATE TABLE community_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES community_replies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id),
  CHECK (post_id IS NOT NULL OR reply_id IS NOT NULL)
);

-- Community Ratings (Meinungsbild)
CREATE TABLE community_ratings (
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

-- RLS
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_ratings ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Posts readable by authenticated" ON community_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create posts" ON community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Replies policies
CREATE POLICY "Replies readable by authenticated" ON community_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create replies" ON community_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own replies" ON community_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes readable by authenticated" ON community_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can like" ON community_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON community_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Ratings policies
CREATE POLICY "Ratings readable by authenticated" ON community_ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can rate" ON community_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rating" ON community_ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_posts_created ON community_posts(created_at DESC);
CREATE INDEX idx_posts_category ON community_posts(category);
CREATE INDEX idx_posts_type ON community_posts(post_type);
CREATE INDEX idx_replies_post ON community_replies(post_id);
CREATE INDEX idx_likes_post ON community_likes(post_id);
CREATE INDEX idx_ratings_post ON community_ratings(post_id);
