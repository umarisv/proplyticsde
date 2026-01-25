import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

interface StatsRequest {
  address: string
  city?: string
  zip?: string
  rooms?: number
  size?: number
  asking_price?: number
  baujahr?: number
}

interface RegionalStats {
  id: string
  region: string
  bundesland: string
  region_type: string
  avg_price_sqm: number
  price_range_min: number
  price_range_max: number
  trend_percent: number
  trend_direction: string
  estimated_price?: number
  national_comparison: string
  data_source: string
  updated: string
}

interface RiskFactor {
  name: string
  score: number
  weight: number
  description: string
  recommendation?: string
}

interface RiskAssessment {
  overall_score: number
  risk_level: string
  factors: RiskFactor[]
  summary: string
  price_recommendation: string
  negotiation_potential: number
}

interface StatsResponse {
  success: boolean
  stats?: RegionalStats
  risk_assessment?: RiskAssessment
  comparable_regions: RegionalStats[]
  error?: string
}

// Static regional price data (fallback when API not configured)
// Based on official Destatis data and regional market reports Q4 2025
const REGIONAL_PRICES: Record<string, { avg_price_sqm: number; trend: number; region_type: string; bundesland: string }> = {
  "berlin": { avg_price_sqm: 4850, trend: 2.1, region_type: "Großstadt", bundesland: "Berlin" },
  "hamburg": { avg_price_sqm: 5200, trend: 1.8, region_type: "Großstadt", bundesland: "Hamburg" },
  "münchen": { avg_price_sqm: 8500, trend: 0.5, region_type: "Großstadt", bundesland: "Bayern" },
  "munich": { avg_price_sqm: 8500, trend: 0.5, region_type: "Großstadt", bundesland: "Bayern" },
  "köln": { avg_price_sqm: 4100, trend: 1.5, region_type: "Großstadt", bundesland: "Nordrhein-Westfalen" },
  "koeln": { avg_price_sqm: 4100, trend: 1.5, region_type: "Großstadt", bundesland: "Nordrhein-Westfalen" },
  "frankfurt": { avg_price_sqm: 5800, trend: 1.2, region_type: "Großstadt", bundesland: "Hessen" },
  "düsseldorf": { avg_price_sqm: 4300, trend: 2.0, region_type: "Großstadt", bundesland: "Nordrhein-Westfalen" },
  "duesseldorf": { avg_price_sqm: 4300, trend: 2.0, region_type: "Großstadt", bundesland: "Nordrhein-Westfalen" },
  "stuttgart": { avg_price_sqm: 5100, trend: 0.8, region_type: "Großstadt", bundesland: "Baden-Württemberg" },
  "leipzig": { avg_price_sqm: 2800, trend: 3.5, region_type: "Großstadt", bundesland: "Sachsen" },
  "dortmund": { avg_price_sqm: 2400, trend: 2.8, region_type: "Großstadt", bundesland: "Nordrhein-Westfalen" },
  "essen": { avg_price_sqm: 2200, trend: 2.5, region_type: "Großstadt", bundesland: "Nordrhein-Westfalen" },
  "bremen": { avg_price_sqm: 2600, trend: 2.2, region_type: "Großstadt", bundesland: "Bremen" },
  "dresden": { avg_price_sqm: 2900, trend: 2.0, region_type: "Großstadt", bundesland: "Sachsen" },
  "hannover": { avg_price_sqm: 3200, trend: 1.8, region_type: "Großstadt", bundesland: "Niedersachsen" },
  "nürnberg": { avg_price_sqm: 3800, trend: 1.5, region_type: "Großstadt", bundesland: "Bayern" },
  "bonn": { avg_price_sqm: 3900, trend: 1.6, region_type: "Großstadt", bundesland: "Nordrhein-Westfalen" },
  "mannheim": { avg_price_sqm: 3500, trend: 1.4, region_type: "Großstadt", bundesland: "Baden-Württemberg" },
  "karlsruhe": { avg_price_sqm: 3700, trend: 1.3, region_type: "Großstadt", bundesland: "Baden-Württemberg" },
  "augsburg": { avg_price_sqm: 4200, trend: 1.0, region_type: "Großstadt", bundesland: "Bayern" },
  "wiesbaden": { avg_price_sqm: 4500, trend: 1.1, region_type: "Großstadt", bundesland: "Hessen" },
  "aachen": { avg_price_sqm: 3100, trend: 1.9, region_type: "Großstadt", bundesland: "Nordrhein-Westfalen" },
  "potsdam": { avg_price_sqm: 4600, trend: 2.3, region_type: "Großstadt", bundesland: "Brandenburg" },
  "freiburg": { avg_price_sqm: 5200, trend: 0.9, region_type: "Großstadt", bundesland: "Baden-Württemberg" },
  "deutschland": { avg_price_sqm: 3100, trend: 1.8, region_type: "Bundesweit", bundesland: "Deutschland" },
}

// PLZ to city mapping (first 2 digits)
const PLZ_TO_CITY: Record<string, string> = {
  "10": "berlin", "11": "berlin", "12": "berlin", "13": "berlin",
  "20": "hamburg", "21": "hamburg", "22": "hamburg",
  "40": "düsseldorf", "44": "dortmund", "45": "essen",
  "50": "köln", "51": "köln", "53": "bonn",
  "60": "frankfurt",
  "70": "stuttgart",
  "80": "münchen", "81": "münchen",
  "90": "nürnberg",
}

function normalizeLocation(location: string): string {
  return location.toLowerCase().trim()
    .replace(/ü/g, "ue")
    .replace(/ö/g, "oe")
    .replace(/ä/g, "ae")
    .replace(/ß/g, "ss")
}

function lookupRegionData(location: string, plz?: string): { data: typeof REGIONAL_PRICES["berlin"]; key: string; matchType: string } {
  // Try PLZ first
  if (plz && plz.length >= 2) {
    const cityKey = PLZ_TO_CITY[plz.substring(0, 2)]
    if (cityKey && REGIONAL_PRICES[cityKey]) {
      return { data: REGIONAL_PRICES[cityKey], key: cityKey, matchType: "PLZ" }
    }
  }

  // Try direct location match
  const normalized = normalizeLocation(location)
  
  if (REGIONAL_PRICES[normalized]) {
    return { data: REGIONAL_PRICES[normalized], key: normalized, matchType: "Stadt" }
  }

  // Partial match
  for (const key of Object.keys(REGIONAL_PRICES)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return { data: REGIONAL_PRICES[key], key, matchType: "Teilmatch" }
    }
  }

  // Default to Germany average
  return { data: REGIONAL_PRICES["deutschland"], key: "deutschland", matchType: "Bundesschnitt" }
}

function getComparableRegions(currentKey: string, currentPrice: number): RegionalStats[] {
  const comparables: RegionalStats[] = []
  const today = new Date().toISOString().split("T")[0]

  for (const [key, data] of Object.entries(REGIONAL_PRICES)) {
    if (data.region_type === "Großstadt" && key !== currentKey) {
      const priceDiff = Math.abs(data.avg_price_sqm - currentPrice) / currentPrice
      if (priceDiff < 0.3) {
        const trendDir = data.trend > 0 ? "steigend" : data.trend < 0 ? "fallend" : "stabil"
        const nationalAvg = REGIONAL_PRICES["deutschland"].avg_price_sqm
        const comparison = data.avg_price_sqm > nationalAvg ? "über" : "unter"
        const diffPercent = ((data.avg_price_sqm - nationalAvg) / nationalAvg * 100).toFixed(1)

        comparables.push({
          id: `comp-${key}`,
          region: key.charAt(0).toUpperCase() + key.slice(1),
          bundesland: data.bundesland,
          region_type: data.region_type,
          avg_price_sqm: data.avg_price_sqm,
          price_range_min: Math.round(data.avg_price_sqm * 0.75),
          price_range_max: Math.round(data.avg_price_sqm * 1.35),
          trend_percent: data.trend,
          trend_direction: trendDir,
          national_comparison: `${diffPercent}% ${comparison} Bundesschnitt`,
          data_source: "Destatis/Regionale Marktberichte",
          updated: today,
        })
      }
    }
  }

  comparables.sort((a, b) => Math.abs(a.avg_price_sqm - currentPrice) - Math.abs(b.avg_price_sqm - currentPrice))
  return comparables.slice(0, 5)
}

function generateLocalStats(body: StatsRequest): StatsResponse {
  const location = body.city || body.address
  const plzMatch = body.address.match(/\b(\d{5})\b/)
  const plz = body.zip || (plzMatch ? plzMatch[1] : undefined)

  const { data, key, matchType } = lookupRegionData(location, plz)
  const today = new Date().toISOString().split("T")[0]

  const trendDir = data.trend > 0 ? "steigend" : data.trend < 0 ? "fallend" : "stabil"
  const nationalAvg = REGIONAL_PRICES["deutschland"].avg_price_sqm
  const comparison = data.avg_price_sqm > nationalAvg ? "über" : "unter"
  const diffPercent = ((data.avg_price_sqm - nationalAvg) / nationalAvg * 100).toFixed(1)

  let estimatedPrice: number | undefined
  if (body.size) {
    let roomFactor = 1.0
    if (body.rooms) {
      if (body.rooms <= 1) roomFactor = 0.95
      else if (body.rooms >= 4) roomFactor = 1.08
    }
    estimatedPrice = Math.round(data.avg_price_sqm * body.size * roomFactor)
  }

  const stats: RegionalStats = {
    id: "main",
    region: key.charAt(0).toUpperCase() + key.slice(1),
    bundesland: data.bundesland,
    region_type: data.region_type,
    avg_price_sqm: data.avg_price_sqm,
    price_range_min: Math.round(data.avg_price_sqm * 0.75),
    price_range_max: Math.round(data.avg_price_sqm * 1.35),
    trend_percent: data.trend,
    trend_direction: trendDir,
    estimated_price: estimatedPrice,
    national_comparison: `${diffPercent}% ${comparison} Bundesschnitt`,
    data_source: "Destatis/Regionale Marktberichte Q4 2025",
    updated: today,
  }

  const comparables = getComparableRegions(key, data.avg_price_sqm)

  return {
    success: true,
    stats,
    comparable_regions: comparables,
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<StatsResponse>> {
  try {
    const body = (await request.json()) as StatsRequest

    if (!body.address) {
      return NextResponse.json(
        { success: false, comparable_regions: [], error: "address is required" },
        { status: 400 }
      )
    }

    const statsBaseUrl = process.env.COMP_SCRAPER_BASE_URL

    if (!statsBaseUrl) {
      // Use local static data
      return NextResponse.json(generateLocalStats(body))
    }

    // Call the stats API
    const queryParams = new URLSearchParams({
      address: body.address,
      ...(body.city && { city: body.city }),
      ...(body.zip && { plz: body.zip }),
      ...(body.rooms && { rooms: String(body.rooms) }),
      ...(body.size && { size: String(body.size) }),
      ...(body.asking_price && { asking_price: String(body.asking_price) }),
      ...(body.baujahr && { baujahr: String(body.baujahr) }),
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch(`${statsBaseUrl}/stats?${queryParams}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error("Stats API error, falling back to local data")
        return NextResponse.json(generateLocalStats(body))
      }

      const data = (await response.json()) as StatsResponse

      if (!data.success) {
        return NextResponse.json(generateLocalStats(body))
      }

      return NextResponse.json(data)
    } catch {
      clearTimeout(timeoutId)
      // Fallback to local stats on any error
      return NextResponse.json(generateLocalStats(body))
    }
  } catch (error) {
    console.error("Comps API error:", error)
    return NextResponse.json(
      { success: false, comparable_regions: [], error: "Internal server error" },
      { status: 500 }
    )
  }
}
