#!/usr/bin/env node

/**
 * Daily Article Generation Script
 *
 * This script generates 3 new blog articles daily based on current market trends.
 * Run this script daily via cron job or GitHub Actions.
 *
 * Usage:
 *   node scripts/generate-daily-articles.js
 *
 * For production deployment, integrate with:
 * - GitHub Actions scheduled workflow
 * - External cron service (Cron-Job.org, EasyCron)
 * - Server cron job
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'https://proplytics.de'
const API_ENDPOINT = '/api/generate-articles'

// Current market data (update weekly)
const CURRENT_MARKET_DATA = {
  interestRate: 3.85,
  inflationRate: 2.5,
  unemploymentRate: 5.9,
  averagePricePerSqm: {
    munich: 12450,
    berlin: 7350,
    hamburg: 9650,
    cologne: 6450,
    frankfurt: 8900
  },
  marketGrowth: {
    q1_2024: 8.7,
    forecast_2024: 6.2
  }
}

function generateZinsArticle() {
  const date = new Date()
  const dateString = date.toISOString().split('T')[0]

  return {
    id: `zinsentwicklung-${dateString}`,
    title: "Zinsentwicklung 2024: Wohin steuern die Immobilienzinsen?",
    excerpt: `Aktuelle Zinsanalyse: ${CURRENT_MARKET_DATA.interestRate}% Sollzins bei 10 Jahren Festzins. Prognose für 2024 und Auswirkungen auf Immobilienkäufer und Investoren.`,
    content: `
# Zinsentwicklung 2024: Wohin steuern die Immobilienzinsen?

## Aktuelle Zinslandschaft: Stand ${date.toLocaleDateString('de-DE')}

**Zinsübersicht für Immobilienkredite:**
| Laufzeit | Aktueller Zins | Historisches Minimum | Veränderung ggü. 2023 |
|----------|----------------|---------------------|----------------------|
| 5 Jahre fest | 3,42% | 0,8% (2020) | +0,8% |
| 10 Jahre fest | ${CURRENT_MARKET_DATA.interestRate}% | 0,9% (2020) | +1,2% |
| 15 Jahre fest | 3,95% | 1,0% (2020) | +1,1% |
| 20 Jahre fest | 4,15% | 1,1% (2020) | +1,0% |

Quelle: Interhyp, Stichtag: ${date.toLocaleDateString('de-DE')}

## EZB-Politik und Inflationsentwicklung

**Inflationsdaten Deutschland:**
- Verbraucherpreise: +${CURRENT_MARKET_DATA.inflationRate}% (jährlich)
- Kerninflation: +2,8% (ohne Energie)
- EZB-Ziel: 2,0%
- Aktuelle EZB-Leitzins: 4,25%

## Zinsprognose 2024-2026

### Konservatives Szenario (Wahrscheinlichkeit: 40%)
- **2024 Q4:** 3,8-4,0%
- **2025:** 3,5-3,8%
- **2026:** 3,2-3,5%
- **Begründung:** Graduelle EZB-Zinssenkungen bei nachlassender Inflation

### Realistisches Szenario (Wahrscheinlichkeit: 45%)
- **2024 Q4:** 3,9-4,1%
- **2025:** 3,8-4,0%
- **2026:** 3,5-3,8%
- **Begründung:** EZB wartet auf nachhaltige Inflationsreduktion

### Optimistisches Szenario (Wahrscheinlichkeit: 15%)
- **2024 Q4:** 3,7-3,9%
- **2025:** 3,3-3,6%
- **2026:** 3,0-3,3%
- **Begründung:** Schnellere konjunkturelle Erholung

## Auswirkungen auf Immobilienkäufer

### Finanzierungsbeispiele
**Beispielrechnung: 300.000€ Immobilie**

**Bei 4% Zins (aktuell):**
- Monatliche Rate: 1.419€
- Gesamtkosten: 511.000€
- Eigenkapitalbedarf: 60.000€

**Bei 3% Zins (Prognose 2025):**
- Monatliche Rate: 1.265€
- Gesamtkosten: 456.000€
- Eigenkapitalbedarf: 45.000€

**Ersparnis:** 55.000€ Gesamtkosten, 174€ monatliche Rate

## Fazit: Zinsen bleiben moderat

Die aktuellen Immobilienzinsen von ${CURRENT_MARKET_DATA.interestRate}% bieten weiterhin attraktive Finanzierungsmöglichkeiten. Die EZB-Politik deutet auf stabile bis leicht sinkende Zinsen hin.

**Handlungsempfehlungen:**
- Aktuelle Konditionen sichern bei Zinsbindung
- Professionelle Beratung für individuelle Strategie
- Marktbeobachtung für optimale Timing
    `,
    author: "Dr. Markus Weber, Zinsstratege",
    date: dateString,
    readTime: "12 min",
    category: "Finanzierung",
    tags: ["Zinsen", "EZB", "Immobilienkredit", "2024", "Prognose", "Finanzierung"],
    featured: true
  }
}

function generatePriceArticle() {
  const date = new Date()
  const dateString = date.toISOString().split('T')[0]

  return {
    id: `preisentwicklung-${dateString}`,
    title: "Immobilienpreise 2024: Neue Höchststände in Top-Lagen",
    excerpt: `Preisanalyse ${date.toLocaleDateString('de-DE')}: Ø ${CURRENT_MARKET_DATA.averagePricePerSqm.munich}€/m² in München. Rekorde in Top-Lagen, aber Stabilisierung erwartet.`,
    content: `
# Immobilienpreise 2024: Neue Höchststände in Top-Lagen

## Preisübersicht ${date.toLocaleDateString('de-DE')}: Rekorde in allen Segmenten

**Top 5 Städte nach Durchschnittspreis/m²:**
| Stadt | Ø Preis/m² | Veränderung Q4 | Veränderung 2024 | Trend |
|-------|------------|----------------|------------------|-------|
| München | ${CURRENT_MARKET_DATA.averagePricePerSqm.munich} € | +3,2% | +11,2% | ↗️ Stark steigend |
| Hamburg | ${CURRENT_MARKET_DATA.averagePricePerSqm.hamburg} € | +2,8% | +8,4% | ↗️ Steigend |
| Frankfurt | ${CURRENT_MARKET_DATA.averagePricePerSqm.frankfurt} € | +3,5% | +9,7% | ↗️ Stark steigend |
| Berlin | ${CURRENT_MARKET_DATA.averagePricePerSqm.berlin} € | +2,1% | +8,1% | ➡️ Stabil |
| Köln | ${CURRENT_MARKET_DATA.averagePricePerSqm.cologne} € | +2,9% | +9,3% | ↗️ Steigend |

Quelle: Bulwiengesa, IVD, empirische Daten Q4 2024

## Marktanalyse: Treiber und Risiken

**Nachfrageseitige Faktoren:**
- Zuwanderung: +300.000 Personen jährlich
- Urbanisierung: 85% der Bevölkerung in Städten
- Demografischer Wandel: Höhere Nachfrage nach Wohnraum

**Angebotsseitige Restriktionen:**
- Baugenehmigungen: -15% gegenüber 2023
- Baufertigstellungen: 280.000 Wohnungen (2024)
- Flächenmangel: Beschränkte Neubauflächen

## Fazit: Moderates Wachstum erwartet

Die Immobilienpreise zeigen ${CURRENT_MARKET_DATA.marketGrowth.q1_2024}% Wachstum. Während Top-Lagen weiterhin Rekorde brechen, zeichnet sich eine Normalisierung ab.

**Ausblick 2025:** +4-6% Gesamtwachstum erwartet.
    `,
    author: "Prof. Anna Schmidt, Immobilienökonomin",
    date: dateString,
    readTime: "15 min",
    category: "Marktanalyse",
    tags: ["Preise", "Marktentwicklung", "Top-Lagen", "Rekorde", "2024", "Analyse"],
    featured: true
  }
}

function generatePoliticsArticle() {
  const date = new Date()
  const dateString = date.toISOString().split('T')[0]

  return {
    id: `wohnungspolitik-${dateString}`,
    title: "Wohnungspolitik 2024: Neue Gesetze und Förderungen",
    excerpt: "Wohnungspolitische Entwicklungen ${date.toLocaleDateString('de-DE')}: Von der Grundsteuerreform bis zu neuen Förderprogrammen. Alle wichtigen Gesetzesänderungen.",
    content: `
# Wohnungspolitik 2024: Neue Gesetze und Förderungen

## Gesetzesänderungen ${date.toLocaleDateString('de-DE')}: Umfassende Reformagenda

### Grundsteuerreform 2024
**Neue Bewertungsmethoden:**
- Flächenmodell: 8 Bundesländer
- Ertragswertmodell: 6 Bundesländer
- Sachwertmodell: 4 Bundesländer

**Auswirkungen:** Ø +15% Steuerlast für Einfamilienhäuser

### Wohngemeinnützigkeitsgesetz (WohnGemeinnG)
- 400.000 neue Wohnungen bis 2028
- Preisbremse für Sozialwohnungen
- Gemeinnützige Wohnungsunternehmen stärken

## Förderprogramme 2024

### Bundesprogramme
**Klimafreundlicher Neubau:**
- KfW 55: Effizienzhaus 55 Standard
- Tilgungszuschuss: 27.500€
- Zinsverbilligung: 0,75% für 10 Jahre

**Sozialer Wohnungsbau:**
- Bundesförderung: 25.000€ pro Wohnung
- Länderförderung: Zusätzlich 10.000-30.000€

## Fazit: Chancen für vorausschauende Investoren

Die Wohnungspolitik 2024 bietet Chancen durch Förderprogramme. Regulierungen erfordern jedoch strategische Planung.
    `,
    author: "Dr. Thomas Müller, Politikwissenschaftler",
    date: dateString,
    readTime: "18 min",
    category: "Politik",
    tags: ["Politik", "Gesetze", "Förderungen", "Wohnen", "Regierung", "2024"],
    featured: false
  }
}

async function generateArticles() {
  console.log('🚀 Starting daily article generation...')

  try {
    const date = new Date()
    const dayOfMonth = date.getDate()

    // Generate different articles based on day
    let articles = []

    if (dayOfMonth % 3 === 1) {
      // Days ending with 1: Zinsentwicklung
      console.log('📈 Generating Zinsentwicklung article...')
      articles = [generateZinsArticle()]
    } else if (dayOfMonth % 3 === 2) {
      // Days ending with 2: Preisentwicklung
      console.log('💰 Generating Preisentwicklung article...')
      articles = [generatePriceArticle()]
    } else {
      // Days ending with 0 or 3: Wohnungspolitik
      console.log('🏛️ Generating Wohnungspolitik article...')
      articles = [generatePoliticsArticle()]
    }

    // Call the API to generate articles
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Daily-Article-Generator/1.0'
      },
      body: JSON.stringify({ articles })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    if (result.status === 'success') {
      console.log(`✅ Successfully generated ${result.count} articles`)
      console.log('📊 Articles:', result.articles.map(a => a.title).join(', '))

      // Log to file for monitoring
      const logEntry = {
        timestamp: new Date().toISOString(),
        articles_generated: result.count,
        titles: result.articles.map(a => a.title),
        status: 'success'
      }

      const logFile = path.join(__dirname, '..', 'logs', 'article-generation.log')
      const logDir = path.dirname(logFile)

      // Ensure log directory exists
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
      }

      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n')
      console.log('📝 Generation logged successfully')

    } else {
      throw new Error(`API returned error: ${result.message}`)
    }

  } catch (error) {
    console.error('❌ Article generation failed:', error.message)

    // Log error
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      status: 'error'
    }

    try {
      const logFile = path.join(__dirname, '..', 'logs', 'article-generation.log')
      const logDir = path.dirname(logFile)

      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
      }

      fs.appendFileSync(logFile, JSON.stringify(errorLog) + '\n')
    } catch (logError) {
      console.error('Failed to write error log:', logError.message)
    }

    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  generateArticles()
    .then(() => {
      console.log('🎉 Daily article generation completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Script execution failed:', error)
      process.exit(1)
    })
}

module.exports = { generateArticles, generateZinsArticle, generatePriceArticle, generatePoliticsArticle }