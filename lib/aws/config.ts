import { SQSClient } from "@aws-sdk/client-sqs"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import { S3Client } from "@aws-sdk/client-s3"

const region = process.env.AWS_REGION || "eu-central-1"

const credentials =
  process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined

export const sqsClient = new SQSClient({ region, credentials })

const ddbClient = new DynamoDBClient({ region, credentials })
export const dynamodb = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
})

export const s3Client = new S3Client({ region, credentials })

// Resource names
export const SQS_QUEUE_URL = process.env.AWS_SQS_PDF_QUEUE_URL || ""
export const DYNAMODB_TABLE = process.env.AWS_DYNAMODB_PDF_TABLE || "proplytics-pdf-jobs"
export const S3_BUCKET = process.env.AWS_S3_PDF_BUCKET || "proplytics-pdfs"
