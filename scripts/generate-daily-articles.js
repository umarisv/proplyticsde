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
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// Check for OpenAI API key
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is not set')
  console.error('Please set your OpenAI API key:')
  console.error('export OPENAI_API_KEY="your-api-key-here"')
  process.exit(1)
}

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

async function generateArticleWithAI(topic, category, expert, tags) {
  console.log(`🤖 Generating article about: ${topic}`)

  const date = new Date()
  const dateString = date.toISOString().split('T')[0]

  const prompt = `Schreibe einen umfassenden, fachlich fundierten Blog-Artikel über das Thema "${topic}" für Immobilieninvestoren und -käufer.

**Anforderungen:**
- Länge: Mindestens 2.500 Wörter (sehr detailliert)
- Sprache: Deutsch, professionell und sachlich
- Struktur: H1, H2, H3 Überschriften, Tabellen, Listen
- Daten: Verwende aktuelle Marktdaten und Fakten
- Quellen: Zitiere reale Quellen (Bulwiengesa, IVD, EZB, etc.)
- SEO: Integriere relevante Keywords natürlich
- Expertise: Schreibe aus Sicht eines erfahrenen Immobilienexperten

**Thema-spezifische Inhalte:**
- Aktuelle Daten und Statistiken
- Marktanalyse und Trends
- Praktische Tipps für Leser
- Prognosen und Ausblicke
- Risiken und Chancen
- Handlungsempfehlungen

**Struktur des Artikels:**
1. Einleitung mit aktueller Marktlage
2. Detaillierte Analyse des Themas
3. Daten und Statistiken in Tabellen
4. Praktische Beispiele und Berechnungen
5. Prognosen und Zukunftsaussichten
6. Handlungsempfehlungen
7. FAQ-Bereich
8. Fazit mit Expertenmeinung

**Aktuelle Marktdaten (verwende diese in deinen Berechnungen):**
- Durchschnittszins 10 Jahre fest: ${CURRENT_MARKET_DATA.interestRate}%
- Inflation Deutschland: ${CURRENT_MARKET_DATA.inflationRate}%
- Arbeitslosenquote: ${CURRENT_MARKET_DATA.unemploymentRate}%
- Ø Preis München: ${CURRENT_MARKET_DATA.averagePricePerSqm.munich} €/m²
- Ø Preis Berlin: ${CURRENT_MARKET_DATA.averagePricePerSqm.berlin} €/m²
- Marktprognose 2024: +${CURRENT_MARKET_DATA.forecast_2024}%

Schreibe den vollständigen Artikel-Text als Markdown mit allen Überschriften, Tabellen und formatierten Inhalten.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `Du bist ein erfahrener Immobilienökonom und Fachjournalist mit 15 Jahren Erfahrung. Du schreibst detaillierte, faktenbasierte Artikel für Immobilieninvestoren. Deine Artikel sind immer objektiv, gut recherchiert und enthalten konkrete Daten, Berechnungen und Handlungsempfehlungen. Antworte nur mit dem vollständigen Artikel-Text in Markdown-Format.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const articleContent = data.choices[0]?.message?.content

    if (!articleContent) {
      throw new Error('No content received from OpenAI')
    }

    // Extract title from content (first H1 heading)
    const titleMatch = articleContent.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : topic

    // Create excerpt (first 150 characters of first paragraph)
    const excerptMatch = articleContent.match(/^[^#].*$/m)
    const excerpt = excerptMatch ? excerptMatch[0].substring(0, 150).trim() + '...' : `Aktuelle Analyse zu ${topic}`

    // Estimate reading time (roughly 200 words per minute)
    const wordCount = articleContent.split(/\s+/).length
    const readTime = Math.max(5, Math.ceil(wordCount / 200))

    return {
      id: `${topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${dateString}`,
      title,
      excerpt,
      content: articleContent,
      author: expert,
      date: dateString,
      readTime: `${readTime} min`,
      category,
      tags,
      featured: true
    }

  } catch (error) {
    console.error(`❌ Error generating article for ${topic}:`, error.message)
    throw error
  }
}

async function generateZinsArticle() {
  return await generateArticleWithAI(
    "Zinsentwicklung 2024: Wohin steuern die Immobilienzinsen?",
    "Finanzierung",
    "Dr. Markus Weber, Zinsstratege & Immobilienökonom",
    ["Zinsen", "EZB", "Immobilienkredit", "2024", "Prognose", "Finanzierung", "Zinspolitik", "Kreditmarkt"]
  )
}

async function generatePriceArticle() {
  return await generateArticleWithAI(
    "Immobilienpreise 2024: Neue Höchststände in Top-Lagen und detaillierte Marktanalyse",
    "Marktanalyse",
    "Prof. Dr. Anna Schmidt, Immobilienökonomin & Marktforscherin",
    ["Preise", "Marktentwicklung", "Top-Lagen", "Rekorde", "2024", "Analyse", "Städtevergleich", "Preisprognose", "Marktdaten"]
  )
}

async function generatePoliticsArticle() {
  return await generateArticleWithAI(
    "Wohnungspolitik 2024: Neue Gesetze, Förderungen und politische Entwicklungen im Detail",
    "Politik",
    "Dr. Thomas Müller, Politikwissenschaftler & Wohnungspolitik-Experte",
    ["Politik", "Gesetze", "Förderungen", "Wohnen", "Regierung", "2024", "Wohnungspolitik", "Reformen", "Gesetzgebung"]
  )
}

async function generateArticles() {
  console.log('🚀 Starting daily AI article generation...')

  try {
    const date = new Date()
    const dayOfMonth = date.getDate()

    // Generate different articles based on day
    let articles = []

    if (dayOfMonth % 3 === 1) {
      // Days ending with 1: Zinsentwicklung
      console.log('📈 Generating Zinsentwicklung article with AI...')
      articles = [await generateZinsArticle()]
    } else if (dayOfMonth % 3 === 2) {
      // Days ending with 2: Preisentwicklung
      console.log('💰 Generating Preisentwicklung article with AI...')
      articles = [await generatePriceArticle()]
    } else {
      // Days ending with 0 or 3: Wohnungspolitik
      console.log('🏛️ Generating Wohnungspolitik article with AI...')
      articles = [await generatePoliticsArticle()]
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