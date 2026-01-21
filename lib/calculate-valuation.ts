import type { AnalyseFormData, AnalyseResultData } from "@/lib/types"

export function calculateValuation(formData: AnalyseFormData): AnalyseResultData {
  const wohnflaeche = Number.parseFloat(formData.wohnflaeche) || 850
  const grundstueck = Number.parseFloat(formData.grundstueck) || 1200
  const baujahr = Number.parseInt(formData.baujahr) || 1965
  const istMieteMonat = Number.parseFloat(formData.istMiete) || 12500
  const bodenrichtwert = Number.parseFloat(formData.bodenrichtwert) || 580
  const kaufpreis = Number.parseFloat(formData.kaufpreis) || 0

  // Zustandsfaktor
  const zustandFaktoren: Record<string, number> = {
    neubau: 1.0,
    gepflegt: 0.85,
    durchschnitt: 0.7,
    sanierung: 0.5,
  }
  const zustandFaktor = zustandFaktoren[formData.zustand] || 0.7

  // Restnutzungsdauer (max 80 Jahre, min 20)
  const gebaeudealter = 2024 - baujahr
  const basisNutzungsdauer = 80
  let restnutzungsdauer = Math.max(20, basisNutzungsdauer - gebaeudealter)
  if (formData.zustand === "neubau") restnutzungsdauer = 80
  if (formData.zustand === "sanierung") restnutzungsdauer = Math.max(20, restnutzungsdauer - 10)

  // Liegenschaftszins nach Objekttyp
  const lzSaetze: Record<string, number> = {
    mfh: 4.5,
    zfh: 3.5,
    efh: 2.5,
    etw: 3.0,
    wgh: 5.0,
  }
  const liegenschaftszins = (lzSaetze[formData.objekttyp] || 4.5) / 100

  // ERTRAGSWERT
  const jahresrohertrag = istMieteMonat * 12
  const bewirtschaftungskosten = jahresrohertrag * 0.18 // 18% BWK
  const reinertrag = jahresrohertrag - bewirtschaftungskosten
  const bodenwert = grundstueck * bodenrichtwert
  const bodenwertverzinsung = bodenwert * liegenschaftszins
  const gebaeudertrag = reinertrag - bodenwertverzinsung

  // Vervielfältiger (Barwertfaktor)
  const vervielfaeltiger = (1 - Math.pow(1 + liegenschaftszins, -restnutzungsdauer)) / liegenschaftszins
  const ertragswert = bodenwert + gebaeudertrag * vervielfaeltiger

  // SACHWERT (NHK 2010 simplified)
  const nhkBasis: Record<string, number> = {
    mfh: 1400,
    zfh: 1600,
    efh: 1800,
    etw: 1500,
    wgh: 1200,
  }
  const nhkProQm = nhkBasis[formData.objekttyp] || 1400
  const nhkBasiswert = wohnflaeche * nhkProQm

  // Alterswertminderung (linear, max 70%)
  const alterswertminderungProzent = Math.min(0.7, gebaeudealter / basisNutzungsdauer)
  const gebaeudesachwert = nhkBasiswert * (1 - alterswertminderungProzent) * zustandFaktor

  // Sachwertfaktor (marktanpassung)
  const sachwertfaktor = 0.85
  const sachwert = (bodenwert + gebaeudesachwert) * sachwertfaktor

  // MARKTWERT (Gewichtung: 70% Ertrag, 30% Sachwert für MFH)
  const gewichtungErtrag = formData.objekttyp === "efh" || formData.objekttyp === "etw" ? 0.3 : 0.7
  const marktwert = Math.round((ertragswert * gewichtungErtrag + sachwert * (1 - gewichtungErtrag)) / 1000) * 1000
  const marktwertMin = Math.round((marktwert * 0.9) / 1000) * 1000
  const marktwertMax = Math.round((marktwert * 1.1) / 1000) * 1000

  // Kennzahlen
  const effektiverKaufpreis = kaufpreis > 0 ? kaufpreis : marktwert
  const faktor = effektiverKaufpreis / jahresrohertrag
  const bruttoRendite = (jahresrohertrag / effektiverKaufpreis) * 100
  const nettoRendite = (reinertrag / effektiverKaufpreis) * 100
  const mietmultiplikator = effektiverKaufpreis / (istMieteMonat * 12)
  const qmPreis = effektiverKaufpreis / wohnflaeche

  // Marktmiete Schätzung (Düsseldorf ~14 €/m² MFH)
  const marktMieteProQm = 14
  const marktMiete = wohnflaeche * marktMieteProQm * 12
  const potenzial = ((marktMiete - jahresrohertrag) / jahresrohertrag) * 100

  // FINANZIERUNG (Kaufpreis = Marktwert wenn nicht angegeben)
  const finanzierungsBetrag = effektiverKaufpreis
  const eigenkapital = finanzierungsBetrag * 0.2
  const fremdkapital = finanzierungsBetrag * 0.8
  const zinssatz = 3.85
  const tilgung = 2.0
  const jahresAnnuitaet = fremdkapital * ((zinssatz + tilgung) / 100)
  const monatsrate = jahresAnnuitaet / 12
  const nettoMieteMonat = reinertrag / 12
  const cashflowMonat = nettoMieteMonat - monatsrate
  const cashflowJahr = cashflowMonat * 12
  const eigenkapitalrendite = (cashflowJahr / eigenkapital) * 100

  return {
    marktwert,
    marktwertMin,
    marktwertMax,
    ertragswert: Math.round(ertragswert),
    jahresrohertrag,
    bewirtschaftungskosten,
    reinertrag,
    bodenwert,
    bodenwertverzinsung,
    gebaeudertrag,
    vervielfaeltiger,
    liegenschaftszins: liegenschaftszins * 100,
    restnutzungsdauer,
    sachwert: Math.round(sachwert),
    nhkBasiswert,
    alterswertminderung: alterswertminderungProzent * 100,
    gebaeudesachwert: Math.round(gebaeudesachwert),
    sachwertfaktor,
    faktor,
    bruttoRendite,
    nettoRendite,
    mietmultiplikator,
    qmPreis,
    istMiete: jahresrohertrag,
    marktMiete,
    potenzial,
    kaufpreis: effektiverKaufpreis,
    eigenkapital,
    fremdkapital,
    zinssatz,
    tilgung,
    monatsrate,
    cashflowMonat,
    cashflowJahr,
    eigenkapitalrendite,
  }
}
