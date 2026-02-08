/**
 * Investment-Scoring-Engine
 * Basiert auf der Immobilien-Investmentlogik Gesamtbeurteilung
 * 6 Dimensionen: Rendite, Risiko, Finanzierung, Value-Add, Lage/Markt, Deal Sourcing
 * Ampel: gruen (3) / gelb (2) / rot (1)
 * Gewichtung: Value-Add 25%, Kaufpreis 20%, Lage 20%, Cashflow 15%, Risiko 10%, Finanzierbarkeit 10%
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type Ampel = "gruen" | "gelb" | "rot"

export interface DimensionScore {
  ampel: Ampel
  score: number // 1-3
  label: string
  details: string[]
}

export interface DealKiller {
  label: string
  description: string
}

export interface StressTest {
  label: string
  baseValue: number
  stressedValue: number
  change: string
  status: Ampel
}

export interface InvestmentScore {
  gesamtScore: number // 0-100
  empfehlung: "Go" | "Bedingt Go" | "No-Go"
  empfehlungText: string
  dimensionen: {
    rendite: DimensionScore
    risiko: DimensionScore
    finanzierung: DimensionScore
    valueAdd: DimensionScore
    lageMarkt: DimensionScore
    dealSourcing: DimensionScore
  }
  dealKillers: DealKiller[]
  stressTests: StressTest[]
  kennzahlen: {
    bruttoRendite: number
    nettoRendite: number
    cashOnCash: number
    dscr: number
    icr: number
    ltv: number
    mietmultiplikator: number
    breakEvenOccupancy: number
  }
}

export interface ScoringInput {
  kaufpreis: number
  wohnflaeche: number
  mieteinnahmenMonat: number
  baujahr: number
  objekttyp: string
  zustand: string
  plz: string
  stadt: string
  // Optional
  eigenkapital?: number
  zinssatz?: number
  tilgung?: number
  laufzeit?: number
  nebenkosten?: number // Kaufnebenkosten in %
  instandhaltungProQm?: number
  verwaltungProWE?: number
  wohneinheiten?: number
  leerstandRate?: number
  modernisierungKosten?: number
}

// ─── Schwellenwerte aus Docs ─────────────────────────────────────────────

const SCHWELLENWERTE = {
  bruttoRendite: { gruen: 6.0, gelb: 4.0 },
  nettoRendite: { gruen: 4.5, gelb: 3.0 },
  cashOnCash: { gruen: 8.0, gelb: 4.0 },
  dscr: { gruen: 1.3, gelb: 1.1, dealKiller: 1.0 },
  icr: { gruen: 2.0, gelb: 1.5 },
  ltv: { gruen: 0.7, gelb: 0.85, dealKiller: 0.9 },
  mietmultiplikator: { gruen: 20, gelb: 25, dealKiller: 30 },
  breakEvenOccupancy: { gruen: 0.75, gelb: 0.85 },
  leerstandRate: { gruen: 0.03, gelb: 0.06 },
  baujahr: {
    dealKillerOhneModernisierung: 1950,
    risikoOhneModernisierung: 1970,
  },
}

const KAUFNEBENKOSTEN_DEFAULT = 0.10 // 10% (Notar, Grunderwerbsteuer, Makler)
const INSTANDHALTUNG_PRO_QM = 12.0   // EUR/qm/Jahr
const VERWALTUNG_PRO_WE = 30.0       // EUR/WE/Monat

// ─── Gewichtung ─────────────────────────────────────────────────────────

const GEWICHTUNG = {
  rendite: 0.15,     // Cashflow
  risiko: 0.10,      // Risiko
  finanzierung: 0.10, // Finanzierbarkeit
  valueAdd: 0.25,    // Value-Add Potenzial
  lageMarkt: 0.20,   // Lage
  dealSourcing: 0.20, // Kaufpreis
}

// ─── Haupt-Scoring-Funktion ────────────────────────────────────────────

export function calculateInvestmentScore(input: ScoringInput): InvestmentScore {
  const defaults = applyDefaults(input)
  const kennzahlen = calculateKennzahlen(defaults)
  const dealKillers = checkDealKillers(defaults, kennzahlen)

  const rendite = scoreRendite(kennzahlen)
  const risiko = scoreRisiko(defaults, kennzahlen)
  const finanzierung = scoreFinanzierung(kennzahlen, defaults)
  const valueAdd = scoreValueAdd(defaults)
  const lageMarkt = scoreLageMarkt(defaults)
  const dealSourcing = scoreDealSourcing(kennzahlen, defaults)

  const dimensionen = { rendite, risiko, finanzierung, valueAdd, lageMarkt, dealSourcing }

  // Gesamt-Score berechnen (gewichtet, 0-100)
  const gewichteterScore =
    rendite.score * GEWICHTUNG.rendite +
    risiko.score * GEWICHTUNG.risiko +
    finanzierung.score * GEWICHTUNG.finanzierung +
    valueAdd.score * GEWICHTUNG.valueAdd +
    lageMarkt.score * GEWICHTUNG.lageMarkt +
    dealSourcing.score * GEWICHTUNG.dealSourcing

  // Score von 1-3 auf 0-100 skalieren
  const gesamtScore = Math.round(((gewichteterScore - 1) / 2) * 100)

  // Deal-Killer ueberstimmen alles
  let empfehlung: "Go" | "Bedingt Go" | "No-Go"
  let empfehlungText: string

  if (dealKillers.length > 0) {
    empfehlung = "No-Go"
    empfehlungText = `${dealKillers.length} Deal-Killer identifiziert. Von diesem Investment wird abgeraten.`
  } else if (gesamtScore >= 65) {
    empfehlung = "Go"
    empfehlungText = "Solides Investment mit gutem Chancen-Risiko-Verhaeltnis. Detailpruefung empfohlen."
  } else if (gesamtScore >= 40) {
    empfehlung = "Bedingt Go"
    empfehlungText = "Investment mit Einschraenkungen. Gezielte Nachverhandlung oder Value-Add-Strategie notwendig."
  } else {
    empfehlung = "No-Go"
    empfehlungText = "Unzureichendes Chancen-Risiko-Verhaeltnis. Von diesem Investment wird abgeraten."
  }

  const stressTests = calculateStressTests(defaults, kennzahlen)

  return {
    gesamtScore,
    empfehlung,
    empfehlungText,
    dimensionen,
    dealKillers,
    stressTests,
    kennzahlen,
  }
}

// ─── Defaults ────────────────────────────────────────────────────────────

interface ScoringDefaults extends ScoringInput {
  eigenkapital: number
  zinssatz: number
  tilgung: number
  laufzeit: number
  nebenkosten: number
  instandhaltungProQm: number
  verwaltungProWE: number
  wohneinheiten: number
  leerstandRate: number
  modernisierungKosten: number
}

function applyDefaults(input: ScoringInput): ScoringDefaults {
  const wohneinheiten = input.wohneinheiten || Math.max(1, Math.round(input.wohnflaeche / 65))
  return {
    ...input,
    eigenkapital: input.eigenkapital || input.kaufpreis * 0.20,
    zinssatz: input.zinssatz || 3.8,
    tilgung: input.tilgung || 2.0,
    laufzeit: input.laufzeit || 10,
    nebenkosten: input.nebenkosten || KAUFNEBENKOSTEN_DEFAULT,
    instandhaltungProQm: input.instandhaltungProQm || INSTANDHALTUNG_PRO_QM,
    verwaltungProWE: input.verwaltungProWE || VERWALTUNG_PRO_WE,
    wohneinheiten,
    leerstandRate: input.leerstandRate || 0.03,
    modernisierungKosten: input.modernisierungKosten || 0,
  }
}

// ─── Kennzahlen-Berechnung ──────────────────────────────────────────────

function calculateKennzahlen(d: ScoringDefaults) {
  const jahresmieteNetto = d.mieteinnahmenMonat * 12
  const kaufpreisGesamt = d.kaufpreis * (1 + d.nebenkosten) + d.modernisierungKosten
  const fremdkapital = kaufpreisGesamt - d.eigenkapital

  // Brutto-Mietrendite
  const bruttoRendite = (jahresmieteNetto / d.kaufpreis) * 100

  // Bewirtschaftungskosten
  const instandhaltung = d.instandhaltungProQm * d.wohnflaeche
  const verwaltung = d.verwaltungProWE * d.wohneinheiten * 12
  const leerstand = jahresmieteNetto * d.leerstandRate
  const bewirtschaftungskosten = instandhaltung + verwaltung + leerstand

  // Netto-Mietrendite
  const nettoMiete = jahresmieteNetto - bewirtschaftungskosten
  const nettoRendite = (nettoMiete / kaufpreisGesamt) * 100

  // Kapitaldienst
  const annuitaet = (d.zinssatz + d.tilgung) / 100
  const kapitaldienst = fremdkapital * annuitaet

  // Zinslast
  const zinslast = fremdkapital * (d.zinssatz / 100)

  // DSCR (Debt Service Coverage Ratio)
  const dscr = kapitaldienst > 0 ? nettoMiete / kapitaldienst : 999

  // ICR (Interest Coverage Ratio)
  const icr = zinslast > 0 ? nettoMiete / zinslast : 999

  // Cash on Cash Return
  const cashflowNachFinanzierung = nettoMiete - kapitaldienst
  const cashOnCash = d.eigenkapital > 0 ? (cashflowNachFinanzierung / d.eigenkapital) * 100 : 0

  // LTV (Loan to Value)
  const ltv = d.kaufpreis > 0 ? fremdkapital / d.kaufpreis : 0

  // Mietmultiplikator
  const mietmultiplikator = jahresmieteNetto > 0 ? d.kaufpreis / jahresmieteNetto : 999

  // Break-Even Occupancy
  const fixkosten = bewirtschaftungskosten - leerstand + kapitaldienst
  const breakEvenOccupancy = jahresmieteNetto > 0 ? fixkosten / jahresmieteNetto : 1

  return {
    bruttoRendite: Math.round(bruttoRendite * 100) / 100,
    nettoRendite: Math.round(nettoRendite * 100) / 100,
    cashOnCash: Math.round(cashOnCash * 100) / 100,
    dscr: Math.round(dscr * 100) / 100,
    icr: Math.round(icr * 100) / 100,
    ltv: Math.round(ltv * 100) / 100,
    mietmultiplikator: Math.round(mietmultiplikator * 10) / 10,
    breakEvenOccupancy: Math.round(breakEvenOccupancy * 100) / 100,
    // Hilfswerte
    jahresmieteNetto,
    nettoMiete,
    bewirtschaftungskosten,
    kapitaldienst,
    zinslast,
    fremdkapital,
    kaufpreisGesamt,
    cashflowNachFinanzierung,
  }
}

// ─── Deal-Killer Pruefung (Top 10) ──────────────────────────────────────

function checkDealKillers(
  d: ScoringDefaults,
  k: ReturnType<typeof calculateKennzahlen>
): DealKiller[] {
  const killers: DealKiller[] = []

  // 1. DSCR unter 1.0 = Kapitaldienstfaehigkeit nicht gegeben
  if (k.dscr < SCHWELLENWERTE.dscr.dealKiller) {
    killers.push({
      label: "DSCR unter 1,0",
      description: `DSCR von ${k.dscr} - Mieteinnahmen decken nicht den Kapitaldienst. Zuschusspflicht.`,
    })
  }

  // 2. LTV ueber 90%
  if (k.ltv > SCHWELLENWERTE.ltv.dealKiller) {
    killers.push({
      label: "LTV ueber 90%",
      description: `LTV von ${Math.round(k.ltv * 100)}% - Extreme Fremdfinanzierung, hohes Risiko bei Wertverlust.`,
    })
  }

  // 3. Mietmultiplikator ueber 30
  if (k.mietmultiplikator > SCHWELLENWERTE.mietmultiplikator.dealKiller) {
    killers.push({
      label: "Mietmultiplikator ueber 30",
      description: `Faktor ${k.mietmultiplikator} - Kaufpreis steht in keinem Verhaeltnis zur Mietrendite.`,
    })
  }

  // 4. Baujahr vor 1950 ohne Modernisierung
  if (d.baujahr < SCHWELLENWERTE.baujahr.dealKillerOhneModernisierung && d.modernisierungKosten === 0) {
    killers.push({
      label: "Baujahr vor 1950 ohne Modernisierung",
      description: `Baujahr ${d.baujahr} ohne geplante Modernisierung - erhebliche Substanzrisiken.`,
    })
  }

  // 5. Negativer Cashflow nach Finanzierung
  if (k.cashflowNachFinanzierung < -500) {
    killers.push({
      label: "Negativer Cashflow",
      description: `Monatlicher Verlust von ${Math.round(Math.abs(k.cashflowNachFinanzierung / 12))} EUR nach Finanzierungskosten.`,
    })
  }

  // 6. Brutto-Rendite unter 3%
  if (k.bruttoRendite < 3.0) {
    killers.push({
      label: "Brutto-Rendite unter 3%",
      description: `Nur ${k.bruttoRendite}% Brutto-Rendite - selbst risikolose Anlagen bieten mehr.`,
    })
  }

  return killers
}

// ─── Dimension: Rendite ─────────────────────────────────────────────────

function scoreRendite(k: ReturnType<typeof calculateKennzahlen>): DimensionScore {
  const details: string[] = []
  let points = 0

  // Brutto-Rendite
  if (k.bruttoRendite >= SCHWELLENWERTE.bruttoRendite.gruen) {
    points += 3; details.push(`Brutto ${k.bruttoRendite}% (stark)`)
  } else if (k.bruttoRendite >= SCHWELLENWERTE.bruttoRendite.gelb) {
    points += 2; details.push(`Brutto ${k.bruttoRendite}% (akzeptabel)`)
  } else {
    points += 1; details.push(`Brutto ${k.bruttoRendite}% (schwach)`)
  }

  // Netto-Rendite
  if (k.nettoRendite >= SCHWELLENWERTE.nettoRendite.gruen) {
    points += 3; details.push(`Netto ${k.nettoRendite}% (stark)`)
  } else if (k.nettoRendite >= SCHWELLENWERTE.nettoRendite.gelb) {
    points += 2; details.push(`Netto ${k.nettoRendite}% (akzeptabel)`)
  } else {
    points += 1; details.push(`Netto ${k.nettoRendite}% (schwach)`)
  }

  // Cash on Cash
  if (k.cashOnCash >= SCHWELLENWERTE.cashOnCash.gruen) {
    points += 3; details.push(`CoC ${k.cashOnCash}% (hervorragend)`)
  } else if (k.cashOnCash >= SCHWELLENWERTE.cashOnCash.gelb) {
    points += 2; details.push(`CoC ${k.cashOnCash}% (solide)`)
  } else {
    points += 1; details.push(`CoC ${k.cashOnCash}% (gering)`)
  }

  const avg = points / 3
  const ampel: Ampel = avg >= 2.5 ? "gruen" : avg >= 1.5 ? "gelb" : "rot"
  return { ampel, score: Math.round(avg * 10) / 10, label: "Rendite", details }
}

// ─── Dimension: Risiko ──────────────────────────────────────────────────

function scoreRisiko(d: ScoringDefaults, k: ReturnType<typeof calculateKennzahlen>): DimensionScore {
  const details: string[] = []
  let points = 0
  const alter = new Date().getFullYear() - d.baujahr

  // Baujahr-Risiko
  if (d.baujahr >= 2000) {
    points += 3; details.push(`Baujahr ${d.baujahr} (gering)`)
  } else if (d.baujahr >= 1970) {
    points += 2; details.push(`Baujahr ${d.baujahr} - ${alter}J alt (mittel)`)
  } else {
    points += 1; details.push(`Baujahr ${d.baujahr} - ${alter}J alt (hoch)`)
  }

  // Zustand
  const zustandLower = d.zustand.toLowerCase()
  if (zustandLower.includes("gut") || zustandLower.includes("neubau") || zustandLower.includes("saniert")) {
    points += 3; details.push(`Zustand: ${d.zustand} (gering)`)
  } else if (zustandLower.includes("mittel") || zustandLower.includes("normal")) {
    points += 2; details.push(`Zustand: ${d.zustand} (mittel)`)
  } else {
    points += 1; details.push(`Zustand: ${d.zustand} (hoch)`)
  }

  // Break-Even Occupancy
  if (k.breakEvenOccupancy <= SCHWELLENWERTE.breakEvenOccupancy.gruen) {
    points += 3; details.push(`Break-Even bei ${Math.round(k.breakEvenOccupancy * 100)}% Auslastung`)
  } else if (k.breakEvenOccupancy <= SCHWELLENWERTE.breakEvenOccupancy.gelb) {
    points += 2; details.push(`Break-Even bei ${Math.round(k.breakEvenOccupancy * 100)}% (eng)`)
  } else {
    points += 1; details.push(`Break-Even bei ${Math.round(k.breakEvenOccupancy * 100)}% (kritisch)`)
  }

  const avg = points / 3
  const ampel: Ampel = avg >= 2.5 ? "gruen" : avg >= 1.5 ? "gelb" : "rot"
  return { ampel, score: Math.round(avg * 10) / 10, label: "Risiko", details }
}

// ─── Dimension: Finanzierung ────────────────────────────────────────────

function scoreFinanzierung(k: ReturnType<typeof calculateKennzahlen>, d: ScoringDefaults): DimensionScore {
  const details: string[] = []
  let points = 0

  // DSCR
  if (k.dscr >= SCHWELLENWERTE.dscr.gruen) {
    points += 3; details.push(`DSCR ${k.dscr} (komfortabel)`)
  } else if (k.dscr >= SCHWELLENWERTE.dscr.gelb) {
    points += 2; details.push(`DSCR ${k.dscr} (eng)`)
  } else {
    points += 1; details.push(`DSCR ${k.dscr} (kritisch)`)
  }

  // LTV
  if (k.ltv <= SCHWELLENWERTE.ltv.gruen) {
    points += 3; details.push(`LTV ${Math.round(k.ltv * 100)}% (konservativ)`)
  } else if (k.ltv <= SCHWELLENWERTE.ltv.gelb) {
    points += 2; details.push(`LTV ${Math.round(k.ltv * 100)}% (akzeptabel)`)
  } else {
    points += 1; details.push(`LTV ${Math.round(k.ltv * 100)}% (riskant)`)
  }

  // ICR
  if (k.icr >= SCHWELLENWERTE.icr.gruen) {
    points += 3; details.push(`ICR ${k.icr} (stark)`)
  } else if (k.icr >= SCHWELLENWERTE.icr.gelb) {
    points += 2; details.push(`ICR ${k.icr} (ausreichend)`)
  } else {
    points += 1; details.push(`ICR ${k.icr} (schwach)`)
  }

  const avg = points / 3
  const ampel: Ampel = avg >= 2.5 ? "gruen" : avg >= 1.5 ? "gelb" : "rot"
  return { ampel, score: Math.round(avg * 10) / 10, label: "Finanzierung", details }
}

// ─── Dimension: Value-Add ───────────────────────────────────────────────

function scoreValueAdd(d: ScoringDefaults): DimensionScore {
  const details: string[] = []
  let points = 0
  const alter = new Date().getFullYear() - d.baujahr
  const zustandLower = d.zustand.toLowerCase()

  // Modernisierungspotenzial
  if (alter > 30 && (zustandLower.includes("schlecht") || zustandLower.includes("renovierung"))) {
    points += 3; details.push("Hohes Modernisierungspotenzial")
  } else if (alter > 15 && !zustandLower.includes("neubau")) {
    points += 2; details.push("Moderates Modernisierungspotenzial")
  } else {
    points += 1; details.push("Geringes Modernisierungspotenzial")
  }

  // Mietanpassungspotenzial (geschaetzt ueber niedrigen Multiplikator)
  const mietProQm = (d.mieteinnahmenMonat / d.wohnflaeche)
  if (mietProQm < 7) {
    points += 3; details.push(`Miete ${mietProQm.toFixed(1)} EUR/qm (hohe Steigerungsmarge)`)
  } else if (mietProQm < 10) {
    points += 2; details.push(`Miete ${mietProQm.toFixed(1)} EUR/qm (moderate Steigerungsmarge)`)
  } else {
    points += 1; details.push(`Miete ${mietProQm.toFixed(1)} EUR/qm (wenig Spielraum)`)
  }

  // Geplante Modernisierung
  if (d.modernisierungKosten > 0) {
    const modernProQm = d.modernisierungKosten / d.wohnflaeche
    if (modernProQm > 300) {
      points += 3; details.push(`Modernisierung ${Math.round(modernProQm)} EUR/qm geplant`)
    } else {
      points += 2; details.push(`Leichte Modernisierung geplant`)
    }
  } else {
    // Kein Abzug - kein Modernisierungsplan = neutral
    points += 2; details.push("Keine Modernisierung geplant")
  }

  const avg = points / 3
  const ampel: Ampel = avg >= 2.5 ? "gruen" : avg >= 1.5 ? "gelb" : "rot"
  return { ampel, score: Math.round(avg * 10) / 10, label: "Value-Add", details }
}

// ─── Dimension: Lage/Markt ──────────────────────────────────────────────

function scoreLageMarkt(d: ScoringDefaults): DimensionScore {
  const details: string[] = []
  let points = 0

  // Stadtgroesse als Indikator (PLZ-basierte Heuristik)
  const topStaedte = ["berlin", "muenchen", "hamburg", "koeln", "frankfurt", "duesseldorf", "stuttgart", "leipzig", "dresden", "nuernberg", "hannover", "bremen", "essen", "dortmund", "bochum", "wuppertal", "bonn", "muenster", "karlsruhe", "mannheim", "augsburg", "wiesbaden", "braunschweig", "freiburg", "mainz", "aachen"]
  const bStaedte = ["bielefeld", "halle", "magdeburg", "erfurt", "rostock", "kassel", "luebeck", "oldenburg", "osnabrueck", "solingen", "leverkusen", "heidelberg", "darmstadt", "potsdam", "regensburg", "paderborn", "ingolstadt", "offenbach", "ulm", "heilbronn", "goettingen", "wolfsburg", "reutlingen", "koblenz", "jena", "trier", "hildesheim"]

  const stadtLower = d.stadt.toLowerCase().replace(/ü/g, "ue").replace(/ö/g, "oe").replace(/ä/g, "ae")

  if (topStaedte.includes(stadtLower)) {
    points += 3; details.push(`${d.stadt} - A/B-Stadt (hohe Nachfrage)`)
  } else if (bStaedte.includes(stadtLower)) {
    points += 2; details.push(`${d.stadt} - B/C-Stadt (solide Nachfrage)`)
  } else {
    points += 1; details.push(`${d.stadt} - Kleinstadt/laendlich (unsichere Nachfrage)`)
  }

  // Objekttyp-Bewertung
  const typLower = d.objekttyp.toLowerCase()
  if (typLower.includes("mehrfamilien") || typLower.includes("mfh")) {
    points += 3; details.push("Mehrfamilienhaus (diversifiziertes Mietrisiko)")
  } else if (typLower.includes("eigentumswohnung") || typLower.includes("etw") || typLower.includes("wohnung")) {
    points += 2; details.push("Eigentumswohnung (Klumpenrisiko)")
  } else if (typLower.includes("gewerbe")) {
    points += 2; details.push("Gewerbeimmobilie (konjunkturabhaengig)")
  } else {
    points += 2; details.push(`${d.objekttyp} (Standard)`)
  }

  // Wohneinheiten (Diversifikation)
  if (d.wohneinheiten >= 6) {
    points += 3; details.push(`${d.wohneinheiten} WE (gute Diversifikation)`)
  } else if (d.wohneinheiten >= 3) {
    points += 2; details.push(`${d.wohneinheiten} WE (moderate Diversifikation)`)
  } else {
    points += 1; details.push(`${d.wohneinheiten} WE (keine Diversifikation)`)
  }

  const avg = points / 3
  const ampel: Ampel = avg >= 2.5 ? "gruen" : avg >= 1.5 ? "gelb" : "rot"
  return { ampel, score: Math.round(avg * 10) / 10, label: "Lage / Markt", details }
}

// ─── Dimension: Deal Sourcing / Kaufpreis ───────────────────────────────

function scoreDealSourcing(k: ReturnType<typeof calculateKennzahlen>, d: ScoringDefaults): DimensionScore {
  const details: string[] = []
  let points = 0

  // Mietmultiplikator
  if (k.mietmultiplikator <= SCHWELLENWERTE.mietmultiplikator.gruen) {
    points += 3; details.push(`Faktor ${k.mietmultiplikator} (guenstiger Einkauf)`)
  } else if (k.mietmultiplikator <= SCHWELLENWERTE.mietmultiplikator.gelb) {
    points += 2; details.push(`Faktor ${k.mietmultiplikator} (marktgerecht)`)
  } else {
    points += 1; details.push(`Faktor ${k.mietmultiplikator} (teuer)`)
  }

  // Preis pro qm
  const preisProQm = d.kaufpreis / d.wohnflaeche
  if (preisProQm < 1500) {
    points += 3; details.push(`${Math.round(preisProQm)} EUR/qm (guenstig)`)
  } else if (preisProQm < 3000) {
    points += 2; details.push(`${Math.round(preisProQm)} EUR/qm (normal)`)
  } else {
    points += 1; details.push(`${Math.round(preisProQm)} EUR/qm (teuer)`)
  }

  // Kaufnebenkosten-Belastung
  const nkAnteil = d.nebenkosten * 100
  if (nkAnteil <= 8) {
    points += 3; details.push(`NK ${nkAnteil.toFixed(0)}% (niedrig)`)
  } else if (nkAnteil <= 12) {
    points += 2; details.push(`NK ${nkAnteil.toFixed(0)}% (normal)`)
  } else {
    points += 1; details.push(`NK ${nkAnteil.toFixed(0)}% (hoch)`)
  }

  const avg = points / 3
  const ampel: Ampel = avg >= 2.5 ? "gruen" : avg >= 1.5 ? "gelb" : "rot"
  return { ampel, score: Math.round(avg * 10) / 10, label: "Deal / Kaufpreis", details }
}

// ─── Stress-Tests ───────────────────────────────────────────────────────

function calculateStressTests(
  d: ScoringDefaults,
  k: ReturnType<typeof calculateKennzahlen>
): StressTest[] {
  const tests: StressTest[] = []

  // 1. Zinserhoehung +2%
  const newAnnuitaet = ((d.zinssatz + 2) + d.tilgung) / 100
  const newKapitaldienst = k.fremdkapital * newAnnuitaet
  const newDscr = newKapitaldienst > 0 ? k.nettoMiete / newKapitaldienst : 999
  tests.push({
    label: "Zinserhoehung +2%",
    baseValue: k.dscr,
    stressedValue: Math.round(newDscr * 100) / 100,
    change: `DSCR ${k.dscr} -> ${Math.round(newDscr * 100) / 100}`,
    status: newDscr >= 1.1 ? "gruen" : newDscr >= 1.0 ? "gelb" : "rot",
  })

  // 2. Leerstand 6 Monate (1 WE)
  const leerstandVerlust = d.mieteinnahmenMonat / d.wohneinheiten * 6
  const nettoNachLeerstand = k.nettoMiete - leerstandVerlust
  const dscrleerstand = k.kapitaldienst > 0 ? nettoNachLeerstand / k.kapitaldienst : 999
  tests.push({
    label: "6 Monate Leerstand (1 WE)",
    baseValue: k.dscr,
    stressedValue: Math.round(dscrleerstand * 100) / 100,
    change: `DSCR ${k.dscr} -> ${Math.round(dscrleerstand * 100) / 100}`,
    status: dscrleerstand >= 1.1 ? "gruen" : dscrleerstand >= 1.0 ? "gelb" : "rot",
  })

  // 3. Mietrueckgang -10%
  const reducedMiete = k.nettoMiete * 0.9
  const dscrMinus = k.kapitaldienst > 0 ? reducedMiete / k.kapitaldienst : 999
  tests.push({
    label: "Mietrueckgang -10%",
    baseValue: k.dscr,
    stressedValue: Math.round(dscrMinus * 100) / 100,
    change: `DSCR ${k.dscr} -> ${Math.round(dscrMinus * 100) / 100}`,
    status: dscrMinus >= 1.1 ? "gruen" : dscrMinus >= 1.0 ? "gelb" : "rot",
  })

  // 4. Kombi: Zins +1% und Leerstand 3 Monate
  const comboAnnuitaet = ((d.zinssatz + 1) + d.tilgung) / 100
  const comboKapitaldienst = k.fremdkapital * comboAnnuitaet
  const comboLeerstand = d.mieteinnahmenMonat / d.wohneinheiten * 3
  const comboNetto = k.nettoMiete - comboLeerstand
  const comboScore = comboKapitaldienst > 0 ? comboNetto / comboKapitaldienst : 999
  tests.push({
    label: "Kombi: Zins +1% + 3M Leerstand",
    baseValue: k.dscr,
    stressedValue: Math.round(comboScore * 100) / 100,
    change: `DSCR ${k.dscr} -> ${Math.round(comboScore * 100) / 100}`,
    status: comboScore >= 1.1 ? "gruen" : comboScore >= 1.0 ? "gelb" : "rot",
  })

  return tests
}
