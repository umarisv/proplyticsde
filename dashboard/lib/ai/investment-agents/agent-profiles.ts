/**
 * Agent Profiles
 * 
 * Default system agent profiles for the multi-agent investment evaluation.
 * These are also stored in Supabase for persistence and customization.
 */

import type { AgentProfileConfig, AssetClass } from './types'

// ============================================================================
// System Agent Profiles
// ============================================================================

export const IMMOCATION_PROFILE: AgentProfileConfig = {
  investor_name: 'immocation (Marco Lücke & Stefan Schneider)',
  regions_allowed: ['DE'],
  asset_classes_allowed: ['ETW', 'MFH', 'Wohnportfolio', 'Gewerbe'],
  hard_nogo_rules: [
    { rule: 'gross_yield_below_minimum', value: 4.5, label: 'Bruttomietrendite < 4.5%' },
    { rule: 'not_financeable', label: 'Nicht finanzierbar / Bankability fail' },
    { rule: 'dscr_below_minimum', value: 1.10, label: 'DSCR < 1.10' },
    { rule: 'legal_dealbreaker', label: 'Rechtliche Deal-Killer (unheilbar)' },
    { rule: 'technical_risk', label: 'Unkalkulierbarer technischer Rückstau' },
    { rule: 'vacancy_risk', label: 'Strukturelle Vermietungsrisiken' },
  ],
  scoring_weights: {
    ETW: {
      location_liquidity: 20,
      price_yield: 25,
      cashflow_dscr: 20,
      condition_capex: 15,
      legal_structure: 10,
      management: 10,
    },
    MFH: {
      location_liquidity: 20,
      price_yield: 25,
      cashflow_dscr: 20,
      condition_capex: 15,
      legal_structure: 10,
      operational: 10,
    },
    Gewerbe: {
      location_usage: 15,
      tenant_quality: 25,
      cashflow_dscr: 20,
      condition_capex: 15,
      legal_structure: 10,
      exit_risk: 15,
    },
    Wohnportfolio: {
      location_liquidity: 20,
      price_yield: 25,
      cashflow_dscr: 20,
      condition_capex: 15,
      legal_structure: 10,
      operational: 10,
    },
  },
  min_thresholds: {
    gross_yield_screening: 5.0,
    gross_yield_hard_gate: 4.5,
    dscr_min: 1.10,
    ltv_target: 85,
    ltv_max: 90,
  },
  decision_rules: {
    go_min: 75,
    maybe_min: 60,
    maybe_max: 74,
  },
}

export const HOERHAN_PROFILE: AgentProfileConfig = {
  investor_name: 'Gerald Hörhan (Investmentpunk)',
  regions_allowed: ['DE'],
  asset_classes_allowed: ['ETW', 'MFH', 'Wohnportfolio', 'Gewerbe'],
  hard_nogo_rules: [
    { rule: 'gross_yield_below_minimum', value: 5.0, label: 'Bruttomietrendite < 5.0%' },
    { rule: 'not_financeable', label: 'Nicht finanzierbar / Bankability fail' },
    { rule: 'dscr_below_minimum', value: 1.10, label: 'DSCR < 1.10' },
    { rule: 'legal_dealbreaker', label: 'Rechtliche Deal-Killer (unheilbar)' },
    { rule: 'technical_risk', label: 'Unkalkulierbarer technischer Rückstau' },
    { rule: 'vacancy_risk', label: 'Strukturelle Vermietungsrisiken' },
  ],
  scoring_weights: {
    ETW: {
      location_liquidity: 20,
      price_yield: 25,
      cashflow_dscr: 20,
      condition_capex: 15,
      legal_structure: 10,
      management: 10,
    },
    MFH: {
      location_liquidity: 20,
      price_yield: 25,
      cashflow_dscr: 20,
      condition_capex: 15,
      legal_structure: 10,
      operational: 10,
    },
    Gewerbe: {
      location_usage: 15,
      tenant_quality: 25,
      cashflow_dscr: 20,
      condition_capex: 15,
      legal_structure: 10,
      exit_risk: 15,
    },
    Wohnportfolio: {
      location_liquidity: 20,
      price_yield: 25,
      cashflow_dscr: 20,
      condition_capex: 15,
      legal_structure: 10,
      operational: 10,
    },
  },
  min_thresholds: {
    gross_yield_screening: 5.5,
    gross_yield_hard_gate: 5.0,
    dscr_min: 1.10,
    ltv_target: 85,
    ltv_max: 90,
  },
  decision_rules: {
    go_min: 75,
    maybe_min: 60,
    maybe_max: 74,
  },
}

export const RAUE_PROFILE: AgentProfileConfig = {
  investor_name: 'Alexander Raue (Vermietertagebuch)',
  regions_allowed: ['DE'],
  asset_classes_allowed: ['ETW', 'MFH', 'Wohnportfolio', 'Gewerbe'],
  hard_nogo_rules: [
    { rule: 'gross_yield_below_minimum', value: 6.0, label: 'Bruttomietrendite < 6.0%' },
    { rule: 'not_financeable', label: 'Nicht finanzierbar / Bankability fail' },
    { rule: 'dscr_below_minimum', value: 1.10, label: 'DSCR < 1.10' },
    { rule: 'legal_dealbreaker', label: 'Rechtliche Deal-Killer (unheilbar)' },
    { rule: 'technical_risk', label: 'Unkalkulierbarer technischer Rückstau' },
    { rule: 'vacancy_risk', label: 'Strukturelle Vermietungsrisiken' },
  ],
  scoring_weights: {
    ETW: {
      location_liquidity: 20,
      price_yield: 25,
      cashflow_dscr: 20,
      condition_capex: 15,
      legal_structure: 10,
      management: 10,
    },
    MFH: {
      location_liquidity: 20,
      price_yield: 25,
      cashflow_dscr: 20,
      condition_capex: 15,
      legal_structure: 10,
      operational: 10,
    },
    Gewerbe: {
      location_usage: 15,
      tenant_quality: 25,
      cashflow_dscr: 20,
      condition_capex: 15,
      legal_structure: 10,
      exit_risk: 15,
    },
    Wohnportfolio: {
      location_liquidity: 20,
      price_yield: 25,
      cashflow_dscr: 20,
      condition_capex: 15,
      legal_structure: 10,
      operational: 10,
    },
  },
  min_thresholds: {
    gross_yield_screening: 6.0,
    gross_yield_hard_gate: 6.0,
    dscr_min: 1.10,
    ltv_target: 85,
    ltv_max: 90,
  },
  decision_rules: {
    go_min: 75,
    maybe_min: 60,
    maybe_max: 74,
  },
}

// ============================================================================
// System Agents Map
// ============================================================================

export const SYSTEM_AGENTS: Record<string, { name: string; description: string; config: AgentProfileConfig }> = {
  immocation: {
    name: 'immocation (Marco Lücke & Stefan Schneider)',
    description: 'Cashflow-orientiert, konservative Strategie mit Fokus auf nachhaltige Rendite',
    config: IMMOCATION_PROFILE,
  },
  hoerhan: {
    name: 'Gerald Hörhan (Investmentpunk)',
    description: 'Rendite-fokussiert, opportunistische Strategie mit höheren Renditeanforderungen',
    config: HOERHAN_PROFILE,
  },
  raue: {
    name: 'Alexander Raue (Vermietertagebuch)',
    description: 'High-Yield Strategie, fokussiert auf B/C-Lagen mit hohen Renditen',
    config: RAUE_PROFILE,
  },
}

// ============================================================================
// Category Labels (German)
// ============================================================================

export const CATEGORY_LABELS: Record<string, string> = {
  location_liquidity: 'Lage & Liquidität',
  location_usage: 'Lage & Drittverwendung',
  price_yield: 'Preis & Rendite',
  cashflow_dscr: 'Cashflow & DSCR',
  condition_capex: 'Objektzustand & Capex',
  legal_structure: 'Recht & Struktur',
  management: 'Umsetzbarkeit & Management',
  operational: 'Operativer Aufwand',
  tenant_quality: 'Mieterbonität & Laufzeiten',
  exit_risk: 'Exit-Risiko',
}

// ============================================================================
// Verdict Labels (German)
// ============================================================================

export const VERDICT_LABELS: Record<string, { label: string; color: string; description: string }> = {
  go: {
    label: 'GO',
    color: 'green',
    description: 'Investment empfohlen',
  },
  maybe: {
    label: 'MAYBE',
    color: 'yellow',
    description: 'Weiteres Underwriting nötig',
  },
  no_go: {
    label: 'NO-GO',
    color: 'red',
    description: 'Investment nicht empfohlen',
  },
}

// ============================================================================
// Asset Class Helpers
// ============================================================================

export function getDefaultWeightsForAssetClass(assetClass: AssetClass): string[] {
  switch (assetClass) {
    case 'ETW':
      return ['location_liquidity', 'price_yield', 'cashflow_dscr', 'condition_capex', 'legal_structure', 'management']
    case 'MFH':
    case 'Wohnportfolio':
      return ['location_liquidity', 'price_yield', 'cashflow_dscr', 'condition_capex', 'legal_structure', 'operational']
    case 'Gewerbe':
      return ['location_usage', 'tenant_quality', 'cashflow_dscr', 'condition_capex', 'legal_structure', 'exit_risk']
    default:
      return ['location_liquidity', 'price_yield', 'cashflow_dscr', 'condition_capex', 'legal_structure', 'management']
  }
}

export function normalizeObjekttyp(objekttyp: string): AssetClass {
  const lower = objekttyp.toLowerCase()
  
  if (lower.includes('etw') || lower.includes('eigentumswohnung') || lower.includes('wohnung')) {
    return 'ETW'
  }
  if (lower.includes('mfh') || lower.includes('mehrfamilien')) {
    return 'MFH'
  }
  if (lower.includes('gewerbe') || lower.includes('büro') || lower.includes('laden')) {
    return 'Gewerbe'
  }
  if (lower.includes('portfolio') || lower.includes('paket')) {
    return 'Wohnportfolio'
  }
  
  // Default to ETW
  return 'ETW'
}
