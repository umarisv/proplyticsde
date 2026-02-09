import { NextResponse } from "next/server"
import { generateReportHTML } from "@/lib/pdf/generate-report-html"
import { renderPDF } from "@/lib/pdf/render-pdf"
import { createJob, startProcessing, completeJob, failJob, canProcess } from "@/lib/pdf/job-store"

export const maxDuration = 60 // Allow up to 60s for Chromium rendering

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { resultData, formData, address } = body

    if (!resultData || !formData) {
      return NextResponse.json({ error: "Missing resultData or formData" }, { status: 400 })
    }

    // Create job
    const jobId = createJob()

    // Check concurrency
    if (!canProcess()) {
      return NextResponse.json({ jobId, status: "pending", message: "Warteschlange - bitte warten" })
    }

    // Start processing inline (no background worker needed in serverless)
    startProcessing(jobId)

    // Generate HTML and render to PDF
    try {
      const html = generateReportHTML({ resultData, formData, address })
      const pdfBuffer = await renderPDF(html)
      completeJob(jobId, pdfBuffer)
    } catch (err) {
      failJob(jobId, err instanceof Error ? err.message : "Unknown error")
    }

    return NextResponse.json({ jobId })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    )
  }
}
