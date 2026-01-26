import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const allowedGetEndpoints = new Set(["health", "properties", "snapshots", "features", "stats"])
const snapshotFeaturesPattern = /^snapshots\/\d+\/features$/
const allowedGetEndpointHint = [
  "health",
  "properties",
  "snapshots",
  "features",
  "stats",
  "snapshots/{id}/features",
]

function isAllowedGetEndpoint(endpoint: string) {
  return allowedGetEndpoints.has(endpoint) || snapshotFeaturesPattern.test(endpoint)
}
const allowedPostEndpoints = new Set(["scrape"])

function getBaseUrl() {
  const baseUrl = process.env.PROPAI_BASE_URL
  if (!baseUrl) {
    throw new Error("PROPAI_BASE_URL is not configured")
  }
  return baseUrl.replace(/\/$/, "")
}

function buildTargetUrl(baseUrl: string, endpoint: string, params: URLSearchParams) {
  const targetUrl = new URL(`${baseUrl}/${endpoint}`)
  params.forEach((value, key) => {
    if (key !== "endpoint") {
      targetUrl.searchParams.append(key, value)
    }
  })
  return targetUrl
}

export async function GET(request: NextRequest) {
  try {
    const endpoint = request.nextUrl.searchParams.get("endpoint")?.trim() ?? ""
    if (!endpoint || !isAllowedGetEndpoint(endpoint)) {
      return NextResponse.json(
        { error: `Invalid endpoint. Use one of: ${allowedGetEndpointHint.join(", ")}.` },
        { status: 400 }
      )
    }

    const baseUrl = getBaseUrl()
    const targetUrl = buildTargetUrl(baseUrl, endpoint, request.nextUrl.searchParams)

    const response = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("PropAI GET proxy error:", error)
    return NextResponse.json({ error: "PropAI service unavailable" }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const endpoint = request.nextUrl.searchParams.get("endpoint")?.trim() || "scrape"
    if (!allowedPostEndpoints.has(endpoint)) {
      return NextResponse.json(
        { error: "Invalid endpoint. Use endpoint=scrape for POST requests." },
        { status: 400 }
      )
    }

    const baseUrl = getBaseUrl()
    const targetUrl = buildTargetUrl(baseUrl, endpoint, request.nextUrl.searchParams)
    const body = await request.json()

    const response = await fetch(targetUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("PropAI POST proxy error:", error)
    return NextResponse.json({ error: "PropAI service unavailable" }, { status: 502 })
  }
}
