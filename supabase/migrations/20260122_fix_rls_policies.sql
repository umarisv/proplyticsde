-- ============================================
-- RLS Policies für bewertungen Tabelle korrigieren
-- ============================================

-- Bestehende Policies löschen (falls vorhanden)
DROP POLICY IF EXISTS "Users can view own bewertungen" ON public.bewertungen;
DROP POLICY IF EXISTS "Users can insert bewertungen" ON public.bewertungen;
DROP POLICY IF EXISTS "Users can update own bewertungen" ON public.bewertungen;
DROP POLICY IF EXISTS "Users can delete own bewertungen" ON public.bewertungen;

-- RLS aktivieren
ALTER TABLE public.bewertungen ENABLE ROW LEVEL SECURITY;

-- Neue, permissive Policies erstellen
-- Für Entwicklung/Test: Alle Operationen erlauben
CREATE POLICY "bewertungen_select_policy" ON public.bewertungen FOR SELECT USING (true);
CREATE POLICY "bewertungen_insert_policy" ON public.bewertungen FOR INSERT WITH CHECK (true);
CREATE POLICY "bewertungen_update_policy" ON public.bewertungen FOR UPDATE USING (true);
CREATE POLICY "bewertungen_delete_policy" ON public.bewertungen FOR DELETE USING (true);

-- Alternativ: User-spezifische Policies (auskommentiert, falls später benötigt)
-- CREATE POLICY "Users can view own bewertungen" ON public.bewertungen
-- FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- CREATE POLICY "Users can insert bewertungen" ON public.bewertungen
-- FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- CREATE POLICY "Users can update own bewertungen" ON public.bewertungen
-- FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete own bewertungen" ON public.bewertungen
-- FOR DELETE USING (auth.uid() = user_id);