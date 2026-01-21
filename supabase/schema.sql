-- Supabase Schema für Proplytics Bewertungen
-- Führe dieses SQL im Supabase SQL Editor aus

-- Bewertungen Tabelle erstellen
CREATE TABLE IF NOT EXISTS bewertungen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
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
  ausstattung TEXT, -- 'einfach', 'mittel', 'gehoben', 'luxus'
  lage TEXT, -- 'einfach', 'mittel', 'gut', 'sehr_gut'
  energieeffizienz TEXT, -- 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'unbekannt'
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
  status TEXT DEFAULT 'aktiv' -- 'aktiv', 'archiviert'
);

-- Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_bewertungen_created_at ON bewertungen(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bewertungen_status ON bewertungen(status);
CREATE INDEX IF NOT EXISTS idx_bewertungen_stadt ON bewertungen(stadt);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_bewertungen_updated_at ON bewertungen;
CREATE TRIGGER update_bewertungen_updated_at
  BEFORE UPDATE ON bewertungen
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) aktivieren
ALTER TABLE bewertungen ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder kann lesen (für öffentliche Bewertungen)
-- Anpassen je nach Authentifizierungsanforderungen
CREATE POLICY "Bewertungen sind öffentlich lesbar" ON bewertungen
  FOR SELECT USING (true);

CREATE POLICY "Bewertungen können erstellt werden" ON bewertungen
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Bewertungen können aktualisiert werden" ON bewertungen
  FOR UPDATE USING (true);

CREATE POLICY "Bewertungen können gelöscht werden" ON bewertungen
  FOR DELETE USING (true);
