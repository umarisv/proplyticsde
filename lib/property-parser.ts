/**
 * Extracts structured property data from free-form German text input.
 * Handles common patterns like "MFH Leipzig 24 WE Bj 1985 2.1 Mio 850qm"
 */

export interface ParsedProperty {
  objekttyp: string | null
  stadt: string | null
  plz: string | null
  baujahr: number | null
  wohnflaeche: number | null
  grundstueck: number | null
  zimmer: number | null
  wohneinheiten: number | null
  kaufpreis: number | null
  mieteinnahmen: number | null
  zustand: string | null
}

export interface ParsedField {
  key: keyof ParsedProperty
  label: string
  value: string
  raw: string | number
}

export interface MissingField {
  key: keyof ParsedProperty
  label: string
  hint: string
  priority: "hoch" | "mittel" | "niedrig"
}

// Known German cities (top 80)
const STAEDTE = [
  "berlin", "hamburg", "muenchen", "münchen", "koeln", "köln", "frankfurt",
  "stuttgart", "duesseldorf", "düsseldorf", "dortmund", "essen", "leipzig",
  "bremen", "dresden", "hannover", "nuernberg", "nürnberg", "duisburg",
  "bochum", "wuppertal", "bielefeld", "bonn", "muenster", "münster",
  "karlsruhe", "mannheim", "augsburg", "wiesbaden", "gelsenkirchen",
  "moenchengladbach", "mönchengladbach", "braunschweig", "chemnitz", "kiel",
  "aachen", "halle", "magdeburg", "freiburg", "krefeld", "luebeck", "lübeck",
  "oberhausen", "erfurt", "mainz", "rostock", "kassel", "hagen",
  "hamm", "saarbruecken", "saarbrücken", "muelheim", "mülheim", "potsdam",
  "ludwigshafen", "oldenburg", "leverkusen", "osnabrueck", "osnabrück",
  "solingen", "heidelberg", "herne", "neuss", "darmstadt", "paderborn",
  "regensburg", "ingolstadt", "wuerzburg", "würzburg", "wolfsburg",
  "ulm", "goettingen", "göttingen", "heilbronn", "pforzheim", "offenbach",
  "recklinghausen", "bottrop", "trier", "remscheid", "bremerhaven", "jena",
]

const OBJEKTTYPEN: Record<string, string> = {
  "mfh": "mehrfamilienhaus",
  "mehrfamilienhaus": "mehrfamilienhaus",
  "efh": "einfamilienhaus",
  "einfamilienhaus": "einfamilienhaus",
  "etw": "eigentumswohnung",
  "eigentumswohnung": "eigentumswohnung",
  "wohnung": "eigentumswohnung",
  "reihenhaus": "reihenhaus",
  "rhh": "reihenhaus",
  "doppelhaushaelfte": "doppelhaushaelfte",
  "doppelhaushälfte": "doppelhaushaelfte",
  "dhh": "doppelhaushaelfte",
  "gewerbe": "gewerbe",
  "buero": "gewerbe",
  "büro": "gewerbe",
  "zfh": "zweifamilienhaus",
  "zweifamilienhaus": "zweifamilienhaus",
  "grundstueck": "grundstueck",
  "grundstück": "grundstueck",
  "anlage": "mehrfamilienhaus",
  "zinshaus": "mehrfamilienhaus",
  "renditeobjekt": "mehrfamilienhaus",
}

const ZUSTAENDE: Record<string, string> = {
  "saniert": "saniert",
  "kernsaniert": "saniert",
  "modernisiert": "modernisiert",
  "teilsaniert": "modernisiert",
  "renoviert": "modernisiert",
  "neubau": "neubau",
  "erstbezug": "neubau",
  "unsaniert": "unsaniert",
  "renovierungsbeduerftig": "renovierungsbeduerftig",
  "renovierungsbedürftig": "renovierungsbeduerftig",
  "sanierungsbeduerftig": "renovierungsbeduerftig",
  "sanierungsbedürftig": "renovierungsbeduerftig",
  "gut": "gut",
  "guter zustand": "gut",
  "gepflegt": "gut",
  "sehr gut": "sehr_gut",
  "neuwertig": "sehr_gut",
  "mittel": "mittel",
  "normal": "mittel",
  "maessig": "maessig",
  "schlecht": "schlecht",
}

/**
 * Parse German number: "2.100.000" or "2,1 Mio" or "2100000" or "850.000"
 */
function parseGermanNumber(raw: string): number | null {
  let s = raw.trim().toLowerCase()

  // Handle "Mio" / "mio" suffix
  const mioMatch = s.match(/^([\d.,]+)\s*mio/)
  if (mioMatch) {
    const base = parseFloat(mioMatch[1].replace(/\./g, "").replace(",", "."))
    return isNaN(base) ? null : base * 1_000_000
  }

  // Handle "Tsd" / "tsd" / "k" suffix
  const tsdMatch = s.match(/^([\d.,]+)\s*(tsd|k)/)
  if (tsdMatch) {
    const base = parseFloat(tsdMatch[1].replace(/\./g, "").replace(",", "."))
    return isNaN(base) ? null : base * 1_000
  }

  // Standard German number: replace dots (thousand sep), replace comma (decimal)
  s = s.replace(/[€\s]/g, "")
  // If has dots and comma: "2.100.000,00" -> "2100000.00"
  if (s.includes(".") && s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".")
  } else if (s.includes(",")) {
    // Only comma: "2100,50" -> "2100.50"
    s = s.replace(",", ".")
  } else if (s.match(/\.\d{3}(\.|$)/)) {
    // Dot as thousand separator: "2.100.000" -> "2100000"
    s = s.replace(/\./g, "")
  }

  const num = parseFloat(s)
  return isNaN(num) ? null : num
}

export function parsePropertyText(text: string): ParsedProperty {
  const t = text.toLowerCase()
  const result: ParsedProperty = {
    objekttyp: null,
    stadt: null,
    plz: null,
    baujahr: null,
    wohnflaeche: null,
    grundstueck: null,
    zimmer: null,
    wohneinheiten: null,
    kaufpreis: null,
    mieteinnahmen: null,
    zustand: null,
  }

  // PLZ
  const plzMatch = t.match(/\b(\d{5})\b/)
  if (plzMatch) result.plz = plzMatch[1]

  // Stadt
  for (const stadt of STAEDTE) {
    if (t.includes(stadt)) {
      result.stadt = stadt.charAt(0).toUpperCase() + stadt.slice(1)
      break
    }
  }

  // Objekttyp
  for (const [key, val] of Object.entries(OBJEKTTYPEN)) {
    if (t.includes(key)) {
      result.objekttyp = val
      break
    }
  }

  // Zustand
  for (const [key, val] of Object.entries(ZUSTAENDE)) {
    if (t.includes(key)) {
      result.zustand = val
      break
    }
  }

  // Baujahr: "Bj. 1985", "Bj 1985", "Baujahr 1985", "von 1985", "aus 1985"
  const bjMatch = t.match(/(?:bj\.?\s*|baujahr\s*|aus\s+|von\s+)(\d{4})\b/)
  if (bjMatch) {
    const yr = parseInt(bjMatch[1])
    if (yr >= 1800 && yr <= 2030) result.baujahr = yr
  }
  // Standalone 4-digit year in range
  if (!result.baujahr) {
    const yearMatch = t.match(/\b(19\d{2}|20[0-2]\d)\b/)
    if (yearMatch) {
      const yr = parseInt(yearMatch[1])
      if (yr >= 1850 && yr <= 2030) result.baujahr = yr
    }
  }

  // Wohnflaeche: "85 qm", "85m2", "85m²", "85 quadratmeter"
  const flaecheMatch = t.match(/([\d.,]+)\s*(?:qm|m2|m²|quadratmeter)\b/)
  if (flaecheMatch) {
    const val = parseGermanNumber(flaecheMatch[1])
    if (val && val > 10 && val < 50000) result.wohnflaeche = val
  }

  // Grundstueck: "500qm Grundstueck", "Grundstueck 500qm"
  const grundMatch = t.match(/(?:grundst[uü]ck|grundfl[aä]che)\s*(?:von\s*)?([\d.,]+)\s*(?:qm|m2|m²)?/)
    || t.match(/([\d.,]+)\s*(?:qm|m2|m²)\s*(?:grundst[uü]ck|grundfl[aä]che)/)
  if (grundMatch) {
    const val = parseGermanNumber(grundMatch[1])
    if (val && val > 50 && val < 100000) result.grundstueck = val
  }

  // Zimmer: "3 Zimmer", "3-Zimmer", "3 Zi", "3Zi"
  const zimmerMatch = t.match(/(\d+)[\s-]*(?:zimmer|zi\b|raum|räume|raeume)/)
  if (zimmerMatch) {
    const val = parseInt(zimmerMatch[1])
    if (val > 0 && val < 30) result.zimmer = val
  }

  // Wohneinheiten: "24 WE", "24 Einheiten", "24 Wohneinheiten", "24 Wohnungen"
  const weMatch = t.match(/(\d+)\s*(?:we\b|wohneinheiten|einheiten|wohnungen|parteien)/)
  if (weMatch) {
    const val = parseInt(weMatch[1])
    if (val > 0 && val < 500) result.wohneinheiten = val
  }

  // Kaufpreis: "2.1 Mio", "2.100.000 €", "KP 2.1 Mio", "Kaufpreis: 2.100.000"
  const kpMatch = t.match(/(?:kaufpreis|kp|preis|vp|verkaufspreis|angebotspreis)[\s:]*([€\d.,]+\s*(?:mio|tsd|k)?(?:\s*(?:€|eur|euro))?)/)
    || t.match(/([€\d.,]+\s*(?:mio|tsd|k))\s*(?:€|eur|euro|kaufpreis)?/)
  if (kpMatch) {
    const val = parseGermanNumber(kpMatch[1])
    if (val && val > 10000) result.kaufpreis = val
  }
  // Fallback: any number >= 50k with "€" or "Euro" nearby
  if (!result.kaufpreis) {
    const euroMatch = t.match(/([\d.,]+)\s*(?:€|eur|euro)/)
    if (euroMatch) {
      const val = parseGermanNumber(euroMatch[1])
      if (val && val >= 50000) result.kaufpreis = val
    }
  }

  // Mieteinnahmen: "8.500€/Monat", "Miete 8500", "Kaltmiete 8.500"
  const mieteMatch = t.match(/(?:miet(?:einnahmen|e)|kaltmiete|nettomiete|ist-miete|istmiete|monatsmiete)[\s:]*([€\d.,]+)\s*(?:€|eur)?(?:\s*\/?\s*(?:monat|mtl|mon|p\.?\s*m\.?))?/)
  if (mieteMatch) {
    const val = parseGermanNumber(mieteMatch[1])
    if (val && val > 100 && val < 500000) result.mieteinnahmen = val
  }
  // "€/Monat" pattern
  if (!result.mieteinnahmen) {
    const mMatch = t.match(/([\d.,]+)\s*(?:€|eur)?\s*\/?\s*(?:monat|mtl|mon|p\.?\s*m\.?)/)
    if (mMatch) {
      const val = parseGermanNumber(mMatch[1])
      if (val && val > 100 && val < 500000) result.mieteinnahmen = val
    }
  }

  return result
}

/**
 * Get human-readable list of what was parsed.
 */
export function getParsedFields(parsed: ParsedProperty): ParsedField[] {
  const fields: ParsedField[] = []

  const labels: Record<keyof ParsedProperty, string> = {
    objekttyp: "Objekttyp",
    stadt: "Stadt",
    plz: "PLZ",
    baujahr: "Baujahr",
    wohnflaeche: "Wohnflaeche",
    grundstueck: "Grundstueck",
    zimmer: "Zimmer",
    wohneinheiten: "Wohneinheiten",
    kaufpreis: "Kaufpreis",
    mieteinnahmen: "Mieteinnahmen",
    zustand: "Zustand",
  }

  const formatters: Partial<Record<keyof ParsedProperty, (v: string | number) => string>> = {
    objekttyp: (v) => {
      const map: Record<string, string> = {
        mehrfamilienhaus: "Mehrfamilienhaus",
        einfamilienhaus: "Einfamilienhaus",
        eigentumswohnung: "Eigentumswohnung",
        reihenhaus: "Reihenhaus",
        doppelhaushaelfte: "Doppelhaushaelfte",
        zweifamilienhaus: "Zweifamilienhaus",
        gewerbe: "Gewerbe",
        grundstueck: "Grundstueck",
      }
      return map[v as string] || (v as string)
    },
    zustand: (v) => {
      const map: Record<string, string> = {
        saniert: "Saniert",
        modernisiert: "Modernisiert",
        neubau: "Neubau",
        unsaniert: "Unsaniert",
        renovierungsbeduerftig: "Renovierungsbeduerftig",
        gut: "Gut",
        sehr_gut: "Sehr gut",
        mittel: "Mittel",
        maessig: "Maessig",
        schlecht: "Schlecht",
      }
      return map[v as string] || (v as string)
    },
    wohnflaeche: (v) => `${v} qm`,
    grundstueck: (v) => `${v} qm`,
    kaufpreis: (v) => {
      const n = v as number
      if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} Mio. EUR`
      return `${n.toLocaleString("de-DE")} EUR`
    },
    mieteinnahmen: (v) => `${(v as number).toLocaleString("de-DE")} EUR/Monat`,
  }

  for (const [key, label] of Object.entries(labels)) {
    const k = key as keyof ParsedProperty
    const val = parsed[k]
    if (val !== null) {
      const formatter = formatters[k]
      fields.push({
        key: k,
        label,
        value: formatter ? formatter(val) : String(val),
        raw: val as string | number,
      })
    }
  }

  return fields
}

/**
 * Get list of missing fields with hints on why they're useful.
 * Adapts based on what's already been provided and the Objekttyp.
 */
export function getMissingFields(parsed: ParsedProperty): MissingField[] {
  const missing: MissingField[] = []
  const isMFH = parsed.objekttyp === "mehrfamilienhaus" || parsed.objekttyp === "zweifamilienhaus"
  const isWohnung = parsed.objekttyp === "eigentumswohnung"

  // Always important
  if (!parsed.objekttyp) {
    missing.push({
      key: "objekttyp",
      label: "Objekttyp",
      hint: "ETW, MFH, EFH? Der Typ bestimmt Bewertungsverfahren und Vergleichsfaktoren.",
      priority: "hoch",
    })
  }

  if (!parsed.stadt && !parsed.plz) {
    missing.push({
      key: "stadt",
      label: "Standort",
      hint: "Stadt oder PLZ? Entscheidend fuer den Lage-Score und den qm-Preis.",
      priority: "hoch",
    })
  }

  if (!parsed.kaufpreis) {
    missing.push({
      key: "kaufpreis",
      label: "Kaufpreis",
      hint: "Wie viel wird verlangt? Noetig fuer Rendite-Berechnung und Mietmultiplikator.",
      priority: "hoch",
    })
  }

  if (!parsed.wohnflaeche) {
    missing.push({
      key: "wohnflaeche",
      label: "Wohnflaeche",
      hint: "Gesamte qm? Wichtig fuer qm-Preis und Marktvergleich.",
      priority: "hoch",
    })
  }

  // Important for analysis
  if (!parsed.baujahr) {
    missing.push({
      key: "baujahr",
      label: "Baujahr",
      hint: "Bestimmt Restnutzungsdauer, Sanierungsrisiko und Ertragswertberechnung.",
      priority: "mittel",
    })
  }

  if (!parsed.mieteinnahmen && (isMFH || parsed.kaufpreis)) {
    missing.push({
      key: "mieteinnahmen",
      label: "Mieteinnahmen",
      hint: isMFH
        ? "Monatliche Kaltmiete? Kernkennzahl fuer Rendite, DSCR und Cashflow-Analyse."
        : "Falls vermietet: Monatliche Kaltmiete fuer die Renditeberechnung.",
      priority: isMFH ? "hoch" : "mittel",
    })
  }

  if (!parsed.wohneinheiten && isMFH) {
    missing.push({
      key: "wohneinheiten",
      label: "Wohneinheiten",
      hint: "Anzahl WE? Hilft bei der Risikobewertung und Leerstandsberechnung.",
      priority: "mittel",
    })
  }

  if (!parsed.zimmer && isWohnung) {
    missing.push({
      key: "zimmer",
      label: "Zimmer",
      hint: "Anzahl Zimmer? Relevant fuer den Vergleichswert am lokalen Markt.",
      priority: "mittel",
    })
  }

  // Nice to have
  if (!parsed.zustand) {
    missing.push({
      key: "zustand",
      label: "Zustand",
      hint: "Saniert, modernisiert, unsaniert? Beeinflusst den Sachwert und Value-Add-Potenzial.",
      priority: "niedrig",
    })
  }

  if (!parsed.grundstueck && !isWohnung) {
    missing.push({
      key: "grundstueck",
      label: "Grundstuecksflaeche",
      hint: "Grundstuecksgroesse? Fliesst in Bodenwert und Sachwertberechnung ein.",
      priority: "niedrig",
    })
  }

  return missing
}

/**
 * Count how "complete" the input is (0-100%)
 */
export function getCompleteness(parsed: ParsedProperty): number {
  const weights: Partial<Record<keyof ParsedProperty, number>> = {
    objekttyp: 15,
    stadt: 12,
    plz: 3,
    baujahr: 12,
    wohnflaeche: 15,
    kaufpreis: 18,
    mieteinnahmen: 12,
    wohneinheiten: 5,
    zustand: 5,
    zimmer: 3,
  }

  let total = 0
  let earned = 0
  for (const [key, weight] of Object.entries(weights)) {
    total += weight
    if (parsed[key as keyof ParsedProperty] !== null) earned += weight
  }

  return Math.round((earned / total) * 100)
}

/**
 * Build query params to pre-fill the analyse page from parsed data.
 */
export function buildAnalyseParams(parsed: ParsedProperty): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(parsed)) {
    if (value !== null) {
      params.set(key, String(value))
    }
  }
  return params
}
