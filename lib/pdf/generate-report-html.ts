// Server-safe HTML generator for PDF reports (no "use client")
// Reuses the same HTML template as the client-side pdf-report.tsx

import type { AnalyseResultData, AnalyseFormData } from "@/lib/types"

export interface PDFReportInput {
  resultData: AnalyseResultData
  formData: AnalyseFormData
  address: string
}

export function generateReportHTML({ resultData, formData, address }: PDFReportInput): string {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)

  const formatPercent = (value: number) => value.toFixed(2).replace(".", ",") + "%"

  const objektTypLabels: Record<string, string> = {
    mfh: "Mehrfamilienhaus",
    zfh: "Zweifamilienhaus",
    efh: "Einfamilienhaus",
    etw: "Eigentumswohnung",
    wgh: "Wohn- & Geschaeftshaus",
  }

  const zustandLabels: Record<string, string> = {
    neubau: "Neubau/neuwertig",
    gepflegt: "Gepflegt",
    durchschnitt: "Durchschnittlich",
    sanierung: "Sanierungsbeduerftig",
  }

  const currentDate = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Marktpreiseinschaetzung - ${address}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; font-size: 11px; line-height: 1.5; color: #1a1a1a; background: #fff; }
    .page { width: 210mm; min-height: 297mm; padding: 15mm; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #022b25 0%, #064e3b 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 20px; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .header .subtitle { font-size: 14px; opacity: 0.9; }
    .header .location { font-size: 12px; opacity: 0.8; }
    .marktwert-box { text-align: right; }
    .marktwert-label { font-size: 10px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.5px; }
    .marktwert-value { font-size: 28px; font-weight: 700; color: #10b981; }
    .created-date { font-size: 10px; opacity: 0.7; margin-top: 4px; }
    .section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .section-title { font-size: 13px; font-weight: 600; color: #022b25; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #10b981; }
    .metrics-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 20px; }
    .metric-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
    .metric-label { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .metric-value { font-size: 14px; font-weight: 700; color: #022b25; }
    .metric-value.positive { color: #10b981; }
    .metric-value.negative { color: #ef4444; }
    .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .data-table { width: 100%; font-size: 10px; }
    .data-table tr { border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 6px 0; }
    .data-table td:last-child { text-align: right; font-weight: 500; }
    .data-table tr.highlight { background: #f0fdf4; font-weight: 600; }
    .data-table tr.highlight td { padding: 8px 4px; }
    .calculation-step { display: flex; justify-content: space-between; padding: 4px 0; font-size: 10px; }
    .calculation-step.result { border-top: 2px solid #022b25; margin-top: 8px; padding-top: 8px; font-weight: 700; font-size: 12px; }
    .potenzial-box { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .potenzial-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .potenzial-card.basis { border-left: 4px solid #64748b; }
    .potenzial-card.optimiert { border-left: 4px solid #10b981; }
    .potenzial-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 8px; }
    .potenzial-value { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .potenzial-metrics { font-size: 9px; color: #64748b; }
    .footer { margin-top: 24px; padding: 16px; background: #f1f5f9; border-radius: 8px; font-size: 9px; color: #64748b; }
    .footer-title { font-weight: 600; margin-bottom: 8px; color: #475569; }
    .logo { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 16px; }
    .logo-icon { width: 32px; height: 32px; background: rgba(16, 185, 129, 0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .page-break { page-break-before: always; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { width: 100%; padding: 10mm; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-top">
        <div>
          <div class="logo">
            <div class="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/>
              </svg>
            </div>
            Proplytics
          </div>
          <h1 style="margin-top: 12px;">MARKTPREISEINSCHAETZUNG</h1>
          <p class="subtitle">${objektTypLabels[formData.objekttyp] || "Immobilie"}</p>
          <p class="location">${formData.stadt} | PLZ ${formData.plz}</p>
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
        <div class="calculation-step"><span>3. = Reinertrag Grundstueck</span><span>${formatCurrency(resultData.reinertrag)}</span></div>
        <div class="calculation-step"><span>4. - Bodenverzinsung</span><span>- ${formatCurrency(resultData.bodenwertverzinsung)}</span></div>
        <div class="calculation-step"><span>5. = Reinertrag Gebaeude</span><span>${formatCurrency(resultData.gebaeudertrag)}</span></div>
        <div class="calculation-step"><span>6. x Vervielfaeltiger</span><span>x ${resultData.vervielfaeltiger.toFixed(2)}</span></div>
        <div class="calculation-step"><span>7. = Ertragswert Gebaeude</span><span>${formatCurrency(resultData.gebaeudertrag * resultData.vervielfaeltiger)}</span></div>
        <div class="calculation-step"><span>8. + Bodenwert</span><span>+ ${formatCurrency(resultData.bodenwert)}</span></div>
        <div class="calculation-step result"><span>Ertragswert</span><span>${formatCurrency(resultData.ertragswert)}</span></div>
      </div>
      <div class="section">
        <h2 class="section-title">Sachwertverfahren</h2>
        <table class="data-table">
          <tr><td>Bodenwert</td><td>${formatCurrency(resultData.bodenwert)}</td></tr>
          <tr><td style="font-size: 9px; color: #64748b;">(${formatCurrency(Number(formData.bodenrichtwert))}/m2 x ${formData.grundstueck} m2)</td><td></td></tr>
          <tr><td>Herstellungskosten (NHK)</td><td>${formatCurrency(resultData.nhkBasiswert)}</td></tr>
          <tr><td>Alterswertminderung</td><td>${formatPercent(resultData.alterswertminderung)}</td></tr>
          <tr><td>Zeitwert Gebaeude</td><td>${formatCurrency(resultData.gebaeudesachwert)}</td></tr>
          <tr class="highlight"><td>Sachwert gesamt</td><td>${formatCurrency(resultData.sachwert)}</td></tr>
        </table>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Potenzialanalyse</h2>
      <div class="potenzial-box">
        <div class="potenzial-card basis">
          <p class="potenzial-title">Basiswert (Ist-Miete)</p>
          <p class="potenzial-value">${formatCurrency(resultData.marktwert)}</p>
          <div class="potenzial-metrics">
            <p>EUR/m2 ${formatCurrency(resultData.qmPreis)}</p>
            <p>Brutto-Rendite ${formatPercent(resultData.bruttoRendite)}</p>
            <p>Faktor ${resultData.faktor.toFixed(1)}x</p>
          </div>
        </div>
        <div class="potenzial-card optimiert">
          <p class="potenzial-title">Potenzialwert (Marktmiete)</p>
          <p class="potenzial-value" style="color: #10b981;">${formatCurrency(Math.round(resultData.marktwert * (1 + resultData.potenzial / 100)))}</p>
          <div class="potenzial-metrics">
            <p>Differenz zur Marktmiete: ${formatCurrency((resultData.marktMiete - resultData.istMiete) / 12)}/Monat</p>
            <p>Mietpotenzial: ${resultData.potenzial > 0 ? "+" : ""}${formatPercent(resultData.potenzial)}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Finanzierungsanalyse</h2>
      <div class="two-column">
        <table class="data-table">
          <tr><td>Kaufpreis / Marktwert</td><td>${formatCurrency(resultData.kaufpreis)}</td></tr>
          <tr><td>Eigenkapital (20%)</td><td>${formatCurrency(resultData.eigenkapital)}</td></tr>
          <tr><td>Fremdkapital (80%)</td><td>${formatCurrency(resultData.fremdkapital)}</td></tr>
          <tr><td>Zinssatz / Tilgung</td><td>${formatPercent(resultData.zinssatz)} / ${formatPercent(resultData.tilgung)}</td></tr>
        </table>
        <table class="data-table">
          <tr><td>Monatsrate</td><td>${formatCurrency(resultData.monatsrate)}</td></tr>
          <tr><td>Cashflow/Monat</td><td style="color: ${resultData.cashflowMonat >= 0 ? "#10b981" : "#ef4444"}">${resultData.cashflowMonat >= 0 ? "+" : ""}${formatCurrency(resultData.cashflowMonat)}</td></tr>
          <tr><td>Cashflow/Jahr</td><td style="color: ${resultData.cashflowJahr >= 0 ? "#10b981" : "#ef4444"}">${resultData.cashflowJahr >= 0 ? "+" : ""}${formatCurrency(resultData.cashflowJahr)}</td></tr>
          <tr class="highlight"><td>Eigenkapitalrendite</td><td>${formatPercent(resultData.eigenkapitalrendite)}</td></tr>
        </table>
      </div>
    </div>

    ${resultData.investmentScore ? generateInvestmentScorePage(resultData, formatCurrency, formatPercent) : ''}

    <div class="footer">
      <p class="footer-title">Rechtlicher Hinweis</p>
      <p>Alle Angaben sind ohne Gewaehr und basieren auf den uebermittelten Informationen.</p>
      <p style="margin-top: 8px;">Es wurde ausdruecklich kein Marktwert gemaess IVS, EVS, RICS oder ein Verkehrswert im Sinne des Paragraph 194 BauGB ermittelt. Diese Marktpreiseinschaetzung dient ausschliesslich der internen Verwendung.</p>
      <p style="margin-top: 8px;">Bewertung erstellt nach ImmoWertV 2024.</p>
      <p style="margin-top: 12px; font-weight: 600;">Erstellt am: ${currentDate} | Tool: Proplytics v1.0</p>
    </div>
  </div>
</body>
</html>`
}

function generateInvestmentScorePage(
  resultData: AnalyseResultData,
  formatCurrency: (v: number) => string,
  formatPercent: (v: number) => string
): string {
  const score = resultData.investmentScore!
  return `
    <div class="page-break"></div>
    <div class="page">
      <div class="header" style="padding: 16px; margin-bottom: 16px;">
        <div class="header-top" style="margin-bottom: 0;">
          <div>
            <h2 style="font-size: 18px; margin: 0;">INVESTMENT-SCORING</h2>
            <p style="opacity: 0.8; font-size: 11px; margin-top: 4px;">Gesamtbeurteilung nach 6 Dimensionen</p>
          </div>
          <div class="marktwert-box">
            <p class="marktwert-label">Investment-Score</p>
            <p class="marktwert-value" style="color: ${score.gesamtScore >= 66 ? '#10b981' : score.gesamtScore >= 33 ? '#f59e0b' : '#ef4444'};">${score.gesamtScore}/100</p>
            <p style="font-size: 12px; font-weight: 600; color: ${score.empfehlung === 'Go' ? '#10b981' : score.empfehlung === 'Bedingt Go' ? '#f59e0b' : '#ef4444'};">${score.empfehlung}</p>
          </div>
        </div>
      </div>

      <div class="section" style="margin-bottom: 16px;">
        <h2 class="section-title">Empfehlung</h2>
        <p style="font-size: 11px; line-height: 1.6;">${score.empfehlungText}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
        ${Object.entries(score.dimensionen).map(([, dim]) => {
          const ampelColor = dim.ampel === 'gruen' ? '#10b981' : dim.ampel === 'gelb' ? '#f59e0b' : '#ef4444'
          const ampelBg = dim.ampel === 'gruen' ? '#f0fdf4' : dim.ampel === 'gelb' ? '#fffbeb' : '#fef2f2'
          return `
            <div style="background: ${ampelBg}; border: 1px solid ${ampelColor}40; border-radius: 8px; padding: 12px; border-left: 4px solid ${ampelColor};">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 10px; font-weight: 600; text-transform: uppercase;">${dim.label}</span>
                <span style="font-size: 14px; font-weight: 700; color: ${ampelColor};">${dim.score}/3</span>
              </div>
              ${dim.details.slice(0, 2).map((d: string) => `<p style="font-size: 9px; color: #64748b; margin-top: 2px;">- ${d}</p>`).join('')}
            </div>
          `
        }).join('')}
      </div>

      ${score.dealKillers.length > 0 ? `
        <div class="section" style="background: #fef2f2; border-color: #ef4444;">
          <h2 class="section-title" style="color: #ef4444; border-color: #ef4444;">Deal-Killer</h2>
          ${score.dealKillers.map((dk: { label: string; description: string }) => `
            <div style="margin-bottom: 8px;">
              <p style="font-size: 11px; font-weight: 600; color: #ef4444;">${dk.label}</p>
              <p style="font-size: 10px; color: #64748b;">${dk.description}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="section">
        <h2 class="section-title">Stress-Tests</h2>
        <table class="data-table">
          <tr style="background: #f1f5f9; font-weight: 600;"><td>Szenario</td><td>Basis</td><td>Stress</td><td>Aenderung</td><td>Status</td></tr>
          ${score.stressTests.map((st: { label: string; baseValue: number; stressedValue: number; change: string; status: string }) => {
            const stColor = st.status === 'gruen' ? '#10b981' : st.status === 'gelb' ? '#f59e0b' : '#ef4444'
            return `<tr><td>${st.label}</td><td>${st.baseValue.toLocaleString('de-DE')}</td><td>${st.stressedValue.toLocaleString('de-DE')}</td><td>${st.change}</td><td style="color: ${stColor}; font-weight: 600;">${st.status === 'gruen' ? 'OK' : st.status === 'gelb' ? 'Warnung' : 'Kritisch'}</td></tr>`
          }).join('')}
        </table>
      </div>

      <div class="two-column">
        <div class="section">
          <h2 class="section-title">Erweiterte Kennzahlen</h2>
          <table class="data-table">
            <tr><td>Cash-on-Cash Return</td><td>${formatPercent(score.kennzahlen.cashOnCash)}</td></tr>
            <tr><td>DSCR</td><td>${score.kennzahlen.dscr.toFixed(2)}x</td></tr>
            <tr><td>ICR</td><td>${score.kennzahlen.icr.toFixed(2)}x</td></tr>
            <tr><td>LTV</td><td>${formatPercent(score.kennzahlen.ltv)}</td></tr>
            <tr><td>Break-Even Auslastung</td><td>${formatPercent(score.kennzahlen.breakEvenOccupancy)}</td></tr>
          </table>
        </div>
        <div class="section">
          <h2 class="section-title">Rendite-Uebersicht</h2>
          <table class="data-table">
            <tr><td>Brutto-Rendite</td><td>${formatPercent(score.kennzahlen.bruttoRendite)}</td></tr>
            <tr><td>Netto-Rendite</td><td>${formatPercent(score.kennzahlen.nettoRendite)}</td></tr>
            <tr><td>Mietmultiplikator</td><td>${score.kennzahlen.mietmultiplikator.toFixed(1)}x</td></tr>
            <tr><td>Eigenkapitalrendite</td><td>${formatPercent(resultData.eigenkapitalrendite)}</td></tr>
          </table>
        </div>
      </div>
    </div>
  `
}
