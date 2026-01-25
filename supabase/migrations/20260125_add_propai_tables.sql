-- ============================================
-- PropAI Tabellen (Supabase)
-- Prefix: propai_
-- ============================================

-- Properties table
CREATE TABLE IF NOT EXISTS public.propai_property (
  property_id SERIAL PRIMARY KEY,
  address_raw TEXT NOT NULL,
  address_normalized TEXT,
  street TEXT,
  house_number TEXT,
  postal_code TEXT,
  city TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(address_normalized)
);

CREATE INDEX IF NOT EXISTS idx_propai_property_address_normalized
  ON public.propai_property(address_normalized);
CREATE INDEX IF NOT EXISTS idx_propai_property_postal_code
  ON public.propai_property(postal_code);

-- Source events table
CREATE TABLE IF NOT EXISTS public.propai_source_event (
  source_event_id SERIAL PRIMARY KEY,
  source_type TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  meta JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_propai_source_event_type
  ON public.propai_source_event(source_type);
CREATE INDEX IF NOT EXISTS idx_propai_source_event_occurred
  ON public.propai_source_event(occurred_at);

-- Property snapshots table
CREATE TABLE IF NOT EXISTS public.propai_property_snapshot (
  snapshot_id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES public.propai_property(property_id),
  source_event_id INTEGER REFERENCES public.propai_source_event(source_event_id),
  snapshot_date DATE NOT NULL,
  property_type TEXT,
  living_area_m2 DOUBLE PRECISION,
  living_area_range TEXT,
  rooms DOUBLE PRECISION,
  year_built INTEGER,
  year_built_range TEXT,
  condition_score INTEGER,
  modernization_range TEXT,
  has_balcony BOOLEAN,
  has_terrace BOOLEAN,
  has_garden BOOLEAN,
  has_elevator BOOLEAN,
  has_parking BOOLEAN,
  marketing_status TEXT,
  asking_price_eur DOUBLE PRECISION,
  price_per_sqm DOUBLE PRECISION,
  confidence_score INTEGER DEFAULT 0,
  data_quality TEXT DEFAULT 'unknown',
  raw_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_propai_snapshot_property
  ON public.propai_property_snapshot(property_id);
CREATE INDEX IF NOT EXISTS idx_propai_snapshot_date
  ON public.propai_property_snapshot(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_propai_snapshot_source
  ON public.propai_property_snapshot(source_event_id);

-- Snapshot features table
CREATE TABLE IF NOT EXISTS public.propai_snapshot_features (
  feature_id SERIAL PRIMARY KEY,
  snapshot_id INTEGER REFERENCES public.propai_property_snapshot(snapshot_id),
  microzone_id TEXT,
  distance_to_center_km DOUBLE PRECISION,
  transit_score INTEGER,
  poi_counts_json JSONB DEFAULT '{}'::jsonb,
  noise_proxy_score INTEGER,
  flood_risk_flag BOOLEAN,
  green_space_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(snapshot_id)
);

CREATE INDEX IF NOT EXISTS idx_propai_features_snapshot
  ON public.propai_snapshot_features(snapshot_id);

-- Model outputs table
CREATE TABLE IF NOT EXISTS public.propai_model_output (
  model_output_id SERIAL PRIMARY KEY,
  snapshot_id INTEGER REFERENCES public.propai_property_snapshot(snapshot_id),
  model_version TEXT NOT NULL,
  predicted_market_value_eur DOUBLE PRECISION,
  predicted_rent_eur_m2 DOUBLE PRECISION,
  deal_score INTEGER,
  risk_score INTEGER,
  explanation_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_propai_output_snapshot
  ON public.propai_model_output(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_propai_output_model_version
  ON public.propai_model_output(model_version);
