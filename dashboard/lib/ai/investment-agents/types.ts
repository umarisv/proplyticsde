/**
 * Investment AI Multi-Agent Types
 * 
 * Type definitions for the self-learning multi-agent investment evaluation system.
 */

// ============================================================================
// Agent Profile Types
// ============================================================================

export type AssetClass = 'ETW' | 'MFH' | 'Gewerbe' | 'Wohnportfolio'
export type Verdict = 'go' | 'maybe' | 'no_go'
export type FeedbackType = 'thumbs_up' | 'thumbs_down' | 'deal_outcome' | 'price_correction'
export type DealOutcome = 'purchased' | 'rejected' | 'negotiated'

export interface HardNoGoRule {
  rule: string
  value?: number
  label: string
}

export interface ScoringWeights {
  location_liquidity?: number
  location_usage?: number
  price_yield?: number
  cashflow_dscr?: number
  condition_capex?: number
  legal_structure?: number
  management?: number
  operational?: number
  tenant_quality?: number
  exit_risk?: number
  [key: string]: number | undefined
}

export interface MinThresholds {
  gross_yield_screening: number
  gross_yield_hard_gate: number
  dscr_min: number
  ltv_target: number
  ltv_max: number
}

export interface DecisionRules {
  go_min: number      // Score >= go_min = GO
  maybe_min: number   // Score >= maybe_min = MAYBE
  maybe_max: number   // Score <= maybe_max = MAYBE
}

export interface AgentProfileConfig {
  investor_name: string
  regions_allowed: string[]
  asset_classes_allowed: AssetClass[]
  hard_nogo_rules: HardNoGoRule[]
  scoring_weights: Record<AssetClass, ScoringWeights>
  min_thresholds: MinThresholds
  decision_rules: DecisionRules
}

export interface AgentProfile {
  id: string
  userId: string | null
  name: string
  description?: string
  config: AgentProfileConfig
  isSystem: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Scoring Types
// ============================================================================

export interface CategoryScore {
  category: string
  label: string
  score: number        // 0-100
  weight: number       // Weight from profile (sum = 100)
  weightedScore: number
  explanation: string
}

export interface DealKiller {
  rule: string
  label: string
  actualValue?: number
  threshold?: number
  severity: 'critical' | 'warning'
}

export interface AgentScore {
  agentId: string
  agentName: string
  verdict: Verdict
  totalScore: number           // 0-100
  categoryScores: CategoryScore[]
  dealKillers: DealKiller[]
  thresholdsMet: {
    grossYield: boolean
    dscr: boolean
    ltv: boolean
  }
  explanation: string
  confidence: number           // 0-1, based on learned weights
}

// ============================================================================
// Ensemble Types
// ============================================================================

export interface DissentReason {
  agentId: string
  agentName: string
  verdict: Verdict
  reason: string
}

export interface RiskFactor {
  category: string
  level: 'low' | 'medium' | 'high' | 'critical'
  description: string
  value?: number
  threshold?: number
}

export interface EnsembleResult {
  recommendation: Verdict
  confidence: number           // 0-1
  consensusScore: number       // 0-100, averaged weighted score
  agentScores: AgentScore[]
  consensus: boolean           // Do all agents agree?
  majorityVerdict: Verdict
  dissent: DissentReason[]
  riskFactors: RiskFactor[]
  summary: string
}

// ============================================================================
// Learning Types
// ============================================================================

export interface AgentWeights {
  id: string
  userId: string
  agentId: string
  assetClass: AssetClass
  weights: ScoringWeights
  confidence: number
  feedbackCount: number
  updatedAt: string
}

export interface EvaluationFeedback {
  id?: string
  userId: string
  bewertungId: string
  evaluationId?: string
  agentId?: string
  feedbackType: FeedbackType
  predictedVerdict?: Verdict
  predictedScore?: number
  actualOutcome?: DealOutcome
  priceDelta?: number          // % difference between market and actual price
  notes?: string
  createdAt?: string
}

export interface EvaluationHistory {
  id: string
  bewertungId: string
  userId: string
  propertyData: PropertyEvaluationInput
  agentScores: AgentScore[]
  ensembleResult: EnsembleResult
  marketEstimate?: number
  askingPrice?: number
  createdAt: string
}

// ============================================================================
// Input/Output Types
// ============================================================================

export interface PropertyEvaluationInput {
  // Basic property data
  objekttyp: AssetClass
  plz: string
  stadt: string
  wohnflaeche: number
  grundstueck?: number
  baujahr: number
  zustand: 'sanierungsbeduerftig' | 'gepflegt' | 'modernisiert' | 'neuwertig'
  ausstattung: 'einfach' | 'mittel' | 'gehoben' | 'luxus'
  lage: 'einfach' | 'mittel' | 'gut' | 'sehr_gut'
  
  // Financial data
  kaufpreis: number
  istMieteJahr: number          // Annual rent
  bodenrichtwert?: number
  
  // Calculated metrics (from calculate-valuation.ts)
  bruttoRendite?: number
  nettoRendite?: number
  dscr?: number
  ltv?: number
  cashflowMonat?: number
  marktwert?: number
  
  // MFH specific
  anzahlWohnungen?: number
  leerstandQuote?: number       // % vacancy
  
  // Additional data
  energieeffizienz?: string
  stellplaetze?: number
  keller?: boolean
  balkon?: boolean
  aufzug?: boolean
}

export interface EvaluationRequest {
  propertyData: PropertyEvaluationInput
  bewertungId?: string
  selectedAgents?: string[]     // If empty, use all system agents
  includeCustomAgents?: boolean
}

export interface EvaluationResponse {
  success: boolean
  evaluationId: string
  result: EnsembleResult
  timestamp: string
}

// ============================================================================
// API Types
// ============================================================================

export interface CreateCustomProfileRequest {
  name: string
  description?: string
  baseProfileId?: string        // Clone from existing profile
  config: Partial<AgentProfileConfig>
}

export interface FeedbackRequest {
  bewertungId: string
  evaluationId?: string
  agentId?: string
  feedbackType: FeedbackType
  predictedVerdict?: Verdict
  predictedScore?: number
  actualOutcome?: DealOutcome
  priceDelta?: number
  notes?: string
}

// ============================================================================
// Database Row Types (from Supabase)
// ============================================================================

export interface AgentProfileRow {
  id: string
  user_id: string | null
  name: string
  description: string | null
  config: AgentProfileConfig
  is_system: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AgentWeightsRow {
  id: string
  user_id: string
  agent_id: string
  asset_class: string
  weights: ScoringWeights
  confidence: number
  feedback_count: number
  created_at: string
  updated_at: string
}

export interface EvaluationFeedbackRow {
  id: string
  user_id: string
  bewertung_id: string
  evaluation_id: string | null
  agent_id: string | null
  feedback_type: FeedbackType
  predicted_verdict: Verdict | null
  predicted_score: number | null
  actual_outcome: DealOutcome | null
  price_delta: number | null
  notes: string | null
  created_at: string
}

export interface EvaluationHistoryRow {
  id: string
  bewertung_id: string
  user_id: string
  property_data: PropertyEvaluationInput
  agent_scores: AgentScore[]
  ensemble_result: EnsembleResult
  market_estimate: number | null
  asking_price: number | null
  created_at: string
}

// ============================================================================
// Utility Types
// ============================================================================

export function mapRowToProfile(row: AgentProfileRow): AgentProfile {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description ?? undefined,
    config: row.config,
    isSystem: row.is_system,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapRowToWeights(row: AgentWeightsRow): AgentWeights {
  return {
    id: row.id,
    userId: row.user_id,
    agentId: row.agent_id,
    assetClass: row.asset_class as AssetClass,
    weights: row.weights,
    confidence: row.confidence,
    feedbackCount: row.feedback_count,
    updatedAt: row.updated_at,
  }
}
