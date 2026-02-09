import { NextResponse } from "next/server"
import { getPDFJobStatus } from "@/lib/aws/pdf-jobs"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get("jobId")

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 })
  }

  try {
    const job = await getPDFJobStatus(jobId)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({
      jobId: job.jobId,
      status: job.status,
      error: job.error,
    })
  } catch (err) {
    console.error("PDF status error:", err)
    return NextResponse.json({ error: "Failed to fetch job status" }, { status: 500 })
  }
}
