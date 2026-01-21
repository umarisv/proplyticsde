import type { AnalyseFormData, AnalyseResultData } from "@/lib/types"

export function calculateValuation(formData: AnalyseFormData): AnalyseResultData {
  const wohnflaeche = Number.parseFloat(formData.wohnflaeche) || 850
  const grundstueck = Number.parseFloat(formData.grundstueck) || 1200
  const baujahr = Number.parseInt(formData.baujahr) || 1965
  const istMieteMonat = Number.parseFloat(formData.istMiete) || 12500
  const bodenrichtwert = Number.parseFloat(formData.bodenrichtwert) || 580
  const kaufpreis = Number.parseFloat(formData.kaufpreis) || 0
  const anzahlWohnungen = Number.parseInt(formData.anzahlWohnungen) || 1
  const stellplaetze = Number.parseInt(formData.stellplaetze) || 0

  // Zustandsfaktor
  const zustandFaktoren: Record<string, number> = {
    neubau: 1.0,
    gepflegt: 0.85,
    durchschnitt: 0.7,
    sanierung: 0.5,
  }
  const zustandFaktor = zustandFaktoren[formData.zustand] || 0.7

  // NEU: Ausstattungsfaktor
  const ausstattungFaktoren: Record<string, number> = {
    einfach: 0.85,
    mittel: 1.0,
    gehoben: 1.15,
    luxus: 1.3,
  }
  const ausstattungFaktor = ausstattungFaktoren[formData.ausstattung] || 1.0

  // NEU: Lagefaktor
  const lageFaktoren: Record<string, number> = {
    einfach: 0.9,
    mittel: 1.0,
    gut: 1.1,
    sehr_gut: 1.25,
  }
  const lageFaktor = lageFaktoren[formData.lage] || 1.0

  // NEU: Energieeffizienz-Faktor (Abschlag für schlechte Klassen)
  const energieFaktoren: Record<string, number> = {
    "A+": 1.05,
    "A": 1.03,
    "B": 1.0,
    "C": 0.98,
    "D": 0.95,
    "E": 0.92,
    "F": 0.88,
    "G": 0.83,
    "H": 0.78,
    "unbekannt": 0.95, // Konservativer Ansatz bei unbekannter Effizienz
  }
  const energieFaktor = energieFaktoren[formData.energieeffizienz] || 0.95

  // NEU: Stellplatzwert (ca. 15.000€ pro Stellplatz in Großstädten)
  const stellplatzWert = stellplaetze * 15000

  // Kombinierter Qualitätsfaktor
  const qualitaetsFaktor = zustandFaktor * ausstattungFaktor * lageFaktor * energieFaktor

  // Restnutzungsdauer (max 80 Jahre, min 20)
  const gebaeudealter = 2024 - baujahr
  const basisNutzungsdauer = 80
  let restnutzungsdauer = Math.max(20, basisNutzungsdauer - gebaeudealter)
  if (formData.zustand === "neubau") restnutzungsdauer = 80
  if (formData.zustand === "sanierung") restnutzungsdauer = Math.max(20, restnutzungsdauer - 10)

  // Liegenschaftszins nach Objekttyp (angepasst nach Lage)
  const lzSaetze: Record<string, number> = {
    mfh: 4.5,
    zfh: 3.5,
    efh: 2.5,
    etw: 3.0,
    wgh: 5.0,
  }
  // Bessere Lagen haben niedrigere Liegenschaftszinsen
  const lageZinsAnpassung = formData.lage === "sehr_gut" ? -0.5 : formData.lage === "gut" ? -0.25 : formData.lage === "einfach" ? 0.25 : 0
  const liegenschaftszins = ((lzSaetze[formData.objekttyp] || 4.5) + lageZinsAnpassung) / 100

  // ERTRAGSWERT
  const jahresrohertrag = istMieteMonat * 12
  const bewirtschaftungskosten = jahresrohertrag * 0.18 // 18% BWK
  const reinertrag = jahresrohertrag - bewirtschaftungskosten
  const bodenwert = grundstueck * bodenrichtwert
  const bodenwertverzinsung = bodenwert * liegenschaftszins
  const gebaeudertrag = reinertrag - bodenwertverzinsung

  // Vervielfältiger (Barwertfaktor)
  const vervielfaeltiger = (1 - Math.pow(1 + liegenschaftszins, -restnutzungsdauer)) / liegenschaftszins
  const ertragswertBasis = bodenwert + gebaeudertrag * vervielfaeltiger
  // Ertragswert mit Qualitätsfaktor anpassen
  const ertragswert = ertragswertBasis * (ausstattungFaktor * 0.3 + 0.7) // Ausstattung hat nur teilweisen Einfluss auf Ertragswert

  // SACHWERT (NHK 2010 simplified)
  const nhkBasis: Record<string, number> = {
    mfh: 1400,
    zfh: 1600,
    efh: 1800,
    etw: 1500,
    wgh: 1200,
  }
  const nhkProQm = (nhkBasis[formData.objekttyp] || 1400) * ausstattungFaktor
  const nhkBasiswert = wohnflaeche * nhkProQm

  // Alterswertminderung (linear, max 70%)
  const alterswertminderungProzent = Math.min(0.7, gebaeudealter / basisNutzungsdauer)
  const gebaeudesachwert = nhkBasiswert * (1 - alterswertminderungProzent) * zustandFaktor * energieFaktor

  // Sachwertfaktor (marktanpassung basierend auf Lage)
  const sachwertfaktor = 0.85 * lageFaktor
  const sachwert = (bodenwert + gebaeudesachwert + stellplatzWert) * sachwertfaktor

  // MARKTWERT (Gewichtung: 70% Ertrag, 30% Sachwert für MFH)
  const gewichtungErtrag = formData.objekttyp === "efh" || formData.objekttyp === "etw" ? 0.3 : 0.7
  const marktwertRoh = ertragswert * gewichtungErtrag + sachwert * (1 - gewichtungErtrag)
  const marktwert = Math.round(marktwertRoh / 1000) * 1000
  const marktwertMin = Math.round((marktwert * 0.9) / 1000) * 1000
  const marktwertMax = Math.round((marktwert * 1.1) / 1000) * 1000

  // Kennzahlen
  const effektiverKaufpreis = kaufpreis > 0 ? kaufpreis : marktwert
  const faktor = effektiverKaufpreis / jahresrohertrag
  const bruttoRendite = (jahresrohertrag / effektiverKaufpreis) * 100
  const nettoRendite = (reinertrag / effektiverKaufpreis) * 100
  const mietmultiplikator = effektiverKaufpreis / (istMieteMonat * 12)
  const qmPreis = effektiverKaufpreis / wohnflaeche

  // Marktmiete Schätzung (angepasst nach Lage und Ausstattung)
  const basisMieteProQm: Record<string, number> = {
    einfach: 10,
    mittel: 12,
    gut: 14,
    sehr_gut: 17,
  }
  const marktMieteProQm = (basisMieteProQm[formData.lage] || 12) * (ausstattungFaktor * 0.5 + 0.5)
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
