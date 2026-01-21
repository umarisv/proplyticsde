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
  istMiete: string
  bodenrichtwert: string
  kaufpreis: string
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
}
