-- Vollmacht-Management-System Tabellen erstellen

-- Vollmachten Tabelle für hinterlegte Vollmachten
CREATE TABLE vollmachten (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  status text DEFAULT 'aktiv' CHECK (status IN ('aktiv', 'inaktiv', 'abgelaufen')),
  valid_from date NOT NULL,
  valid_until date,
  bank_connections jsonb, -- Welche Banken sind freigeschaltet
  permissions text[] DEFAULT '{}' -- Welche Aktionen sind erlaubt
);

-- Finanzierungsanträge Tabelle
CREATE TABLE finanzierungsantraege (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bewertung_id uuid REFERENCES bewertungen(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'entwurf' CHECK (status IN ('entwurf', 'eingereicht', 'in_pruefung', 'genehmigt', 'abgelehnt')),
  bank_name text NOT NULL,
  dokumente_required text[] DEFAULT '{}',
  dokumente_submitted jsonb,
  ki_agent_status text DEFAULT 'idle' CHECK (ki_agent_status IN ('idle', 'analysiere', 'beantrage_dokumente', 'warte_auf_dokumente', 'fertig')),
  ki_agent_notes text
);

-- Dokumente Tabelle für alle Finanzierungsunterlagen
CREATE TABLE dokumente (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  finanzierungsantrag_id uuid REFERENCES finanzierungsantraege(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  document_type text CHECK (document_type IN ('vollmacht', 'einkommensnachweis', 'schufa', 'grundbuchauszug', 'bankauszug', 'steuerbescheid', 'sonstiges')),
  status text DEFAULT 'hochgeladen' CHECK (status IN ('hochgeladen', 'in_pruefung', 'freigegeben', 'abgelehnt')),
  extracted_data jsonb, -- OCR/KI-extrahierte Daten
  ai_analysis jsonb -- KI-Analyse Ergebnisse
);

-- Row Level Security aktivieren
ALTER TABLE vollmachten ENABLE ROW LEVEL SECURITY;
ALTER TABLE finanzierungsantraege ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokumente ENABLE ROW LEVEL SECURITY;

-- Vollmachten Policies
CREATE POLICY "Users can view own vollmachten" ON vollmachten
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vollmachten" ON vollmachten
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vollmachten" ON vollmachten
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vollmachten" ON vollmachten
  FOR DELETE USING (auth.uid() = user_id);

-- Finanzierungsanträge Policies
CREATE POLICY "Users can view own finanzierungsantraege" ON finanzierungsantraege
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own finanzierungsantraege" ON finanzierungsantraege
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own finanzierungsantraege" ON finanzierungsantraege
  FOR UPDATE USING (auth.uid() = user_id);

-- Dokumente Policies
CREATE POLICY "Users can view own dokumente" ON dokumente
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dokumente" ON dokumente
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dokumente" ON dokumente
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dokumente" ON dokumente
  FOR DELETE USING (auth.uid() = user_id);

-- Performance Indizes
CREATE INDEX idx_vollmachten_user_id ON vollmachten(user_id);
CREATE INDEX idx_vollmachten_status ON vollmachten(status);
CREATE INDEX idx_finanzierungsantraege_user_id ON finanzierungsantraege(user_id);
CREATE INDEX idx_finanzierungsantraege_bewertung_id ON finanzierungsantraege(bewertung_id);
CREATE INDEX idx_finanzierungsantraege_status ON finanzierungsantraege(status);
CREATE INDEX idx_dokumente_user_id ON dokumente(user_id);
CREATE INDEX idx_dokumente_finanzierungsantrag_id ON dokumente(finanzierungsantrag_id);
CREATE INDEX idx_dokumente_type ON dokumente(document_type);