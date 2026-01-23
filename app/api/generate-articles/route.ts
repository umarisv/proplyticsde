import { NextResponse } from 'next/server'

// Article generation system for daily content creation
// This API generates articles using OpenAI GPT-4

interface GeneratedArticle {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  date: string
  readTime: string
  category: string
  tags: string[]
  featured: boolean
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

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

async function generateArticleWithAI(topic: string, category: string, expert: string, tags: string[]): Promise<GeneratedArticle> {
  console.log(`🤖 Generating article about: ${topic}`)

  const date = new Date()
  const dateString = date.toISOString().split('T')[0]

  const prompt = `Schreibe einen umfassenden, fachlich fundierten Blog-Artikel über das Thema "${topic}" für Immobilieninvestoren und -käufer.

**Anforderungen:**
- Länge: Mindestens 2.500 Wörter (sehr detailliert und fachlich)
- Sprache: Deutsch, professionell und sachlich
- Struktur: H1, H2, H3 Überschriften, Tabellen, Listen, Bullet Points
- Daten: Verwende aktuelle Marktdaten und Fakten aus 2024
- Quellen: Zitiere reale Quellen (Bulwiengesa, IVD, EZB, Statistisches Bundesamt, etc.)
- SEO: Integriere relevante Keywords natürlich
- Expertise: Schreibe aus Sicht eines erfahrenen Immobilienexperten

**Thema-spezifische Inhalte:**
- Aktuelle Daten und Statistiken in Tabellen
- Marktanalyse und Trends mit Zahlen
- Praktische Tipps für Leser mit konkreten Beispielen
- Prognosen und Zukunftsaussichten mit Daten
- Risiken und Chancen mit quantitativen Analysen
- Handlungsempfehlungen mit Berechnungen

**Struktur des Artikels:**
1. Einleitung mit aktueller Marktlage und wichtigen Kennzahlen
2. Detaillierte Analyse des Themas mit Daten und Tabellen
3. Markttrends und Entwicklungen mit Statistiken
4. Praktische Beispiele und Berechnungen
5. Risikoanalyse mit quantitativen Szenarien
6. Prognosen und Zukunftsaussichten
7. Handlungsempfehlungen mit konkreten Zahlen
8. FAQ-Bereich mit häufigen Fragen
9. Fazit mit Expertenmeinung und Zusammenfassung

**Aktuelle Marktdaten (verwende diese in deinen Berechnungen):**
- Durchschnittszins 10 Jahre fest: ${CURRENT_MARKET_DATA.interestRate}%
- Inflation Deutschland: ${CURRENT_MARKET_DATA.inflationRate}%
- Arbeitslosenquote: ${CURRENT_MARKET_DATA.unemploymentRate}%
- Ø Preis München: ${CURRENT_MARKET_DATA.averagePricePerSqm.munich} €/m²
- Ø Preis Berlin: ${CURRENT_MARKET_DATA.averagePricePerSqm.berlin} €/m²
- Marktprognose 2024: +${CURRENT_MARKET_DATA.forecast_2024}%

Schreibe den vollständigen Artikel-Text als Markdown mit allen Überschriften, Tabellen und formatierten Inhalten.`

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

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
    console.error(`❌ Error generating article for ${topic}:`, error)
    throw error
  }
}

export async function GET() {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const date = new Date()
    const dayOfMonth = date.getDate()

    // Generate different articles based on day
    let articles = []

    if (dayOfMonth % 3 === 1) {
      // Days ending with 1: Zinsentwicklung
      console.log('📈 Generating Zinsentwicklung article with AI...')
      articles = [await generateArticleWithAI(
        "Zinsentwicklung 2024: Wohin steuern die Immobilienzinsen?",
        "Finanzierung",
        "Dr. Markus Weber, Zinsstratege & Immobilienökonom",
        ["Zinsen", "EZB", "Immobilienkredit", "2024", "Prognose", "Finanzierung", "Zinspolitik", "Kreditmarkt"]
      )]
    } else if (dayOfMonth % 3 === 2) {
      // Days ending with 2: Preisentwicklung
      console.log('💰 Generating Preisentwicklung article with AI...')
      articles = [await generateArticleWithAI(
        "Immobilienpreise 2024: Neue Höchststände in Top-Lagen und detaillierte Marktanalyse",
        "Marktanalyse",
        "Prof. Dr. Anna Schmidt, Immobilienökonomin & Marktforscherin",
        ["Preise", "Marktentwicklung", "Top-Lagen", "Rekorde", "2024", "Analyse", "Städtevergleich", "Preisprognose"]
      )]
    } else {
      // Days ending with 0 or 3: Wohnungspolitik
      console.log('🏛️ Generating Wohnungspolitik article with AI...')
      articles = [await generateArticleWithAI(
        "Wohnungspolitik 2024: Neue Gesetze, Förderungen und politische Entwicklungen im Detail",
        "Politik",
        "Dr. Thomas Müller, Politikwissenschaftler & Wohnungspolitik-Experte",
        ["Politik", "Gesetze", "Förderungen", "Wohnen", "Regierung", "2024", "Wohnungspolitik", "Reformen", "Gesetzgebung"]
      )]
    }

    return NextResponse.json({
      status: 'success',
      count: articles.length,
      articles: articles,
      generated_at: new Date().toISOString(),
      message: 'Artikel erfolgreich mit KI generiert'
    })

  } catch (error) {
    console.error('Article generation error:', error)

    return NextResponse.json({
      status: 'error',
      message: 'Fehler bei der KI-Artikelgenerierung',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST() {
  // Allow manual generation of specific articles
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    console.log('🤖 Generating all 3 articles with AI...')
    const articles = [
      await generateArticleWithAI(
        "Zinsentwicklung 2024: Wohin steuern die Immobilienzinsen?",
        "Finanzierung",
        "Dr. Markus Weber, Zinsstratege & Immobilienökonom",
        ["Zinsen", "EZB", "Immobilienkredit", "2024", "Prognose", "Finanzierung", "Zinspolitik", "Kreditmarkt"]
      ),
      await generateArticleWithAI(
        "Immobilienpreise 2024: Neue Höchststände in Top-Lagen und detaillierte Marktanalyse",
        "Marktanalyse",
        "Prof. Dr. Anna Schmidt, Immobilienökonomin & Marktforscherin",
        ["Preise", "Marktentwicklung", "Top-Lagen", "Rekorde", "2024", "Analyse", "Städtevergleich", "Preisprognose"]
      ),
      await generateArticleWithAI(
        "Wohnungspolitik 2024: Neue Gesetze, Förderungen und politische Entwicklungen im Detail",
        "Politik",
        "Dr. Thomas Müller, Politikwissenschaftler & Wohnungspolitik-Experte",
        ["Politik", "Gesetze", "Förderungen", "Wohnen", "Regierung", "2024", "Wohnungspolitik", "Reformen", "Gesetzgebung"]
      )
    ]

    return NextResponse.json({
      status: 'success',
      count: articles.length,
      articles: articles,
      generated_at: new Date().toISOString(),
      message: 'Alle drei Artikel mit KI generiert'
    })

  } catch (error) {
    console.error('Manual article generation error:', error)

    return NextResponse.json({
      status: 'error',
      message: 'Fehler bei der manuellen KI-Artikelgenerierung',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}