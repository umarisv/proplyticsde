// Renders HTML to PDF using Chromium via puppeteer-core + @sparticuz/chromium
// Runs inside Vercel serverless functions (max 10s default, 60s on Pro)

import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"

// Configure chromium for serverless
chromium.setHeadlessMode = "shell"
chromium.setGraphicsMode = false

export async function renderPDF(html: string): Promise<Buffer> {
  const executablePath = await chromium.executablePath()

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: true,
  })

  try {
    const page = await browser.newPage()

    // Set content with networkidle0 to wait for fonts
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 15000 })

    // Generate PDF
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
