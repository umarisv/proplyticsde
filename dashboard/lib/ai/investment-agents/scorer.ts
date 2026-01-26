/**
 * Investment Agent Scorer
 * 
 * Core scoring engine that evaluates properties based on agent profiles.
 * Supports learned weights for self-improvement over time.
 */

import type {
  AgentProfile,
  AgentProfileConfig,
  AgentScore,
  AgentWeights,
  AssetClass,
  CategoryScore,
  DealKiller,
  PropertyEvaluationInput,
  ScoringWeights,
  Verdict,
} from './types'
import { CATEGORY_LABELS, normalizeObjekttyp } from './agent-profiles'

// ============================================================================
// Main Scoring Function
// ============================================================================

export function scoreProperty(
  property: PropertyEvaluationInput,
  profile: AgentProfile,
  learnedWeights?: AgentWeights
): AgentScore {
  const config = profile.config
  const assetClass = normalizeObjekttyp(property.objekttyp)
  
  // 1. Check hard no-go rules (deal killers)
  const dealKillers = checkDealKillers(property, config, assetClass)
  
  // If there are critical deal killers, return NO-GO immediately
  const criticalKillers = dealKillers.filter(dk => dk.severity === 'critical')
  if (criticalKillers.length > 0) {
    return {
      agentId: profile.id,
      agentName: profile.name,
      verdict: 'no_go',
      totalScore: 0,
      categoryScores: [],
      dealKillers,
      thresholdsMet: {
        grossYield: false,
        dscr: property.dscr ? property.dscr >= config.min_thresholds.dscr_min : true,
        ltv: property.ltv ? property.ltv <= config.min_thresholds.ltv_max : true,
      },
      explanation: `Deal-Killer: ${criticalKillers.map(dk => dk.label).join(', ')}`,
      confidence: learnedWeights?.confidence ?? 0.5,
    }
  }
  
  // 2. Get weights (learned or default)
  const baseWeights = config.scoring_weights[assetClass] || config.scoring_weights.ETW
  const weights = learnedWeights?.weights ?? baseWeights
  
  // 3. Calculate category scores
  const categoryScores = calculateCategoryScores(property, config, weights, assetClass)
  
  // 4. Calculate total weighted score
  const totalScore = calculateTotalScore(categoryScores)
  
  // 5. Determine verdict based on decision rules
  const verdict = determineVerdict(totalScore, config.decision_rules, dealKillers)
  
  // 6. Generate explanation
  const explanation = generateExplanation(verdict, totalScore, categoryScores, dealKillers, config)
  
  return {
    agentId: profile.id,
    agentName: profile.name,
    verdict,
    totalScore: Math.round(totalScore),
    categoryScores,
    dealKillers,
    thresholdsMet: {
      grossYield: (property.bruttoRendite ?? 0) >= config.min_thresholds.gross_yield_hard_gate,
      dscr: property.dscr ? property.dscr >= config.min_thresholds.dscr_min : true,
      ltv: property.ltv ? property.ltv <= config.min_thresholds.ltv_max : true,
    },
    explanation,
    confidence: learnedWeights?.confidence ?? 0.5,
  }
}

// ============================================================================
// Deal Killer Checks
// ============================================================================

function checkDealKillers(
  property: PropertyEvaluationInput,
  config: AgentProfileConfig,
  _assetClass: AssetClass
): DealKiller[] {
  const dealKillers: DealKiller[] = []
  
  for (const rule of config.hard_nogo_rules) {
    switch (rule.rule) {
      case 'gross_yield_below_minimum': {
        const grossYield = property.bruttoRendite ?? calculateGrossYield(property)
        if (rule.value && grossYield < rule.value) {
          dealKillers.push({
            rule: rule.rule,
            label: rule.label,
            actualValue: grossYield,
            threshold: rule.value,
            severity: 'critical',
          })
        }
        break
      }
      
      case 'dscr_below_minimum': {
        if (property.dscr && rule.value && property.dscr < rule.value) {
          dealKillers.push({
            rule: rule.rule,
            label: rule.label,
            actualValue: property.dscr,
            threshold: rule.value,
            severity: 'critical',
          })
        }
        break
      }
      
      case 'not_financeable': {
        // Check LTV
        if (property.ltv && property.ltv > config.min_thresholds.ltv_max) {
          dealKillers.push({
            rule: rule.rule,
            label: 'LTV überschreitet Maximum',
            actualValue: property.ltv,
            threshold: config.min_thresholds.ltv_max,
            severity: 'critical',
          })
        }
        // Check negative cashflow
        if (property.cashflowMonat && property.cashflowMonat < -500) {
          dealKillers.push({
            rule: 'negative_cashflow',
            label: 'Stark negativer Cashflow',
            actualValue: property.cashflowMonat,
            severity: 'critical',
          })
        }
        break
      }
      
      case 'vacancy_risk': {
        // High vacancy is a warning
        if (property.leerstandQuote && property.leerstandQuote > 20) {
          dealKillers.push({
            rule: rule.rule,
            label: `Hoher Leerstand (${property.leerstandQuote}%)`,
            actualValue: property.leerstandQuote,
            threshold: 20,
            severity: property.leerstandQuote > 40 ? 'critical' : 'warning',
          })
        }
        break
      }
      
      case 'technical_risk': {
        // Old buildings without modernization
        const age = new Date().getFullYear() - property.baujahr
        if (age > 60 && property.zustand === 'sanierungsbeduerftig') {
          dealKillers.push({
            rule: rule.rule,
            label: 'Hohes Sanierungsrisiko (Altbau, sanierungsbedürftig)',
            actualValue: age,
            severity: 'warning',
          })
        }
        break
      }
      
      // legal_dealbreaker can only be detected via manual review
      // We don't have data for this, so skip
    }
  }
  
  return dealKillers
}

// ============================================================================
// Category Score Calculation
// ============================================================================

function calculateCategoryScores(
  property: PropertyEvaluationInput,
  config: AgentProfileConfig,
  weights: ScoringWeights,
  _assetClass: AssetClass
): CategoryScore[] {
  const scores: CategoryScore[] = []
  const thresholds = config.min_thresholds
  
  // Normalize weights to sum to 100
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + (w ?? 0), 0)
  
  for (const [category, weight] of Object.entries(weights)) {
    if (!weight) continue
    
    const normalizedWeight = (weight / totalWeight) * 100
    let score = 50 // Default neutral score
    let explanation = ''
    
    switch (category) {
      case 'location_liquidity':
      case 'location_usage': {
        // Score based on location quality
        const lageScores: Record<string, number> = {
          'sehr_gut': 95,
          'gut': 80,
          'mittel': 60,
          'einfach': 40,
        }
        score = lageScores[property.lage] ?? 50
        explanation = `Lage: ${property.lage}`
        break
      }
      
      case 'price_yield': {
        // Score based on gross yield relative to threshold
        const grossYield = property.bruttoRendite ?? calculateGrossYield(property)
        const targetYield = thresholds.gross_yield_screening
        
        if (grossYield >= targetYield * 1.2) {
          score = 95
        } else if (grossYield >= targetYield) {
          score = 80
        } else if (grossYield >= thresholds.gross_yield_hard_gate) {
          score = 60
        } else {
          score = 30
        }
        explanation = `Bruttomietrendite: ${grossYield.toFixed(1)}% (Ziel: ${targetYield}%)`
        break
      }
      
      case 'cashflow_dscr': {
        // Score based on DSCR and cashflow
        const dscr = property.dscr ?? 1.0
        const cashflow = property.cashflowMonat ?? 0
        
        if (dscr >= 1.3 && cashflow > 0) {
          score = 95
        } else if (dscr >= thresholds.dscr_min && cashflow >= 0) {
          score = 80
        } else if (dscr >= thresholds.dscr_min) {
          score = 60
        } else {
          score = 30
        }
        explanation = `DSCR: ${dscr.toFixed(2)}, Cashflow: ${cashflow.toFixed(0)}€/Monat`
        break
      }
      
      case 'condition_capex': {
        // Score based on condition and age
        const zustandScores: Record<string, number> = {
          'neuwertig': 95,
          'modernisiert': 80,
          'gepflegt': 65,
          'sanierungsbeduerftig': 35,
        }
        const baseScore = zustandScores[property.zustand] ?? 50
        
        // Adjust for age
        const age = new Date().getFullYear() - property.baujahr
        const ageAdjustment = Math.max(-20, Math.min(0, -age / 5))
        
        score = Math.max(0, Math.min(100, baseScore + ageAdjustment))
        explanation = `Zustand: ${property.zustand}, Baujahr: ${property.baujahr}`
        break
      }
      
      case 'legal_structure': {
        // Default good score (legal issues detected separately)
        score = 75
        explanation = 'Keine bekannten rechtlichen Probleme'
        break
      }
      
      case 'management':
      case 'operational': {
        // Score based on unit count and complexity
        const units = property.anzahlWohnungen ?? 1
        
        if (units <= 3) {
          score = 90
        } else if (units <= 10) {
          score = 75
        } else if (units <= 20) {
          score = 60
        } else {
          score = 45
        }
        explanation = `${units} Einheit(en)`
        break
      }
      
      case 'tenant_quality': {
        // For commercial - default medium score
        score = 65
        explanation = 'Mieterqualität nicht bewertet'
        break
      }
      
      case 'exit_risk': {
        // Score based on location and property type
        const lageRisk: Record<string, number> = {
          'sehr_gut': 90,
          'gut': 75,
          'mittel': 55,
          'einfach': 35,
        }
        score = lageRisk[property.lage] ?? 50
        explanation = `Exit-Risiko basierend auf Lage: ${property.lage}`
        break
      }
    }
    
    const weightedScore = (score * normalizedWeight) / 100
    
    scores.push({
      category,
      label: CATEGORY_LABELS[category] ?? category,
      score: Math.round(score),
      weight: Math.round(normalizedWeight),
      weightedScore: Math.round(weightedScore * 10) / 10,
      explanation,
    })
  }
  
  return scores
}

// ============================================================================
// Score Aggregation
// ============================================================================

function calculateTotalScore(categoryScores: CategoryScore[]): number {
  return categoryScores.reduce((sum, cs) => sum + cs.weightedScore, 0)
}

function determineVerdict(
  totalScore: number,
  rules: AgentProfileConfig['decision_rules'],
  dealKillers: DealKiller[]
): Verdict {
  // Any critical deal killer = NO-GO
  if (dealKillers.some(dk => dk.severity === 'critical')) {
    return 'no_go'
  }
  
  if (totalScore >= rules.go_min) {
    return 'go'
  }
  
  if (totalScore >= rules.maybe_min) {
    return 'maybe'
  }
  
  return 'no_go'
}

// ============================================================================
// Explanation Generation
// ============================================================================

function generateExplanation(
  verdict: Verdict,
  totalScore: number,
  categoryScores: CategoryScore[],
  dealKillers: DealKiller[],
  config: AgentProfileConfig
): string {
  const parts: string[] = []
  
  // Verdict explanation
  if (verdict === 'go') {
    parts.push(`Score ${totalScore}/100 erreicht GO-Schwelle (≥${config.decision_rules.go_min}).`)
  } else if (verdict === 'maybe') {
    parts.push(`Score ${totalScore}/100 im MAYBE-Bereich (${config.decision_rules.maybe_min}-${config.decision_rules.maybe_max}).`)
  } else {
    if (dealKillers.length > 0) {
      const killerLabels = dealKillers.map(dk => dk.label).join(', ')
      parts.push(`NO-GO aufgrund: ${killerLabels}.`)
    } else {
      parts.push(`Score ${totalScore}/100 unter Minimum (${config.decision_rules.maybe_min}).`)
    }
  }
  
  // Top strengths
  const strengths = categoryScores.filter(cs => cs.score >= 80).slice(0, 2)
  if (strengths.length > 0) {
    parts.push(`Stärken: ${strengths.map(s => s.label).join(', ')}.`)
  }
  
  // Top weaknesses
  const weaknesses = categoryScores.filter(cs => cs.score < 50).slice(0, 2)
  if (weaknesses.length > 0) {
    parts.push(`Schwächen: ${weaknesses.map(w => w.label).join(', ')}.`)
  }
  
  return parts.join(' ')
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateGrossYield(property: PropertyEvaluationInput): number {
  if (!property.kaufpreis || property.kaufpreis === 0) return 0
  return (property.istMieteJahr / property.kaufpreis) * 100
}

/**
 * Calculate metrics that might not be provided
 */
export function enrichPropertyData(property: PropertyEvaluationInput): PropertyEvaluationInput {
  const enriched = { ...property }
  
  // Calculate gross yield if not provided
  if (!enriched.bruttoRendite && enriched.kaufpreis && enriched.istMieteJahr) {
    enriched.bruttoRendite = (enriched.istMieteJahr / enriched.kaufpreis) * 100
  }
  
  // Estimate DSCR if not provided (simplified)
  if (!enriched.dscr && enriched.istMieteJahr && enriched.kaufpreis) {
    // Assume 80% LTV, 4% interest, 2% principal
    const assumedDebt = enriched.kaufpreis * 0.8
    const annualDebtService = assumedDebt * 0.06 // 6% total (4% interest + 2% principal)
    const noi = enriched.istMieteJahr * 0.75 // Assume 25% operating expenses
    enriched.dscr = noi / annualDebtService
  }
  
  // Estimate LTV if not provided
  if (!enriched.ltv) {
    enriched.ltv = 80 // Default assumption
  }
  
  return enriched
}
