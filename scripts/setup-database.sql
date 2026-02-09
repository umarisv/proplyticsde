-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create bewertungen table
CREATE TABLE IF NOT EXISTS bewertungen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  adresse TEXT,
  plz TEXT,
  stadt TEXT,
  objekttyp TEXT,
  wohnflaeche NUMERIC,
  grundstueck NUMERIC,
  baujahr INTEGER,
  zustand TEXT,
  ausstattung TEXT,
  lage TEXT,
  energieeffizienz TEXT,
  anzahl_wohnungen INTEGER,
  stellplaetze INTEGER,
  keller BOOLEAN,
  balkon BOOLEAN,
  aufzug BOOLEAN,
  ist_miete NUMERIC,
  bodenrichtwert NUMERIC,
  kaufpreis NUMERIC,
  ergebnisse JSONB,
  status TEXT DEFAULT 'entwurf' NOT NULL
);

-- Enable RLS on bewertungen
ALTER TABLE bewertungen ENABLE ROW LEVEL SECURITY;

-- Bewertungen policies
CREATE POLICY "Users can view their own bewertungen"
  ON bewertungen FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bewertungen"
  ON bewertungen FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bewertungen"
  ON bewertungen FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bewertungen"
  ON bewertungen FOR DELETE
  USING (auth.uid() = user_id);

-- Allow anonymous bewertungen (user_id is null)
CREATE POLICY "Anyone can insert anonymous bewertungen"
  ON bewertungen FOR INSERT
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Anyone can view anonymous bewertungen"
  ON bewertungen FOR SELECT
  USING (user_id IS NULL);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
