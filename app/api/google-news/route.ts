import { NextResponse } from 'next/server'

// Google News API integration for SEO content
// This would typically use Google News API or RSS feeds
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || 'Immobilien Deutschland'
  const limit = parseInt(searchParams.get('limit') || '10')

  try {
    // In production, you would use Google News API or RSS feeds
    // For now, we'll return mock data that represents current trends

    const mockNews = [
      {
        title: "Immobilienpreise in München steigen um 12% im letzten Quartal",
        description: "Die Immobilienpreise in der bayerischen Landeshauptstadt zeigen weiterhin starke Aufwärtsentwicklung. Experten erwarten weitere Preissteigerungen.",
        url: "https://www.immobilien-zeitung.de/muenchen-preise-steigen",
        source: "Immobilien Zeitung",
        publishedAt: new Date().toISOString(),
        imageUrl: "/news/muenchen-prices.jpg"
      },
      {
        title: "Neue Bauvorschriften für energieeffiziente Häuser ab 2025",
        description: "Die Bundesregierung plant strengere Vorschriften für Neubauten. Energieeffizienz wird zum entscheidenden Faktor bei der Immobilienbewertung.",
        url: "https://www.bauindustrie.de/neue-bauvorschriften-2025",
        source: "Bauindustrie Magazin",
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        imageUrl: "/news/bauvorschriften.jpg"
      },
      {
        title: "KI-gestützte Immobilienbewertung wird zum Standard",
        description: "Moderne KI-Systeme revolutionieren die Immobilienbewertung. Traditionelle Gutachter sehen sich mit neuen Konkurrenten konfrontiert.",
        url: "https://www.immobilien-manager.de/ki-bewertung-standard",
        source: "Immobilien Manager",
        publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        imageUrl: "/news/ki-bewertung.jpg"
      },
      {
        title: "Wohnungsknappheit: Berlin plant 50.000 neue Wohnungen",
        description: "Die Bundeshauptstadt reagiert auf die akute Wohnungsknappheit mit einem ambitionierten Bauprogramm für die kommenden Jahre.",
        url: "https://www.berliner-zeitung.de/berlin-wohnungsbau-programm",
        source: "Berliner Zeitung",
        publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        imageUrl: "/news/berlin-wohnungen.jpg"
      },
      {
        title: "Zinsen für Immobilienkredite bleiben stabil",
        description: "Die Europäische Zentralbank hält die Zinsen stabil. Experten erwarten keine großen Veränderungen in den kommenden Monaten.",
        url: "https://www.finanzen-aktuell.de/zinsen-immobilienkredite-stabil",
        source: "Finanzen Aktuell",
        publishedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        imageUrl: "/news/zinsen-stabil.jpg"
      },
      {
        title: "Nachhaltige Immobilien boomen am Markt",
        description: "Grüne Gebäude erzielen höhere Preise und finden schneller Käufer. Nachhaltigkeit wird zum entscheidenden Wettbewerbsfaktor.",
        url: "https://www.green-property.de/nachhaltige-immobilien-boom",
        source: "Green Property",
        publishedAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        imageUrl: "/news/nachhaltig-boom.jpg"
      }
    ]

    // Filter by query if provided
    const filteredNews = query !== 'Immobilien Deutschland'
      ? mockNews.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
        )
      : mockNews

    // Limit results
    const limitedNews = filteredNews.slice(0, limit)

    return NextResponse.json({
      status: 'success',
      query,
      totalResults: filteredNews.length,
      articles: limitedNews,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Google News API Error:', error)

    return NextResponse.json({
      status: 'error',
      message: 'Fehler beim Laden der Nachrichten',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}