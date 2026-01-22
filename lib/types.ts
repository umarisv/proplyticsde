export interface Case {
  id: string
  address: string
  city: string
  zip: string
  createdAt: string
  status: "draft" | "done" | "exported"
  marktwert: number
  bodenrichtwert: number
  objekttyp: string
  baujahr: number
  wohnflaeche: number
  grundstueck: number
  istMiete: number
  ertragswert: number
  sachwert: number
  faktor: number
  rendite: number
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Analyse Module Types
export interface AnalyseFormData {
  plz: string
  stadt: string
  objekttyp: string
  wohnflaeche: string
  grundstueck: string
  baujahr: string
  zustand: string
  // Erweiterte Parameter
  ausstattung: 'einfach' | 'mittel' | 'gehoben' | 'luxus'
  lage: 'einfach' | 'mittel' | 'gut' | 'sehr_gut'
  energieeffizienz: string
  anzahlWohnungen: string
  stellplaetze: string
  keller: boolean
  balkon: boolean
  aufzug: boolean
  // Finanzen
  istMiete: string
  bodenrichtwert: string
  kaufpreis: string
  // ETW-spezifisch
  mea: string                    // Miteigentumsanteil in ‰
  etage: string                  // Etage (0 = EG, -1 = UG)
  hausgeld: string               // Monatliches Hausgeld in €
  // WGH-spezifisch
  gewerbeflaeche: string         // Gewerbefläche in m²
  gewerbemiete: string           // Monatliche Gewerbemiete in €
  // MFH-spezifisch
  vermieteteEinheiten: string    // Anzahl vermieteter Einheiten
  // Dokumente
  uploadedFiles: UploadedFile[]
}

// Dokument-Upload Types
export type FileCategory = 'aussen' | 'innen' | 'grundriss' | 'energie' | 'expose' | 'sonstiges'

export interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  category: FileCategory
  url: string
  thumbnailUrl?: string
  aiAnalysis?: AIAnalysisResult
}

export interface AIAnalysisResult {
  zustandScore: number           // 1-10
  ausstattungScore: number       // 1-10
  erkannteExtras: string[]       // ["balkon", "einbaukueche", "parkett"]
  warnungen: string[]            // ["Schimmel erkannt", "Alte Fenster"]
  geschaetzteWohnflaeche?: number
  energieeffizienz?: string
  zimmeranzahl?: number
  raumaufteilung?: string        // "gut" | "mittel" | "schlecht"
  freitext: string               // KI-Zusammenfassung
  kategorie: FileCategory
}

export interface AnalyseResultData {
  // Marktwert
  marktwert: number
  marktwertMin: number
  marktwertMax: number

  // Ertragswert Details
  ertragswert: number
  jahresrohertrag: number
  bewirtschaftungskosten: number
  reinertrag: number
  bodenwert: number
  bodenwertverzinsung: number
  gebaeudertrag: number
  vervielfaeltiger: number
  liegenschaftszins: number
  restnutzungsdauer: number

  // Sachwert Details
  sachwert: number
  nhkBasiswert: number
  alterswertminderung: number
  gebaeudesachwert: number
  sachwertfaktor: number

  // Kennzahlen
  faktor: number
  bruttoRendite: number
  nettoRendite: number
  mietmultiplikator: number
  qmPreis: number

  // Potenzial
  istMiete: number
  marktMiete: number
  potenzial: number

  // Finanzierung
  kaufpreis: number
  eigenkapital: number
  fremdkapital: number
  zinssatz: number
  tilgung: number
  monatsrate: number
  cashflowMonat: number
  cashflowJahr: number
  eigenkapitalrendite: number
  // KI-Korrekturen (optional)
  aiKorrekturen?: {
    zustandAnpassung: number
    warnungen: string[]
    extras: string[]
    originalMarktwert: number
    korrekturBetrag: number
  }
}
