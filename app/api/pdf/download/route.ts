import { NextResponse } from "next/server"
import { getPDFJobStatus, getPDFDownloadUrl } from "@/lib/aws/pdf-jobs"

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

    if (job.status !== "done" || !job.s3Key) {
      return NextResponse.json({ error: "PDF not ready", status: job.status }, { status: 202 })
    }

    // Return a presigned S3 URL (redirect)
    const downloadUrl = await getPDFDownloadUrl(job.s3Key)
    return NextResponse.redirect(downloadUrl)
  } catch (err) {
    console.error("PDF download error:", err)
    return NextResponse.json({ error: "Failed to get download URL" }, { status: 500 })
  }
}
