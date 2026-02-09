import { NextResponse } from "next/server"
import { getJob } from "@/lib/pdf/job-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get("jobId")

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 })
  }

  const job = getJob(jobId)
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  return NextResponse.json({
    jobId: job.id,
    status: job.status,
    error: job.error,
  })
}
