/**
 * Stochastische Risiko-Engine für Immobilienbewertung
 * Monte-Carlo-Simulation zur Wahrscheinlichkeitsanalyse des Marktwertes
 */

import type { AnalyseFormData, AnalyseResultData } from './types'

// Risikofaktoren und ihre Standardabweichungen
const RISK_FACTORS = {
  // Marktrisiko basierend auf Lage
  lage: {
    einfach: 0.15,    // 15% Volatilität
    mittel: 0.12,
    gut: 0.10,
    sehr_gut: 0.08,
  },
  // Objektrisiko basierend auf Alter
  alter: {
    neu: 0.05,        // < 10 Jahre
    mittel: 0.08,     // 10-30 Jahre
    alt: 0.12,        // 30-60 Jahre
    sehr_alt: 0.18,   // > 60 Jahre
  },
  // Zustandsrisiko
  zustand: {
    neubau: 0.03,
    gepflegt: 0.06,
    durchschnitt: 0.10,
    sanierung: 0.18,
  },
  // Objekttyprisiko
  objekttyp: {
    efh: 0.08,
    zfh: 0.09,
    etw: 0.10,
    mfh: 0.11,
    wgh: 0.14,
  },
  // Energieeffizienz-Risiko
  energie: {
    'A+': 0.02,
    'A': 0.03,
    'B': 0.04,
    'C': 0.05,
    'D': 0.07,
    'E': 0.09,
    'F': 0.11,
    'G': 0.13,
    'H': 0.15,
    'unbekannt': 0.12,
  },
}

export interface RiskAnalysisResult {
  // Zentrale Statistiken
  expectedValue: number          // Erwartungswert (Mittelwert)
  standardDeviation: number      // Standardabweichung
  coefficientOfVariation: number // Variationskoeffizient (CV)
  
  // Konfidenzintervalle
  confidence90: { min: number; max: number }
  confidence95: { min: number; max: number }
  confidence99: { min: number; max: number }
  
  // Perzentile für Verteilung
  percentiles: {
    p5: number
    p10: number
    p25: number
    p50: number  // Median
    p75: number
    p90: number
    p95: number
  }
  
  // Risiko-Scores (0-100)
  overallRiskScore: number
  marketRisk: number
  objectRisk: number
  locationRisk: number
  
  // Wahrscheinlichkeiten
  probabilityAboveAsking: number  // Wahrscheinlichkeit über Kaufpreis
  probabilityBelowValue: number   // Wahrscheinlichkeit unter Marktwert
  
  // Verteilungsdaten für Chart
  distribution: { value: number; probability: number }[]
  
  // Risikokategorien
  riskCategory: 'niedrig' | 'moderat' | 'erhöht' | 'hoch'
  riskFactors: { name: string; impact: number; description: string }[]
}

/**
 * Box-Muller Transform für normalverteilte Zufallszahlen
 */
function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return z0 * stdDev + mean
}

/**
 * Berechnet das Gebäudealter und kategorisiert es
 */
function getAlterKategorie(baujahr: number): keyof typeof RISK_FACTORS.alter {
  const alter = new Date().getFullYear() - baujahr
  if (alter < 10) return 'neu'
  if (alter < 30) return 'mittel'
  if (alter < 60) return 'alt'
  return 'sehr_alt'
}

/**
 * Berechnet die kombinierte Volatilität aus allen Risikofaktoren
 */
function calculateCombinedVolatility(formData: AnalyseFormData): number {
  const lageRisk = RISK_FACTORS.lage[formData.lage as keyof typeof RISK_FACTORS.lage] || 0.12
  const alterRisk = RISK_FACTORS.alter[getAlterKategorie(parseInt(formData.baujahr) || 1980)]
  const zustandRisk = RISK_FACTORS.zustand[formData.zustand as keyof typeof RISK_FACTORS.zustand] || 0.10
  const objektRisk = RISK_FACTORS.objekttyp[formData.objekttyp as keyof typeof RISK_FACTORS.objekttyp] || 0.10
  const energieRisk = RISK_FACTORS.energie[formData.energieeffizienz as keyof typeof RISK_FACTORS.energie] || 0.12
  
  // Kombinierte Volatilität (gewichtete Summe, nicht multiplikativ um Übertreibung zu vermeiden)
  const combinedVolatility = Math.sqrt(
    Math.pow(lageRisk * 0.30, 2) +      // 30% Gewicht Lage
    Math.pow(alterRisk * 0.20, 2) +     // 20% Gewicht Alter
    Math.pow(zustandRisk * 0.25, 2) +   // 25% Gewicht Zustand
    Math.pow(objektRisk * 0.15, 2) +    // 15% Gewicht Objekttyp
    Math.pow(energieRisk * 0.10, 2)     // 10% Gewicht Energie
  )
  
  return combinedVolatility
}

/**
 * Monte-Carlo-Simulation für Marktwert
 */
function runMonteCarloSimulation(
  baseValue: number,
  volatility: number,
  iterations: number = 10000
): number[] {
  const results: number[] = []
  
  for (let i = 0; i < iterations; i++) {
    // Log-normale Verteilung für Immobilienpreise (können nicht negativ werden)
    const logMean = Math.log(baseValue) - (volatility * volatility) / 2
    const logStdDev = volatility
    const simulatedValue = Math.exp(randomNormal(logMean, logStdDev))
    results.push(simulatedValue)
  }
  
  return results.sort((a, b) => a - b)
}

/**
 * Berechnet Perzentil aus sortiertem Array
 */
function getPercentile(sortedArray: number[], percentile: number): number {
  const index = Math.ceil((percentile / 100) * sortedArray.length) - 1
  return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))]
}

/**
 * Erstellt Verteilungsdaten für Chart
 */
function createDistributionData(
  simResults: number[],
  bins: number = 50
): { value: number; probability: number }[] {
  const min = simResults[0]
  const max = simResults[simResults.length - 1]
  const binWidth = (max - min) / bins
  
  const distribution: { value: number; probability: number }[] = []
  
  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth
    const binEnd = binStart + binWidth
    const binMid = (binStart + binEnd) / 2
    
    const count = simResults.filter(v => v >= binStart && v < binEnd).length
    const probability = count / simResults.length
    
    distribution.push({ value: binMid, probability })
  }
  
  return distribution
}

/**
 * Hauptfunktion: Führt vollständige Risikoanalyse durch
 */
export function analyzeRisk(
  formData: AnalyseFormData,
  resultData: AnalyseResultData
): RiskAnalysisResult {
  const baseValue = resultData.marktwert || resultData.verkehrswert || 0
  const kaufpreis = parseFloat(formData.kaufpreis) || 0
  
  // Volatilität berechnen
  const volatility = calculateCombinedVolatility(formData)
  
  // Monte-Carlo-Simulation durchführen
  const simResults = runMonteCarloSimulation(baseValue, volatility, 10000)
  
  // Statistiken berechnen
  const sum = simResults.reduce((a, b) => a + b, 0)
  const mean = sum / simResults.length
  const variance = simResults.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / simResults.length
  const stdDev = Math.sqrt(variance)
  const cv = stdDev / mean
  
  // Perzentile
  const percentiles = {
    p5: getPercentile(simResults, 5),
    p10: getPercentile(simResults, 10),
    p25: getPercentile(simResults, 25),
    p50: getPercentile(simResults, 50),
    p75: getPercentile(simResults, 75),
    p90: getPercentile(simResults, 90),
    p95: getPercentile(simResults, 95),
  }
  
  // Konfidenzintervalle
  const confidence90 = { min: percentiles.p5, max: percentiles.p95 }
  const confidence95 = { min: getPercentile(simResults, 2.5), max: getPercentile(simResults, 97.5) }
  const confidence99 = { min: getPercentile(simResults, 0.5), max: getPercentile(simResults, 99.5) }
  
  // Risiko-Scores berechnen (0-100)
  const lageRisk = RISK_FACTORS.lage[formData.lage as keyof typeof RISK_FACTORS.lage] || 0.12
  const objektRisk = RISK_FACTORS.objekttyp[formData.objekttyp as keyof typeof RISK_FACTORS.objekttyp] || 0.10
  const zustandRisk = RISK_FACTORS.zustand[formData.zustand as keyof typeof RISK_FACTORS.zustand] || 0.10
  
  const marketRisk = Math.min(100, Math.round(lageRisk * 500))
  const objectRisk = Math.min(100, Math.round((objektRisk + zustandRisk) * 300))
  const locationRisk = Math.min(100, Math.round(lageRisk * 600))
  const overallRiskScore = Math.round((marketRisk + objectRisk + locationRisk) / 3)
  
  // Wahrscheinlichkeiten
  const probabilityAboveAsking = kaufpreis > 0
    ? simResults.filter(v => v > kaufpreis).length / simResults.length
    : 0
  const probabilityBelowValue = simResults.filter(v => v < baseValue * 0.9).length / simResults.length
  
  // Risikokategorie
  let riskCategory: RiskAnalysisResult['riskCategory']
  if (overallRiskScore < 25) riskCategory = 'niedrig'
  else if (overallRiskScore < 45) riskCategory = 'moderat'
  else if (overallRiskScore < 65) riskCategory = 'erhöht'
  else riskCategory = 'hoch'
  
  // Risikofaktoren identifizieren
  const riskFactors: RiskAnalysisResult['riskFactors'] = []
  
  if (lageRisk > 0.12) {
    riskFactors.push({
      name: 'Standortrisiko',
      impact: Math.round(lageRisk * 100),
      description: 'Die Lagequalität erhöht die Wertunsicherheit'
    })
  }
  
  const baujahr = parseInt(formData.baujahr) || 1980
  if (new Date().getFullYear() - baujahr > 40) {
    riskFactors.push({
      name: 'Altersrisiko',
      impact: Math.round(RISK_FACTORS.alter[getAlterKategorie(baujahr)] * 100),
      description: 'Ältere Gebäude haben höhere Instandhaltungsrisiken'
    })
  }
  
  if (zustandRisk > 0.08) {
    riskFactors.push({
      name: 'Zustandsrisiko',
      impact: Math.round(zustandRisk * 100),
      description: 'Der Gebäudezustand birgt Wertminderungspotenzial'
    })
  }
  
  const energieRisk = RISK_FACTORS.energie[formData.energieeffizienz as keyof typeof RISK_FACTORS.energie] || 0.12
  if (energieRisk > 0.08) {
    riskFactors.push({
      name: 'Energierisiko',
      impact: Math.round(energieRisk * 100),
      description: 'Schlechte Energieeffizienz kann zu Wertverlusten führen'
    })
  }
  
  // Verteilungsdaten für Chart
  const distribution = createDistributionData(simResults)
  
  return {
    expectedValue: mean,
    standardDeviation: stdDev,
    coefficientOfVariation: cv,
    confidence90,
    confidence95,
    confidence99,
    percentiles,
    overallRiskScore,
    marketRisk,
    objectRisk,
    locationRisk,
    probabilityAboveAsking,
    probabilityBelowValue,
    distribution,
    riskCategory,
    riskFactors,
  }
}

/**
 * Generiert Textbeschreibung der Risikoanalyse
 */
export function generateRiskSummary(risk: RiskAnalysisResult, kaufpreis: number): string {
  const formatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
  
  let summary = `**Risikoanalyse (Monte-Carlo-Simulation, n=10.000)**\n\n`
  
  summary += `**Erwartungswert:** ${formatter.format(risk.expectedValue)}\n`
  summary += `**Standardabweichung:** ${formatter.format(risk.standardDeviation)} (${(risk.coefficientOfVariation * 100).toFixed(1)}% Variationskoeffizient)\n\n`
  
  summary += `**90% Konfidenzintervall:**\n`
  summary += `${formatter.format(risk.confidence90.min)} - ${formatter.format(risk.confidence90.max)}\n\n`
  
  summary += `**Risikobewertung:** ${risk.riskCategory.toUpperCase()} (Score: ${risk.overallRiskScore}/100)\n`
  
  if (kaufpreis > 0) {
    const probPercent = (risk.probabilityAboveAsking * 100).toFixed(1)
    summary += `\n**Kaufpreis-Analyse:**\n`
    summary += `Mit ${probPercent}% Wahrscheinlichkeit liegt der tatsächliche Wert über dem Kaufpreis.\n`
  }
  
  if (risk.riskFactors.length > 0) {
    summary += `\n**Identifizierte Risikofaktoren:**\n`
    risk.riskFactors.forEach(f => {
      summary += `- ${f.name}: ${f.description}\n`
    })
  }
  
  return summary
}
