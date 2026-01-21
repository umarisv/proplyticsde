-- ============================================================================
-- AUTH MIGRATION - Profiles & User-gebundene Bewertungen
-- Version 2.0 - Idempotent (kann mehrfach ausgeführt werden)
-- Führe dieses SQL im Supabase SQL Editor aus
-- ============================================================================

-- ============================================================================
-- 1. PROFILES TABELLE
-- ============================================================================

-- Profiles Tabelle erstellen
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Trigger-Funktion: Automatisch Profil bei Registrierung anlegen
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger erstellen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at Funktion (falls nicht vorhanden)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für updated_at bei profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS für profiles aktivieren
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Alte Profiles Policies löschen (alle möglichen Namen)
DROP POLICY IF EXISTS "Profiles sind für den Besitzer lesbar" ON public.profiles;
DROP POLICY IF EXISTS "Profiles können vom Besitzer aktualisiert werden" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Neue Profiles Policies
CREATE POLICY "Profiles sind für den Besitzer lesbar" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profiles können vom Besitzer aktualisiert werden" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- 2. BEWERTUNGEN - user_id SPALTE HINZUFÜGEN
-- ============================================================================

-- user_id Spalte hinzufügen (falls nicht vorhanden)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'bewertungen' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.bewertungen ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Index für user_id
CREATE INDEX IF NOT EXISTS idx_bewertungen_user_id ON public.bewertungen(user_id);

-- ============================================================================
-- 3. BEWERTUNGEN - RLS POLICIES AKTUALISIEREN
-- ============================================================================

-- RLS aktivieren (falls nicht schon aktiv)
ALTER TABLE public.bewertungen ENABLE ROW LEVEL SECURITY;

-- ALLE möglichen alten Policies löschen (deutsche und englische Namen)
DROP POLICY IF EXISTS "Bewertungen lesbar" ON public.bewertungen;
DROP POLICY IF EXISTS "Bewertungen sind öffentlich lesbar" ON public.bewertungen;
DROP POLICY IF EXISTS "Bewertungen können erstellt werden" ON public.bewertungen;
DROP POLICY IF EXISTS "Bewertungen können aktualisiert werden" ON public.bewertungen;
DROP POLICY IF EXISTS "Bewertungen können gelöscht werden" ON public.bewertungen;
DROP POLICY IF EXISTS "Eigene oder anonyme Bewertungen lesen" ON public.bewertungen;
DROP POLICY IF EXISTS "Bewertungen mit eigenem User erstellen" ON public.bewertungen;
DROP POLICY IF EXISTS "Eigene Bewertungen aktualisieren" ON public.bewertungen;
DROP POLICY IF EXISTS "Eigene Bewertungen löschen" ON public.bewertungen;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.bewertungen;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.bewertungen;
DROP POLICY IF EXISTS "Enable update for all users" ON public.bewertungen;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.bewertungen;
DROP POLICY IF EXISTS "bewertungen_select_policy" ON public.bewertungen;
DROP POLICY IF EXISTS "bewertungen_insert_policy" ON public.bewertungen;
DROP POLICY IF EXISTS "bewertungen_update_policy" ON public.bewertungen;
DROP POLICY IF EXISTS "bewertungen_delete_policy" ON public.bewertungen;

-- Neue Policies erstellen
-- SELECT: User sieht eigene + anonyme Bewertungen
CREATE POLICY "bewertungen_select_policy" ON public.bewertungen
  FOR SELECT USING (
    user_id IS NULL OR user_id = auth.uid()
  );

-- INSERT: User kann Bewertungen für sich oder anonym erstellen
CREATE POLICY "bewertungen_insert_policy" ON public.bewertungen
  FOR INSERT WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

-- UPDATE: Nur eigene oder anonyme Bewertungen bearbeiten
CREATE POLICY "bewertungen_update_policy" ON public.bewertungen
  FOR UPDATE USING (
    user_id IS NULL OR user_id = auth.uid()
  );

-- DELETE: Nur eigene oder anonyme Bewertungen löschen
CREATE POLICY "bewertungen_delete_policy" ON public.bewertungen
  FOR DELETE USING (
    user_id IS NULL OR user_id = auth.uid()
  );

-- ============================================================================
-- FERTIG!
-- ============================================================================
-- Nach dem Ausführen dieses Scripts:
--
-- 1. Gehe zu Authentication > URL Configuration:
--    - Site URL: https://proplytics.de
--    - Redirect URLs: https://proplytics.de/auth/callback
--
-- 2. Gehe zu Authentication > Providers > Email:
--    - Aktiviere "Confirm email"
--
-- 3. Optional: Authentication > Email Templates anpassen (deutsche Texte)
-- ============================================================================
