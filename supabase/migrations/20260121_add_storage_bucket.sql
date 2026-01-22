-- ============================================
-- Storage Bucket für Bewertungs-Dateien
-- ============================================

-- Bucket erstellen (falls nicht existiert)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bewertung-files',
  'bewertung-files',
  true,  -- public für einfacheren Zugriff
  52428800,  -- 50MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS Policies für Storage

-- Policy: Jeder kann Dateien lesen (public bucket)
CREATE POLICY "Public read access for bewertung-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'bewertung-files');

-- Policy: Authentifizierte User können Dateien hochladen
CREATE POLICY "Authenticated users can upload to bewertung-files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bewertung-files'
  AND auth.role() = 'authenticated'
);

-- Policy: User können ihre eigenen Dateien löschen
-- (basierend auf dem Pfad, der mit ihrer User-ID beginnt)
CREATE POLICY "Users can delete own files in bewertung-files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'bewertung-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- Tabelle für Datei-Metadaten (optional, für erweiterte Funktionen)
-- ============================================

CREATE TABLE IF NOT EXISTS public.bewertung_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bewertung_id UUID REFERENCES public.bewertungen(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('aussen', 'innen', 'grundriss', 'energie', 'expose', 'sonstiges')),
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_bewertung_files_bewertung_id ON public.bewertung_files(bewertung_id);
CREATE INDEX IF NOT EXISTS idx_bewertung_files_user_id ON public.bewertung_files(user_id);

-- RLS für bewertung_files
ALTER TABLE public.bewertung_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files" ON public.bewertung_files
FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert files" ON public.bewertung_files
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own files" ON public.bewertung_files
FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can delete own files" ON public.bewertung_files
FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);
