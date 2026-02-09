import { NextResponse } from "next/server"
import { createPDFJob } from "@/lib/aws/pdf-jobs"

export const maxDuration = 10

export async function POST(request: Request) {
  try {
    const { resultData, formData, address } = await request.json()

    if (!resultData || !formData) {
      return NextResponse.json({ error: "Missing resultData or formData" }, { status: 400 })
    }

    const jobId = await createPDFJob({ resultData, formData, address })

    return NextResponse.json({ jobId })
  } catch (err) {
    console.error("PDF create error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create PDF job" },
      { status: 500 }
    )
  }
}
