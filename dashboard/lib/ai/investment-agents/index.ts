/**
 * Investment Agents Module
 * 
 * Multi-agent investment evaluation system with self-learning capabilities.
 */

// Types
export * from './types'

// Agent Profiles
export {
  IMMOCATION_PROFILE,
  HOERHAN_PROFILE,
  RAUE_PROFILE,
  SYSTEM_AGENTS,
  CATEGORY_LABELS,
  VERDICT_LABELS,
  getDefaultWeightsForAssetClass,
  normalizeObjekttyp,
} from './agent-profiles'

// Scorer
export {
  scoreProperty,
  enrichPropertyData,
} from './scorer'

// Ensemble
export {
  aggregateEnsemble,
  getVerdictComparison,
} from './ensemble'
export type { AggregationStrategy } from './ensemble'

// Learning
export {
  submitFeedback,
  getLearnedWeights,
  getAllUserWeights,
  getFeedbackHistory,
  getLearningStats,
  initializeWeightsForUser,
} from './learning'
export type { LearningStats } from './learning'
