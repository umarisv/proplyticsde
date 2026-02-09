import { SendMessageCommand } from "@aws-sdk/client-sqs"
import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { sqsClient, dynamodb, s3Client, SQS_QUEUE_URL, DYNAMODB_TABLE, S3_BUCKET } from "./config"
import type { AnalyseResultData, AnalyseFormData } from "@/lib/types"

export type JobStatus = "pending" | "processing" | "done" | "error"

export interface PDFJobRecord {
  jobId: string
  status: JobStatus
  createdAt: number
  updatedAt: number
  s3Key?: string
  error?: string
}

/**
 * Creates a PDF job: writes to DynamoDB, sends message to SQS.
 * Returns the jobId for polling.
 */
export async function createPDFJob(input: {
  resultData: AnalyseResultData
  formData: AnalyseFormData
  address: string
}): Promise<string> {
  const jobId = crypto.randomUUID()
  const now = Date.now()

  // 1. Write job record to DynamoDB (status = pending)
  await dynamodb.send(
    new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        jobId,
        status: "pending" as JobStatus,
        createdAt: now,
        updatedAt: now,
      },
    })
  )

  // 2. Send the job payload to SQS
  await sqsClient.send(
    new SendMessageCommand({
      QueueUrl: SQS_QUEUE_URL,
      MessageBody: JSON.stringify({
        jobId,
        resultData: input.resultData,
        formData: input.formData,
        address: input.address,
      }),
      MessageGroupId: "pdf-jobs", // FIFO queue ordering
      MessageDeduplicationId: jobId,
    })
  )

  return jobId
}

/**
 * Reads job status from DynamoDB.
 */
export async function getPDFJobStatus(jobId: string): Promise<PDFJobRecord | null> {
  const result = await dynamodb.send(
    new GetCommand({
      TableName: DYNAMODB_TABLE,
      Key: { jobId },
    })
  )
  return (result.Item as PDFJobRecord) || null
}

/**
 * Generates a presigned S3 URL for downloading the finished PDF.
 * Valid for 10 minutes.
 */
export async function getPDFDownloadUrl(s3Key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
  })
  return getSignedUrl(s3Client, command, { expiresIn: 600 })
}

/**
 * Updates job status in DynamoDB (used by worker).
 */
export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  extra?: { s3Key?: string; error?: string }
): Promise<void> {
  const updates: string[] = ["#s = :status", "updatedAt = :now"]
  const names: Record<string, string> = { "#s": "status" }
  const values: Record<string, unknown> = {
    ":status": status,
    ":now": Date.now(),
  }

  if (extra?.s3Key) {
    updates.push("s3Key = :s3Key")
    values[":s3Key"] = extra.s3Key
  }
  if (extra?.error) {
    updates.push("#e = :error")
    names["#e"] = "error"
    values[":error"] = extra.error
  }

  await dynamodb.send(
    new UpdateCommand({
      TableName: DYNAMODB_TABLE,
      Key: { jobId },
      UpdateExpression: `SET ${updates.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  )
}
