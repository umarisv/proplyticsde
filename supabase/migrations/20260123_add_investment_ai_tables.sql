-- Investment AI Multi-Agent Tables
-- Migration: 20260123_add_investment_ai_tables.sql

-- Investoren-Profile (aus JSON importiert + Custom)
CREATE TABLE IF NOT EXISTS public.agent_profiles (
  id TEXT PRIMARY KEY,  -- 'immocation', 'hoerhan', 'raue', 'custom_<user_id>'
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL für globale Profile
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL,  -- Die volle Konfiguration (regions, asset_classes, scoring_weights, etc.)
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lernbare Gewichte pro User und Agent
CREATE TABLE IF NOT EXISTS public.agent_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES public.agent_profiles(id) ON DELETE CASCADE,
  asset_class TEXT NOT NULL,  -- 'ETW', 'MFH', 'Gewerbe', 'Wohnportfolio'
  weights JSONB NOT NULL,  -- Angepasste Scoring-Gewichte
  confidence NUMERIC DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  feedback_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, agent_id, asset_class)
);

-- Feedback für Lernen
CREATE TABLE IF NOT EXISTS public.evaluation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bewertung_id UUID REFERENCES public.bewertungen(id) ON DELETE CASCADE,
  evaluation_id UUID,  -- Referenz zur evaluation_history
  agent_id TEXT REFERENCES public.agent_profiles(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('thumbs_up', 'thumbs_down', 'deal_outcome', 'price_correction')),
  predicted_verdict TEXT,  -- Was die KI gesagt hat: 'go', 'maybe', 'no_go'
  predicted_score INTEGER,  -- Der Score den die KI gegeben hat
  actual_outcome TEXT,  -- Was wirklich passiert ist: 'purchased', 'rejected', 'negotiated'
  price_delta NUMERIC,  -- Marktpreis vs. tatsächlicher Verkaufspreis in %
  notes TEXT,  -- Optionale Notizen vom User
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bewertungs-Historie für Lernen und Auswertung
CREATE TABLE IF NOT EXISTS public.evaluation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bewertung_id UUID REFERENCES public.bewertungen(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_data JSONB NOT NULL,  -- Snapshot der Property-Daten
  agent_scores JSONB NOT NULL,  -- Alle einzelnen Agenten-Scores
  ensemble_result JSONB NOT NULL,  -- Aggregiertes Ergebnis
  market_estimate NUMERIC,  -- Marktbewertung in EUR
  asking_price NUMERIC,  -- Angebotspreis in EUR
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_agent_profiles_user ON public.agent_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_profiles_system ON public.agent_profiles(is_system);
CREATE INDEX IF NOT EXISTS idx_agent_weights_user_agent ON public.agent_weights(user_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_feedback_user ON public.evaluation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_feedback_bewertung ON public.evaluation_feedback(bewertung_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_history_user ON public.evaluation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_history_bewertung ON public.evaluation_history(bewertung_id);

-- RLS Policies
ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_history ENABLE ROW LEVEL SECURITY;

-- agent_profiles: System profiles are readable by all, custom profiles only by owner
CREATE POLICY "System profiles are viewable by all authenticated users"
  ON public.agent_profiles FOR SELECT
  TO authenticated
  USING (is_system = true OR user_id = auth.uid());

CREATE POLICY "Users can create their own custom profiles"
  ON public.agent_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users can update their own profiles"
  ON public.agent_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users can delete their own profiles"
  ON public.agent_profiles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND is_system = false);

-- agent_weights: Users can only access their own weights
CREATE POLICY "Users can view their own weights"
  ON public.agent_weights FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own weights"
  ON public.agent_weights FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own weights"
  ON public.agent_weights FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own weights"
  ON public.agent_weights FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- evaluation_feedback: Users can only access their own feedback
CREATE POLICY "Users can view their own feedback"
  ON public.evaluation_feedback FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own feedback"
  ON public.evaluation_feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own feedback"
  ON public.evaluation_feedback FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- evaluation_history: Users can only access their own history
CREATE POLICY "Users can view their own history"
  ON public.evaluation_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own history"
  ON public.evaluation_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Insert system agent profiles
INSERT INTO public.agent_profiles (id, user_id, name, description, config, is_system) VALUES
('immocation', NULL, 'immocation (Marco Lücke & Stefan Schneider)', 'Cashflow-orientiert, konservative Strategie mit Fokus auf nachhaltige Rendite', '{
  "investor_name": "immocation (Marco Lücke & Stefan Schneider)",
  "regions_allowed": ["DE"],
  "asset_classes_allowed": ["ETW", "MFH", "Wohnportfolio", "Gewerbe"],
  "hard_nogo_rules": [
    {"rule": "gross_yield_below_minimum", "value": 4.5, "label": "Bruttomietrendite < 4.5%"},
    {"rule": "not_financeable", "label": "Nicht finanzierbar / Bankability fail"},
    {"rule": "dscr_below_minimum", "value": 1.10, "label": "DSCR < 1.10"},
    {"rule": "legal_dealbreaker", "label": "Rechtliche Deal-Killer (unheilbar)"},
    {"rule": "technical_risk", "label": "Unkalkulierbarer technischer Rückstau"},
    {"rule": "vacancy_risk", "label": "Strukturelle Vermietungsrisiken"}
  ],
  "scoring_weights": {
    "ETW": {"location_liquidity": 20, "price_yield": 25, "cashflow_dscr": 20, "condition_capex": 15, "legal_structure": 10, "management": 10},
    "MFH": {"location_liquidity": 20, "price_yield": 25, "cashflow_dscr": 20, "condition_capex": 15, "legal_structure": 10, "operational": 10},
    "Gewerbe": {"location_usage": 15, "tenant_quality": 25, "cashflow_dscr": 20, "condition_capex": 15, "legal_structure": 10, "exit_risk": 15}
  },
  "min_thresholds": {
    "gross_yield_screening": 5.0,
    "gross_yield_hard_gate": 4.5,
    "dscr_min": 1.10,
    "ltv_target": 85,
    "ltv_max": 90
  },
  "decision_rules": {"go_min": 75, "maybe_min": 60, "maybe_max": 74}
}'::jsonb, true),

('hoerhan', NULL, 'Gerald Hörhan (Investmentpunk)', 'Rendite-fokussiert, opportunistische Strategie mit höheren Renditeanforderungen', '{
  "investor_name": "Gerald Hörhan (Investmentpunk)",
  "regions_allowed": ["DE"],
  "asset_classes_allowed": ["ETW", "MFH", "Wohnportfolio", "Gewerbe"],
  "hard_nogo_rules": [
    {"rule": "gross_yield_below_minimum", "value": 5.0, "label": "Bruttomietrendite < 5.0%"},
    {"rule": "not_financeable", "label": "Nicht finanzierbar / Bankability fail"},
    {"rule": "dscr_below_minimum", "value": 1.10, "label": "DSCR < 1.10"},
    {"rule": "legal_dealbreaker", "label": "Rechtliche Deal-Killer (unheilbar)"},
    {"rule": "technical_risk", "label": "Unkalkulierbarer technischer Rückstau"},
    {"rule": "vacancy_risk", "label": "Strukturelle Vermietungsrisiken"}
  ],
  "scoring_weights": {
    "ETW": {"location_liquidity": 20, "price_yield": 25, "cashflow_dscr": 20, "condition_capex": 15, "legal_structure": 10, "management": 10},
    "MFH": {"location_liquidity": 20, "price_yield": 25, "cashflow_dscr": 20, "condition_capex": 15, "legal_structure": 10, "operational": 10},
    "Gewerbe": {"location_usage": 15, "tenant_quality": 25, "cashflow_dscr": 20, "condition_capex": 15, "legal_structure": 10, "exit_risk": 15}
  },
  "min_thresholds": {
    "gross_yield_screening": 5.5,
    "gross_yield_hard_gate": 5.0,
    "dscr_min": 1.10,
    "ltv_target": 85,
    "ltv_max": 90
  },
  "decision_rules": {"go_min": 75, "maybe_min": 60, "maybe_max": 74}
}'::jsonb, true),

('raue', NULL, 'Alexander Raue (Vermietertagebuch)', 'High-Yield Strategie, fokussiert auf B/C-Lagen mit hohen Renditen', '{
  "investor_name": "Alexander Raue (Vermietertagebuch)",
  "regions_allowed": ["DE"],
  "asset_classes_allowed": ["ETW", "MFH", "Wohnportfolio", "Gewerbe"],
  "hard_nogo_rules": [
    {"rule": "gross_yield_below_minimum", "value": 6.0, "label": "Bruttomietrendite < 6.0%"},
    {"rule": "not_financeable", "label": "Nicht finanzierbar / Bankability fail"},
    {"rule": "dscr_below_minimum", "value": 1.10, "label": "DSCR < 1.10"},
    {"rule": "legal_dealbreaker", "label": "Rechtliche Deal-Killer (unheilbar)"},
    {"rule": "technical_risk", "label": "Unkalkulierbarer technischer Rückstau"},
    {"rule": "vacancy_risk", "label": "Strukturelle Vermietungsrisiken"}
  ],
  "scoring_weights": {
    "ETW": {"location_liquidity": 20, "price_yield": 25, "cashflow_dscr": 20, "condition_capex": 15, "legal_structure": 10, "management": 10},
    "MFH": {"location_liquidity": 20, "price_yield": 25, "cashflow_dscr": 20, "condition_capex": 15, "legal_structure": 10, "operational": 10},
    "Gewerbe": {"location_usage": 15, "tenant_quality": 25, "cashflow_dscr": 20, "condition_capex": 15, "legal_structure": 10, "exit_risk": 15}
  },
  "min_thresholds": {
    "gross_yield_screening": 6.0,
    "gross_yield_hard_gate": 6.0,
    "dscr_min": 1.10,
    "ltv_target": 85,
    "ltv_max": 90
  },
  "decision_rules": {"go_min": 75, "maybe_min": 60, "maybe_max": 74}
}'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  config = EXCLUDED.config,
  updated_at = now();

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_agent_profiles_updated_at ON public.agent_profiles;
CREATE TRIGGER update_agent_profiles_updated_at
    BEFORE UPDATE ON public.agent_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agent_weights_updated_at ON public.agent_weights;
CREATE TRIGGER update_agent_weights_updated_at
    BEFORE UPDATE ON public.agent_weights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
