import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

// Allowed domains for whitelisted scraping
const ALLOWED_DOMAINS = ["immobilienscout24.de", "immoscout24.de"]

interface CompRequest {
  address: string
  city?: string
  zip?: string
  rooms?: number
  size?: number
  radius?: number // km
}

interface Comparable {
  id: string
  address: string
  price: number
  size: number
  rooms: number
  distance: number // km
  listingDate: string
  url?: string
}

interface CompsResponse {
  success: boolean
  comps: Comparable[]
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<CompsResponse>> {
  try {
    const body = (await request.json()) as CompRequest

    if (!body.address) {
      return NextResponse.json(
        { success: false, comps: [], error: "address is required" },
        { status: 400 }
      )
    }

    const scraperBaseUrl = process.env.COMP_SCRAPER_BASE_URL
    const scraperToken = process.env.COMP_SCRAPER_TOKEN

    if (!scraperBaseUrl) {
      // If no scraper configured, return mock data for development
      return NextResponse.json({
        success: true,
        comps: generateMockComps(body),
      })
    }

    // Build query for whitelisted endpoint
    const queryParams = new URLSearchParams({
      address: body.address,
      ...(body.city && { city: body.city }),
      ...(body.zip && { zip: body.zip }),
      ...(body.rooms && { rooms: String(body.rooms) }),
      ...(body.size && { size: String(body.size) }),
      ...(body.radius && { radius: String(body.radius) }),
    })

    const controller = new AbortController()
    // Scraper can take up to 60s on first request (browser startup)
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (scraperToken) {
      headers["Authorization"] = `Bearer ${scraperToken}`
    }

    const response = await fetch(`${scraperBaseUrl}/comps?${queryParams}`, {
      method: "GET",
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Scraper error:", errorText)
      return NextResponse.json(
        { success: false, comps: [], error: `Scraper returned ${response.status}: ${errorText.slice(0, 200)}` },
        { status: 502 }
      )
    }

    const data = (await response.json()) as { success: boolean; comps: Comparable[]; error?: string }

    if (!data.success) {
      return NextResponse.json({
        success: false,
        comps: [],
        error: data.error || "Scraper returned unsuccessful response",
      })
    }

    return NextResponse.json({
      success: true,
      comps: data.comps || [],
    })
  } catch (error) {
    console.error("Comps API error:", error)

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { success: false, comps: [], error: "Request timed out" },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { success: false, comps: [], error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Mock data generator for development/demo
function generateMockComps(query: CompRequest): Comparable[] {
  const basePrice = 250000 + Math.random() * 200000
  const baseSize = query.size || 80

  return Array.from({ length: 5 }, (_, i) => ({
    id: `mock-${i + 1}`,
    address: `${query.address} Nähe ${i + 1}`,
    price: Math.round(basePrice + (Math.random() - 0.5) * 100000),
    size: Math.round(baseSize + (Math.random() - 0.5) * 30),
    rooms: query.rooms || Math.floor(2 + Math.random() * 3),
    distance: Math.round((0.5 + Math.random() * 3) * 10) / 10,
    listingDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    url: undefined,
  }))
}
