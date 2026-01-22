import { NextRequest, NextResponse } from "next/server"
import type { AIAnalysisResult, FileCategory } from "@/lib/types"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    )
  }

  try {
    const { image, category } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      )
    }

    const prompt = getPromptForCategory(category as FileCategory)

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Du bist ein Experte für Immobilienbewertung. Analysiere das Bild und extrahiere relevante Informationen für eine Immobilienbewertung. Antworte IMMER im JSON-Format.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: image,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        response_format: { type: "json_object" }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI API error:", errorText)
      return NextResponse.json(
        { error: "AI analysis failed" },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: "No analysis result" },
        { status: 500 }
      )
    }

    const analysisResult = parseAIResponse(content, category as FileCategory)
    return NextResponse.json(analysisResult)

  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    )
  }
}

function getPromptForCategory(category: FileCategory): string {
  const basePrompt = `Analysiere dieses Bild einer Immobilie und gib ein JSON-Objekt zurück mit folgenden Feldern:
- zustandScore (1-10, wobei 10 = neuwertig)
- ausstattungScore (1-10, wobei 10 = Luxus)
- erkannteExtras (Array von Strings wie "balkon", "einbaukueche", "parkett", "fussbodenheizung", "kamin", etc.)
- warnungen (Array von Strings für erkannte Probleme wie "alte Fenster", "Risse in der Wand", "veraltete Heizung", etc.)
- freitext (kurze Zusammenfassung in 1-2 Sätzen)`

  switch (category) {
    case 'aussen':
      return `${basePrompt}

Fokus auf:
- Fassadenzustand (Risse, Verfärbungen, Dämmung)
- Fenster und Türen (Alter, Material)
- Dach (sichtbare Schäden)
- Eingangsbereich
- Garten/Außenanlagen`

    case 'innen':
      return `${basePrompt}

Fokus auf:
- Bodenbelag (Parkett, Laminat, Fliesen)
- Wandzustand
- Fenster und Türen (innen)
- Heizung (sichtbare Heizkörper)
- Küche/Bad-Ausstattung falls sichtbar
- Raumhöhe und Schnitt`

    case 'grundriss':
      return `Analysiere diesen Grundriss und gib ein JSON-Objekt zurück mit:
- geschaetzteWohnflaeche (Zahl in m², basierend auf dem Grundriss)
- zimmeranzahl (Anzahl der Zimmer ohne Bad/Küche/Flur)
- raumaufteilung ("gut", "mittel" oder "schlecht")
- erkannteExtras (Array: "balkon", "terrasse", "abstellraum", etc.)
- warnungen (Array: "Durchgangszimmer", "kein separates WC", "ungünstiger Schnitt", etc.)
- freitext (Beschreibung der Raumaufteilung in 2-3 Sätzen)
- zustandScore (8 als Standardwert für Grundrisse)
- ausstattungScore (8 als Standardwert für Grundrisse)`

    case 'energie':
      return `Analysiere diesen Energieausweis und extrahiere:
- energieeffizienz (Energieeffizienzklasse A+ bis H)
- freitext (Zusammenfassung der wichtigsten Kennwerte)
- warnungen (falls schlechte Effizienz)
- zustandScore (basierend auf Energieeffizienz: A+=10, A=9, B=8, C=7, D=6, E=5, F=4, G=3, H=2)
- ausstattungScore (8 als Standardwert)
- erkannteExtras (leeres Array)`

    default:
      return basePrompt
  }
}

function parseAIResponse(content: string, category: FileCategory): AIAnalysisResult {
  try {
    const parsed = JSON.parse(content)
    
    return {
      zustandScore: parsed.zustandScore || 5,
      ausstattungScore: parsed.ausstattungScore || 5,
      erkannteExtras: parsed.erkannteExtras || [],
      warnungen: parsed.warnungen || [],
      geschaetzteWohnflaeche: parsed.geschaetzteWohnflaeche,
      energieeffizienz: parsed.energieeffizienz,
      zimmeranzahl: parsed.zimmeranzahl,
      raumaufteilung: parsed.raumaufteilung,
      freitext: parsed.freitext || "Keine detaillierte Analyse verfügbar.",
      kategorie: category,
    }
  } catch {
    return {
      zustandScore: 5,
      ausstattungScore: 5,
      erkannteExtras: [],
      warnungen: ["Analyse konnte nicht durchgeführt werden"],
      freitext: "Die automatische Bildanalyse war nicht erfolgreich.",
      kategorie: category,
    }
  }
}
