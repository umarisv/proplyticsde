-- ============================================================================
-- PROPLYTICS FULL SCHEMA - Komplette Datenbank-Migration
-- ============================================================================
-- Kombiniert: profiles, bewertungen (mit user_id), properties, valuations, 
--             documents, contacts, conversions
-- Idempotent - kann mehrfach ausgeführt werden
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1) HELPER FUNCTIONS
-- ============================================================================

-- updated_at Trigger Funktion
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper: Prüft ob User Admin ist
CREATE OR REPLACE FUNCTION public.is_staff(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- ============================================================================
-- 2) PROFILES (Benutzerprofile mit Rollen & Onboarding)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  company TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT profiles_role_check CHECK (
    role IN (
      'admin',
      'user',
      'energieberater',
      'akquisiteur',
      'banker',
      'bauunternehmer',
      'investor',
      'architekt',
      'gutachter',
      'notar',
      'rechtsanwalt',
      'steuerberater',
      'versicherungsmakler',
      'hausverwaltung',
      'makler'
    )
  )
);

-- Index für Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Trigger: Automatisch Profil bei Registrierung anlegen
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  desired_role TEXT;
BEGIN
  desired_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'user'));

  -- Nur erlaubte Rollen (außer admin)
  IF desired_role NOT IN (
    'user', 'energieberater', 'akquisiteur', 'banker', 'bauunternehmer',
    'investor', 'architekt', 'gutachter', 'notar', 'rechtsanwalt',
    'steuerberater', 'versicherungsmakler', 'hausverwaltung', 'makler'
  ) THEN
    desired_role := 'user';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    desired_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at Trigger für profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS für profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by owner or staff" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are insertable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are updatable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles sind für den Besitzer lesbar" ON public.profiles;
DROP POLICY IF EXISTS "Profiles können vom Besitzer aktualisiert werden" ON public.profiles;

CREATE POLICY "Profiles are viewable by owner or staff"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_staff(auth.uid()));

CREATE POLICY "Profiles are insertable by owner"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles are updatable by owner"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- 3) BEWERTUNGEN (Bestehende Tabelle erweitern - für aktuelle App)
-- ============================================================================

-- Bewertungen Tabelle erstellen (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.bewertungen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Basis-Daten
  adresse TEXT,
  plz TEXT,
  stadt TEXT,
  objekttyp TEXT,
  
  -- Flächen
  wohnflaeche NUMERIC,
  grundstueck NUMERIC,
  
  -- Gebäude
  baujahr INTEGER,
  zustand TEXT,
  
  -- Erweiterte Parameter
  ausstattung TEXT,
  lage TEXT,
  energieeffizienz TEXT,
  anzahl_wohnungen INTEGER,
  stellplaetze INTEGER,
  keller BOOLEAN DEFAULT false,
  balkon BOOLEAN DEFAULT false,
  aufzug BOOLEAN DEFAULT false,
  
  -- Finanzen
  ist_miete NUMERIC,
  bodenrichtwert NUMERIC,
  kaufpreis NUMERIC,
  
  -- Berechnete Ergebnisse (JSON)
  ergebnisse JSONB,
  
  -- Status
  status TEXT DEFAULT 'aktiv'
);

-- user_id Spalte hinzufügen falls sie fehlt
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

-- Indices für bewertungen
CREATE INDEX IF NOT EXISTS idx_bewertungen_created_at ON public.bewertungen(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bewertungen_status ON public.bewertungen(status);
CREATE INDEX IF NOT EXISTS idx_bewertungen_stadt ON public.bewertungen(stadt);
CREATE INDEX IF NOT EXISTS idx_bewertungen_user_id ON public.bewertungen(user_id);

-- updated_at Trigger für bewertungen
DROP TRIGGER IF EXISTS update_bewertungen_updated_at ON public.bewertungen;
CREATE TRIGGER update_bewertungen_updated_at
  BEFORE UPDATE ON public.bewertungen
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS für bewertungen
ALTER TABLE public.bewertungen ENABLE ROW LEVEL SECURITY;

-- Alle alten Policies löschen
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

-- Neue Policies: User sehen eigene + anonyme, Staff sieht alles
CREATE POLICY "bewertungen_select_policy" ON public.bewertungen
  FOR SELECT USING (
    user_id IS NULL 
    OR user_id = auth.uid() 
    OR public.is_staff(auth.uid())
  );

CREATE POLICY "bewertungen_insert_policy" ON public.bewertungen
  FOR INSERT WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

CREATE POLICY "bewertungen_update_policy" ON public.bewertungen
  FOR UPDATE USING (
    user_id IS NULL 
    OR user_id = auth.uid() 
    OR public.is_staff(auth.uid())
  );

CREATE POLICY "bewertungen_delete_policy" ON public.bewertungen
  FOR DELETE USING (
    user_id IS NULL 
    OR user_id = auth.uid() 
    OR public.is_staff(auth.uid())
  );

-- ============================================================================
-- 4) PROPERTIES (Objektstammdaten - für zukünftige Erweiterung)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Adressdaten
  address TEXT,
  zip_code TEXT,
  city TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,

  -- Objektdaten
  property_type TEXT,
  living_area_sqm NUMERIC,
  land_area_sqm NUMERIC,
  year_built INT,

  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_properties_user ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_zip ON public.properties(zip_code);

DROP TRIGGER IF EXISTS properties_updated_at ON public.properties;
CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS für properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Properties viewable by owner or staff" ON public.properties;
DROP POLICY IF EXISTS "Properties insertable by owner" ON public.properties;
DROP POLICY IF EXISTS "Properties updatable by owner" ON public.properties;
DROP POLICY IF EXISTS "Properties deletable by owner" ON public.properties;

CREATE POLICY "Properties viewable by owner or staff"
  ON public.properties FOR SELECT
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE POLICY "Properties insertable by owner"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Properties updatable by owner"
  ON public.properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Properties deletable by owner"
  ON public.properties FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5) VALUATIONS (Bewertungsvorgänge - für zukünftige Erweiterung)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Für anonymes Tracking (vor Login)
  session_id TEXT,

  -- Status-Workflow
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN (
      'draft',
      'uploaded',
      'extracted',
      'valued',
      'risked',
      'decided',
      'review',
      'approved',
      'rejected',
      'error'
    )),

  -- Analyst-Entscheidung
  decision_status TEXT CHECK (decision_status IN ('approved', 'rejected', 'pending')),
  review_comment TEXT,
  decision_at TIMESTAMPTZ,

  -- Input-Daten (Formular)
  input_json JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Ergebnisse der 3 Instanzen
  valuation_result_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk_result_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_decision_json JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Audit/Debug
  last_error TEXT,
  data_confidence NUMERIC
);

CREATE INDEX IF NOT EXISTS idx_valuations_user ON public.valuations(user_id);
CREATE INDEX IF NOT EXISTS idx_valuations_property ON public.valuations(property_id);
CREATE INDEX IF NOT EXISTS idx_valuations_session ON public.valuations(session_id);
CREATE INDEX IF NOT EXISTS idx_valuations_status ON public.valuations(status);
CREATE INDEX IF NOT EXISTS idx_valuations_decision ON public.valuations(decision_status);

DROP TRIGGER IF EXISTS valuations_updated_at ON public.valuations;
CREATE TRIGGER valuations_updated_at
  BEFORE UPDATE ON public.valuations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS für valuations
ALTER TABLE public.valuations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Valuations viewable by owner or staff" ON public.valuations;
DROP POLICY IF EXISTS "Valuations insertable by owner" ON public.valuations;
DROP POLICY IF EXISTS "Valuations updatable by owner or staff" ON public.valuations;

CREATE POLICY "Valuations viewable by owner or staff"
  ON public.valuations FOR SELECT
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE POLICY "Valuations insertable by owner"
  ON public.valuations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Valuations updatable by owner or staff"
  ON public.valuations FOR UPDATE
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

-- ============================================================================
-- 6) DOCUMENTS (Uploads + Extraktionsstatus)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  valuation_id UUID REFERENCES public.valuations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Dokumenttyp
  document_type TEXT NOT NULL
    CHECK (document_type IN ('grundriss', 'energieausweis', 'bilder', 'sonstiges', 'expose')),

  -- Datei-Metadaten
  file_name TEXT,
  mime_type TEXT,
  file_size_bytes BIGINT,

  -- Storage
  storage_provider TEXT NOT NULL DEFAULT 'supabase' CHECK (storage_provider IN ('gcs', 'supabase')),
  storage_path TEXT,

  -- Extraktion
  status TEXT NOT NULL DEFAULT 'uploaded'
    CHECK (status IN ('uploaded', 'processing', 'processed', 'error')),
  extracted_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC,
  last_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_documents_valuation ON public.documents(valuation_id);
CREATE INDEX IF NOT EXISTS idx_documents_user ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);

-- RLS für documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Documents viewable by owner or staff" ON public.documents;
DROP POLICY IF EXISTS "Documents insertable by owner" ON public.documents;
DROP POLICY IF EXISTS "Documents updatable by owner" ON public.documents;

CREATE POLICY "Documents viewable by owner or staff"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE POLICY "Documents insertable by owner"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Documents updatable by owner"
  ON public.documents FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 7) CONTACTS (Lead Layer - für anonyme Anfragen)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  name TEXT,
  email TEXT,
  phone TEXT,

  consent_marketing BOOLEAN NOT NULL DEFAULT false,
  consent_privacy BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);

-- RLS für contacts (nur Staff kann lesen)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contacts viewable by staff" ON public.contacts;
DROP POLICY IF EXISTS "Contacts insertable by anyone" ON public.contacts;

CREATE POLICY "Contacts viewable by staff"
  ON public.contacts FOR SELECT
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Contacts insertable by anyone"
  ON public.contacts FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 8) CONVERSIONS (Lead-Conversion Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  valuation_id UUID REFERENCES public.valuations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  session_id TEXT,

  conversion_type TEXT NOT NULL
    CHECK (conversion_type IN (
      'pdf_request',
      'call_request',
      'full_report',
      'financing_check',
      'risk_agent_activated'
    )),

  meta_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_conversions_valuation ON public.conversions(valuation_id);
CREATE INDEX IF NOT EXISTS idx_conversions_contact ON public.conversions(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversions_session ON public.conversions(session_id);
CREATE INDEX IF NOT EXISTS idx_conversions_type ON public.conversions(conversion_type);

-- RLS für conversions
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Conversions viewable by staff" ON public.conversions;
DROP POLICY IF EXISTS "Conversions insertable by anyone" ON public.conversions;

CREATE POLICY "Conversions viewable by staff"
  ON public.conversions FOR SELECT
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Conversions insertable by anyone"
  ON public.conversions FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 9) STORAGE BUCKETS (für Dokument-Uploads)
-- ============================================================================

-- Storage Bucket erstellen (wird ignoriert wenn er existiert)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;

CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' 
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_staff(auth.uid()))
);

CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- FERTIG!
-- ============================================================================
-- 
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
--
-- TABELLEN-ÜBERSICHT:
-- - profiles: Benutzerprofile mit Rollen
-- - bewertungen: Aktuelle App-Daten (mit user_id)
-- - properties: Objektstammdaten (für Erweiterung)
-- - valuations: Bewertungsvorgänge (für Erweiterung)
-- - documents: Dokument-Uploads
-- - contacts: Lead-Erfassung
-- - conversions: Conversion-Tracking
--
-- ============================================================================
