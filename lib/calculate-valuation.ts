import type { AnalyseFormData, AnalyseResultData, AIAnalysisResult } from "@/lib/types"
import { calculateInvestmentScore } from "@/lib/investment-scoring"

export function calculateValuation(formData: AnalyseFormData): AnalyseResultData {
  const wohnflaeche = Number.parseFloat(formData.wohnflaeche) || 850
  const grundstueck = Number.parseFloat(formData.grundstueck) || 1200
  const baujahr = Number.parseInt(formData.baujahr) || 1965
  const istMieteMonat = Number.parseFloat(formData.istMiete) || 12500
  const bodenrichtwert = Number.parseFloat(formData.bodenrichtwert) || 580
  const kaufpreis = Number.parseFloat(formData.kaufpreis) || 0
  const anzahlWohnungen = Number.parseInt(formData.anzahlWohnungen) || 1
  const stellplaetze = Number.parseInt(formData.stellplaetze) || 0
  
  // ETW-spezifische Werte
  const mea = Number.parseFloat(formData.mea) || (wohnflaeche / 120 * 1000) // Default: Schätzung aus Wohnfläche
  const etage = Number.parseInt(formData.etage) || 1
  const hausgeld = Number.parseFloat(formData.hausgeld) || (wohnflaeche * 3.5) // Default: 3.50€/m²
  
  // WGH-spezifische Werte
  const gewerbeflaeche = Number.parseFloat(formData.gewerbeflaeche) || 0
  const gewerbemiete = Number.parseFloat(formData.gewerbemiete) || 0
  
  // MFH-spezifische Werte
  const vermieteteEinheiten = Number.parseInt(formData.vermieteteEinheiten) || anzahlWohnungen

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

  // ETW: Etagen-Faktor (beeinflusst den Wert)
  let etagenFaktor = 1.0
  if (formData.objekttyp === "etw") {
    if (etage === 0) etagenFaktor = 0.95           // EG: -5%
    else if (etage === 1 || etage === 2) etagenFaktor = 1.0  // 1-2 OG: ±0%
    else if (etage >= 3 && etage < 10) etagenFaktor = 1.03   // 3+ OG: +3%
    else if (etage >= 10) etagenFaktor = 1.10      // Penthouse/Hochhaus: +10%
    else if (etage < 0) etagenFaktor = 0.85        // Souterrain: -15%
  }
  
  // Kombinierter Qualitätsfaktor
  const qualitaetsFaktor = zustandFaktor * ausstattungFaktor * lageFaktor * energieFaktor * etagenFaktor

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
  // Bei WGH: Wohn- und Gewerbemiete zusammenrechnen
  let jahresrohertrag = istMieteMonat * 12
  if (formData.objekttyp === "wgh" && gewerbemiete > 0) {
    jahresrohertrag = (istMieteMonat + gewerbemiete) * 12
  }
  
  // Leerstandsberücksichtigung für MFH/WGH
  let leerstandsFaktor = 1.0
  if ((formData.objekttyp === "mfh" || formData.objekttyp === "wgh") && anzahlWohnungen > 0) {
    leerstandsFaktor = vermieteteEinheiten / anzahlWohnungen
  }
  const effektiverJahresrohertrag = jahresrohertrag * leerstandsFaktor
  
  // BWK variieren nach Objekttyp
  let bwkSatz = 0.18 // Standard 18%
  if (formData.objekttyp === "etw") {
    // Bei ETW: Hausgeld als Teil der BWK berücksichtigen
    const hausgeldJahr = hausgeld * 12
    bwkSatz = Math.min(0.25, (effektiverJahresrohertrag * 0.10 + hausgeldJahr) / effektiverJahresrohertrag)
  } else if (formData.objekttyp === "wgh") {
    bwkSatz = 0.15 // WGH haben oft niedrigere BWK wegen Gewerbe
  }
  
  const bewirtschaftungskosten = effektiverJahresrohertrag * bwkSatz
  const reinertrag = effektiverJahresrohertrag - bewirtschaftungskosten
  
  // Bodenwert: Bei ETW aus MEA berechnen
  let bodenwert: number
  if (formData.objekttyp === "etw") {
    // MEA in ‰ (Promille) - anteiliger Bodenwert
    // Annahme: Gesamtgrundstück ca. 500m² für typisches MFH
    const geschaetztesGesamtgrundstueck = 500
    bodenwert = (mea / 1000) * geschaetztesGesamtgrundstueck * bodenrichtwert
  } else {
    bodenwert = grundstueck * bodenrichtwert
  }
  
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

  // Investment-Scoring berechnen
  const investmentScore = calculateInvestmentScore({
    kaufpreis: effektiverKaufpreis,
    wohnflaeche,
    mieteinnahmenMonat: istMieteMonat,
    baujahr,
    objekttyp: formData.objekttyp,
    zustand: formData.zustand,
    plz: formData.plz,
    stadt: formData.stadt,
    eigenkapital,
    zinssatz,
    tilgung,
    wohneinheiten: anzahlWohnungen,
  })

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
    investmentScore,
  }
}

/**
 * Wendet KI-Erkenntnisse als Korrekturfaktoren auf die Bewertung an
 */
export function applyAICorrections(
  baseResult: AnalyseResultData,
  aiAnalyses: AIAnalysisResult[]
): AnalyseResultData {
  if (!aiAnalyses || aiAnalyses.length === 0) {
    return baseResult
  }

  const originalMarktwert = baseResult.marktwert

  // Durchschnittlichen Zustand aus allen Analysen berechnen
  const zustandScores = aiAnalyses.filter(a => a.zustandScore > 0).map(a => a.zustandScore)
  const avgZustand = zustandScores.length > 0
    ? zustandScores.reduce((sum, s) => sum + s, 0) / zustandScores.length
    : 5

  // Alle erkannten Extras sammeln
  const allExtras = [...new Set(aiAnalyses.flatMap(a => a.erkannteExtras || []))]
  
  // Alle Warnungen sammeln
  const allWarnungen = [...new Set(aiAnalyses.flatMap(a => a.warnungen || []))]

  // Kritische Warnungen identifizieren (führen zu Abschlägen)
  const kritischeWarnungen = allWarnungen.filter(w => 
    w.toLowerCase().includes('schimmel') ||
    w.toLowerCase().includes('riss') ||
    w.toLowerCase().includes('feucht') ||
    w.toLowerCase().includes('asbest') ||
    w.toLowerCase().includes('sanierung')
  )

  // Wertvolle Extras identifizieren (führen zu Zuschlägen)
  const wertvolleExtras = allExtras.filter(e =>
    e.toLowerCase().includes('parkett') ||
    e.toLowerCase().includes('fussbodenheizung') ||
    e.toLowerCase().includes('kamin') ||
    e.toLowerCase().includes('einbaukueche') ||
    e.toLowerCase().includes('klimaanlage') ||
    e.toLowerCase().includes('smart')
  )

  // Zustandskorrektur: KI-Zustand vs. angenommener Mittelwert (5)
  // Abweichung von 1 Punkt = ca. 2% Wertänderung
  const zustandDifferenz = avgZustand - 5
  const zustandKorrektur = zustandDifferenz * 0.02

  // Warnungs-Abschlag: 2% pro kritische Warnung, max 10%
  const warnungAbschlag = Math.min(0.10, kritischeWarnungen.length * 0.02)

  // Extras-Zuschlag: 3.000€ pro wertvolles Extra, max 15.000€
  const extraBonus = Math.min(15000, wertvolleExtras.length * 3000)

  // Gesamtkorrektur berechnen
  const korrekturFaktor = 1 + zustandKorrektur - warnungAbschlag
  const korrigierterMarktwert = Math.round((baseResult.marktwert * korrekturFaktor + extraBonus) / 1000) * 1000
  const korrekturBetrag = korrigierterMarktwert - originalMarktwert

  // Neue Min/Max basierend auf korrigiertem Marktwert
  const korrigierterMin = Math.round((korrigierterMarktwert * 0.9) / 1000) * 1000
  const korrigierterMax = Math.round((korrigierterMarktwert * 1.1) / 1000) * 1000

  // Kennzahlen neu berechnen
  const effektiverKaufpreis = baseResult.kaufpreis > 0 ? baseResult.kaufpreis : korrigierterMarktwert
  const neuerQmPreis = effektiverKaufpreis / (effektiverKaufpreis / baseResult.qmPreis)
  const neuerFaktor = effektiverKaufpreis / baseResult.jahresrohertrag
  const neueBruttoRendite = (baseResult.jahresrohertrag / effektiverKaufpreis) * 100
  const neueNettoRendite = (baseResult.reinertrag / effektiverKaufpreis) * 100

  return {
    ...baseResult,
    marktwert: korrigierterMarktwert,
    marktwertMin: korrigierterMin,
    marktwertMax: korrigierterMax,
    qmPreis: neuerQmPreis,
    faktor: neuerFaktor,
    bruttoRendite: neueBruttoRendite,
    nettoRendite: neueNettoRendite,
    aiKorrekturen: {
      zustandAnpassung: avgZustand,
      warnungen: allWarnungen,
      extras: allExtras,
      originalMarktwert,
      korrekturBetrag,
    },
  }
}
