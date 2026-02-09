/**
 * Proplytics PDF Worker
 *
 * Runs as a Fargate task. Polls SQS for PDF jobs, renders HTML to PDF
 * with Puppeteer/Chromium, uploads to S3, and updates DynamoDB status.
 *
 * Environment variables:
 *   AWS_REGION, AWS_SQS_PDF_QUEUE_URL, AWS_DYNAMODB_PDF_TABLE, AWS_S3_PDF_BUCKET
 */

import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import puppeteer from "puppeteer"

// ── AWS clients ───────────────────────────────────────────────────────
const region = process.env.AWS_REGION || "eu-central-1"
const sqsClient = new SQSClient({ region })
const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
})
const s3Client = new S3Client({ region })

const QUEUE_URL = process.env.AWS_SQS_PDF_QUEUE_URL!
const TABLE = process.env.AWS_DYNAMODB_PDF_TABLE || "proplytics-pdf-jobs"
const BUCKET = process.env.AWS_S3_PDF_BUCKET || "proplytics-pdfs"

const MAX_CONCURRENT = 2
let running = 0
let shutdown = false

// ── Graceful shutdown ─────────────────────────────────────────────────
process.on("SIGTERM", () => {
  console.log("[worker] SIGTERM received, shutting down gracefully...")
  shutdown = true
})
process.on("SIGINT", () => {
  console.log("[worker] SIGINT received, shutting down gracefully...")
  shutdown = true
})

// ── DynamoDB helpers ──────────────────────────────────────────────────
async function updateStatus(
  jobId: string,
  status: string,
  extra?: { s3Key?: string; error?: string }
) {
  const updates: string[] = ["#s = :status", "updatedAt = :now"]
  const names: Record<string, string> = { "#s": "status" }
  const values: Record<string, unknown> = { ":status": status, ":now": Date.now() }

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
      TableName: TABLE,
      Key: { jobId },
      UpdateExpression: `SET ${updates.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  )
}

// ── HTML generator (inlined from lib/pdf/generate-report-html.ts) ─────
// We inline the HTML generation here so the worker is self-contained.
// In production, you could share via a published package.
function generateReportHTML(input: { resultData: any; formData: any; address: string }): string {
  const { resultData, formData, address } = input

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v)
  const formatPercent = (v: number) => v.toFixed(2).replace(".", ",") + "%"

  const objektTypLabels: Record<string, string> = {
    mfh: "Mehrfamilienhaus", zfh: "Zweifamilienhaus", efh: "Einfamilienhaus",
    etw: "Eigentumswohnung", wgh: "Wohn- & Geschaeftshaus",
  }
  const zustandLabels: Record<string, string> = {
    neubau: "Neubau/neuwertig", gepflegt: "Gepflegt",
    durchschnitt: "Durchschnittlich", sanierung: "Sanierungsbeduerftig",
  }
  const currentDate = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>Marktpreiseinschaetzung - ${address}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;font-size:11px;line-height:1.5;color:#1a1a1a;background:#fff}
.page{width:210mm;min-height:297mm;padding:15mm;margin:0 auto;background:#fff}
.header{background:linear-gradient(135deg,#022b25 0%,#064e3b 100%);color:#fff;padding:24px;border-radius:12px;margin-bottom:20px}
.header-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
.header h1{font-size:22px;font-weight:700;margin-bottom:4px}
.marktwert-box{text-align:right}
.marktwert-label{font-size:10px;opacity:.8;text-transform:uppercase;letter-spacing:.5px}
.marktwert-value{font-size:28px;font-weight:700;color:#10b981}
.created-date{font-size:10px;opacity:.7;margin-top:4px}
.section{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:16px}
.section-title{font-size:13px;font-weight:600;color:#022b25;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #10b981}
.metrics-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:20px}
.metric-card{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:12px;text-align:center}
.metric-label{font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.metric-value{font-size:14px;font-weight:700;color:#022b25}
.metric-value.positive{color:#10b981}
.metric-value.negative{color:#ef4444}
.two-column{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.data-table{width:100%;font-size:10px}
.data-table tr{border-bottom:1px solid #e2e8f0}
.data-table td{padding:6px 0}
.data-table td:last-child{text-align:right;font-weight:500}
.data-table tr.highlight{background:#f0fdf4;font-weight:600}
.data-table tr.highlight td{padding:8px 4px}
.calculation-step{display:flex;justify-content:space-between;padding:4px 0;font-size:10px}
.calculation-step.result{border-top:2px solid #022b25;margin-top:8px;padding-top:8px;font-weight:700;font-size:12px}
.potenzial-box{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.potenzial-card{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px}
.potenzial-card.basis{border-left:4px solid #64748b}
.potenzial-card.optimiert{border-left:4px solid #10b981}
.potenzial-title{font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;margin-bottom:8px}
.potenzial-value{font-size:18px;font-weight:700;margin-bottom:8px}
.footer{margin-top:24px;padding:16px;background:#f1f5f9;border-radius:8px;font-size:9px;color:#64748b}
.footer-title{font-weight:600;margin-bottom:8px;color:#475569}
.logo{display:flex;align-items:center;gap:8px;font-weight:700;font-size:16px}
.page-break{page-break-before:always}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{width:100%;padding:10mm}}
</style>
</head>
<body>
<div class="page">
<div class="header">
<div class="header-top">
<div>
<div class="logo">Proplytics</div>
<h1 style="margin-top:12px">MARKTPREISEINSCHAETZUNG</h1>
<p style="font-size:14px;opacity:.9">${objektTypLabels[formData.objekttyp] || "Immobilie"}</p>
<p style="font-size:12px;opacity:.8">${formData.stadt} | PLZ ${formData.plz}</p>
</div>
<div class="marktwert-box">
<p class="marktwert-label">Geschaetzter Marktwert</p>
<p class="marktwert-value">${formatCurrency(resultData.marktwert)}</p>
<p class="created-date">Erstellt am ${currentDate}</p>
</div>
</div>
</div>
<div class="metrics-grid">
<div class="metric-card"><p class="metric-label">Marktwert</p><p class="metric-value">${formatCurrency(resultData.marktwert)}</p></div>
<div class="metric-card"><p class="metric-label">EUR/m2</p><p class="metric-value">${formatCurrency(resultData.qmPreis)}</p></div>
<div class="metric-card"><p class="metric-label">Faktor</p><p class="metric-value">${resultData.faktor.toFixed(1)}x</p></div>
<div class="metric-card"><p class="metric-label">Brutto-Rendite</p><p class="metric-value positive">${formatPercent(resultData.bruttoRendite)}</p></div>
<div class="metric-card"><p class="metric-label">Netto-Rendite</p><p class="metric-value">${formatPercent(resultData.nettoRendite)}</p></div>
<div class="metric-card"><p class="metric-label">Cashflow/Monat</p><p class="metric-value ${resultData.cashflowMonat >= 0 ? "positive" : "negative"}">${formatCurrency(resultData.cashflowMonat)}</p></div>
</div>
<div class="two-column">
<div class="section">
<h2 class="section-title">Objektdaten</h2>
<table class="data-table">
<tr><td>Objekttyp</td><td>${objektTypLabels[formData.objekttyp] || "-"}</td></tr>
<tr><td>Wohnflaeche</td><td>${formData.wohnflaeche} m2</td></tr>
<tr><td>Grundstuecksflaeche</td><td>${formData.grundstueck} m2</td></tr>
<tr><td>Baujahr</td><td>ca. ${formData.baujahr}</td></tr>
<tr><td>Zustand</td><td>${zustandLabels[formData.zustand] || "-"}</td></tr>
</table>
</div>
<div class="section">
<h2 class="section-title">Marktdaten</h2>
<table class="data-table">
<tr><td>Ist-Miete (Monat)</td><td>${formatCurrency(Number(formData.istMiete))}</td></tr>
<tr><td>Bodenrichtwert</td><td>${formatCurrency(Number(formData.bodenrichtwert))}/m2</td></tr>
<tr><td>Liegenschaftszins</td><td>${formatPercent(resultData.liegenschaftszins)}</td></tr>
<tr><td>Restnutzungsdauer</td><td>${resultData.restnutzungsdauer} Jahre</td></tr>
<tr><td>Vervielfaeltiger</td><td>${resultData.vervielfaeltiger.toFixed(2)}</td></tr>
</table>
</div>
</div>
<div class="two-column">
<div class="section">
<h2 class="section-title">Ertragswertverfahren (ImmoWertV 2024)</h2>
<div class="calculation-step"><span>1. Jahresrohertrag</span><span>${formatCurrency(resultData.jahresrohertrag)}</span></div>
<div class="calculation-step"><span>2. - Bewirtschaftungskosten</span><span>- ${formatCurrency(resultData.bewirtschaftungskosten)}</span></div>
<div class="calculation-step"><span>3. = Reinertrag</span><span>${formatCurrency(resultData.reinertrag)}</span></div>
<div class="calculation-step"><span>4. - Bodenverzinsung</span><span>- ${formatCurrency(resultData.bodenwertverzinsung)}</span></div>
<div class="calculation-step"><span>5. = Reinertrag Gebaeude</span><span>${formatCurrency(resultData.gebaeudertrag)}</span></div>
<div class="calculation-step"><span>6. x Vervielfaeltiger</span><span>x ${resultData.vervielfaeltiger.toFixed(2)}</span></div>
<div class="calculation-step result"><span>Ertragswert</span><span>${formatCurrency(resultData.ertragswert)}</span></div>
</div>
<div class="section">
<h2 class="section-title">Sachwertverfahren</h2>
<table class="data-table">
<tr><td>Bodenwert</td><td>${formatCurrency(resultData.bodenwert)}</td></tr>
<tr><td>NHK Basiswert</td><td>${formatCurrency(resultData.nhkBasiswert)}</td></tr>
<tr><td>Alterswertminderung</td><td>${formatPercent(resultData.alterswertminderung)}</td></tr>
<tr><td>Gebaeudesachwert</td><td>${formatCurrency(resultData.gebaeudesachwert)}</td></tr>
<tr class="highlight"><td>Sachwert</td><td>${formatCurrency(resultData.sachwert)}</td></tr>
</table>
</div>
</div>
<div class="section">
<h2 class="section-title">Finanzierungsanalyse</h2>
<div class="two-column">
<table class="data-table">
<tr><td>Kaufpreis</td><td>${formatCurrency(resultData.kaufpreis)}</td></tr>
<tr><td>Eigenkapital (20%)</td><td>${formatCurrency(resultData.eigenkapital)}</td></tr>
<tr><td>Fremdkapital (80%)</td><td>${formatCurrency(resultData.fremdkapital)}</td></tr>
<tr><td>Zinssatz / Tilgung</td><td>${formatPercent(resultData.zinssatz)} / ${formatPercent(resultData.tilgung)}</td></tr>
</table>
<table class="data-table">
<tr><td>Monatsrate</td><td>${formatCurrency(resultData.monatsrate)}</td></tr>
<tr><td>Cashflow/Monat</td><td style="color:${resultData.cashflowMonat >= 0 ? "#10b981" : "#ef4444"}">${formatCurrency(resultData.cashflowMonat)}</td></tr>
<tr><td>Cashflow/Jahr</td><td style="color:${resultData.cashflowJahr >= 0 ? "#10b981" : "#ef4444"}">${formatCurrency(resultData.cashflowJahr)}</td></tr>
<tr class="highlight"><td>Eigenkapitalrendite</td><td>${formatPercent(resultData.eigenkapitalrendite)}</td></tr>
</table>
</div>
</div>
<div class="footer">
<p class="footer-title">Rechtlicher Hinweis</p>
<p>Alle Angaben ohne Gewaehr. Kein Marktwert gemaess IVS/EVS/RICS oder Verkehrswert im Sinne Paragraph 194 BauGB.</p>
<p style="margin-top:8px;font-weight:600">Erstellt am: ${currentDate} | Tool: Proplytics v1.0</p>
</div>
</div>
</body>
</html>`
}

// ── PDF rendering ─────────────────────────────────────────────────────
async function renderPDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 20000 })
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      preferCSSPageSize: true,
    })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}

// ── Process a single message ──────────────────────────────────────────
async function processMessage(body: string, receiptHandle: string) {
  const { jobId, resultData, formData, address } = JSON.parse(body)
  console.log(`[worker] Processing job ${jobId}`)

  try {
    // Mark as processing
    await updateStatus(jobId, "processing")

    // Generate HTML and render PDF
    const html = generateReportHTML({ resultData, formData, address })
    const pdfBuffer = await renderPDF(html)

    // Upload to S3
    const s3Key = `pdfs/${jobId}.pdf`
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: s3Key,
        Body: pdfBuffer,
        ContentType: "application/pdf",
        ContentDisposition: `attachment; filename="Marktpreiseinschaetzung_${formData.plz || "report"}.pdf"`,
      })
    )

    // Mark as done
    await updateStatus(jobId, "done", { s3Key })
    console.log(`[worker] Job ${jobId} done, uploaded to s3://${BUCKET}/${s3Key}`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    console.error(`[worker] Job ${jobId} failed:`, msg)
    await updateStatus(jobId, "error", { error: msg })
  } finally {
    // Delete message from SQS
    await sqsClient.send(
      new DeleteMessageCommand({ QueueUrl: QUEUE_URL, ReceiptHandle: receiptHandle })
    )
    running--
  }
}

// ── Main poll loop ────────────────────────────────────────────────────
async function pollLoop() {
  console.log(`[worker] Starting poll loop (max concurrent: ${MAX_CONCURRENT})`)

  while (!shutdown) {
    if (running >= MAX_CONCURRENT) {
      await sleep(500)
      continue
    }

    try {
      const response = await sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: QUEUE_URL,
          MaxNumberOfMessages: Math.min(MAX_CONCURRENT - running, 10),
          WaitTimeSeconds: 20, // Long polling
          VisibilityTimeout: 120, // 2 min processing window
        })
      )

      if (response.Messages && response.Messages.length > 0) {
        for (const msg of response.Messages) {
          if (msg.Body && msg.ReceiptHandle) {
            running++
            processMessage(msg.Body, msg.ReceiptHandle).catch((err) => {
              console.error("[worker] Unhandled error in processMessage:", err)
              running--
            })
          }
        }
      }
    } catch (err) {
      console.error("[worker] Poll error:", err)
      await sleep(5000) // Back off on errors
    }
  }

  // Wait for in-flight jobs
  console.log(`[worker] Waiting for ${running} in-flight jobs...`)
  while (running > 0) {
    await sleep(500)
  }
  console.log("[worker] Shutdown complete")
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// Start
pollLoop()
