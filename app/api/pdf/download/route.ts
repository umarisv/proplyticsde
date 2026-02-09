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

  if (job.status !== "done" || !job.pdf) {
    return NextResponse.json({ error: "PDF not ready", status: job.status }, { status: 202 })
  }

  return new NextResponse(job.pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Marktpreiseinschaetzung.pdf"`,
      "Content-Length": String(job.pdf.length),
    },
  })
}
