// In-memory PDF job store with concurrency limiting
// Can be replaced with Redis/Upstash later for multi-instance deployments

export type JobStatus = "pending" | "processing" | "done" | "error"

export interface PDFJob {
  id: string
  status: JobStatus
  createdAt: number
  pdf?: Buffer
  error?: string
}

const jobs = new Map<string, PDFJob>()
const MAX_CONCURRENT = 2
let running = 0

// Clean up old jobs every 5 minutes (jobs older than 10 min)
const CLEANUP_INTERVAL = 5 * 60 * 1000
const MAX_AGE = 10 * 60 * 1000

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [id, job] of jobs) {
      if (now - job.createdAt > MAX_AGE) {
        jobs.delete(id)
      }
    }
  }, CLEANUP_INTERVAL)
}

export function createJob(): string {
  const id = crypto.randomUUID()
  jobs.set(id, { id, status: "pending", createdAt: Date.now() })
  return id
}

export function getJob(id: string): PDFJob | undefined {
  return jobs.get(id)
}

export function canProcess(): boolean {
  return running < MAX_CONCURRENT
}

export function startProcessing(id: string): boolean {
  const job = jobs.get(id)
  if (!job || job.status !== "pending") return false
  if (!canProcess()) return false
  running++
  job.status = "processing"
  return true
}

export function completeJob(id: string, pdf: Buffer): void {
  const job = jobs.get(id)
  if (job) {
    job.status = "done"
    job.pdf = pdf
    running = Math.max(0, running - 1)
  }
}

export function failJob(id: string, error: string): void {
  const job = jobs.get(id)
  if (job) {
    job.status = "error"
    job.error = error
    running = Math.max(0, running - 1)
  }
}
