"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, ExternalLink, Loader2, CheckCircle2, ArrowRight } from "lucide-react"
import { ProplyticsLogo } from "@/components/proplytics-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { analyzeImageWithAI, fileToBase64 } from "@/lib/api/file-upload"
import { saveBewertung } from "@/lib/api/bewertungen"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import type { AnalyseFormData, UploadedFile } from "@/lib/types"

type MessageType = "bot" | "user"
type StepType = "plz" | "objekttyp" | "flaechen" | "baujahr" | "ausstattung" | "lage" | "energie" | "details" | "upload" | "miete" | "bodenrichtwert" | "kaufpreis" | "complete"

const STEP_ORDER: StepType[] = ["plz", "objekttyp", "flaechen", "baujahr", "ausstattung", "lage", "energie", "details", "upload", "miete", "bodenrichtwert", "kaufpreis", "complete"]

interface Message {
  id: number
  type: MessageType
  content: string
  options?: { label: string; value: string; description?: string }[]
  inputType?: "text" | "number" | "form" | "upload"
  formFields?: { label: string; key: string; placeholder: string; suffix?: string; type?: "text" | "checkbox" }[]
  showExtras?: boolean
  isComplete?: boolean
}

interface ChatWizardProps {
  onDataChange: (data: Partial<AnalyseFormData>) => void
  onCalculate: (data: AnalyseFormData) => void
  initialQuery?: string
  initialData?: Record<string, string>
}

const objektTypen = [
  { label: "MFH", value: "mfh", description: "Mehrfamilienhaus" },
  { label: "ZFH", value: "zfh", description: "Zweifamilienhaus" },
  { label: "EFH", value: "efh", description: "Einfamilienhaus" },
  { label: "ETW", value: "etw", description: "Eigentumswohnung" },
  { label: "WGH", value: "wgh", description: "Wohn-/Geschaeftshaus" },
]

const zustandOptionen = [
  { label: "Neubau/Kernsaniert", value: "neubau" },
  { label: "Gepflegt", value: "gepflegt" },
  { label: "Durchschnittlich", value: "durchschnitt" },
  { label: "Sanierungsbedarf", value: "sanierung" },
]

const ausstattungOptionen = [
  { label: "Einfach", value: "einfach", description: "Standardausstattung" },
  { label: "Mittel", value: "mittel", description: "Gehobene Standardausstattung" },
  { label: "Gehoben", value: "gehoben", description: "Hochwertige Ausstattung" },
  { label: "Luxus", value: "luxus", description: "Exklusive Ausstattung" },
]

const lageOptionen = [
  { label: "Einfach", value: "einfach", description: "Randlage, wenig Infrastruktur" },
  { label: "Mittel", value: "mittel", description: "Durchschnittliche Wohnlage" },
  { label: "Gut", value: "gut", description: "Gute Wohnlage" },
  { label: "Sehr gut", value: "sehr_gut", description: "Beste Wohnlage" },
]

const energieOptionen = [
  { label: "A+", value: "A+" }, { label: "A", value: "A" }, { label: "B", value: "B" },
  { label: "C", value: "C" }, { label: "D", value: "D" }, { label: "E", value: "E" },
  { label: "F", value: "F" }, { label: "G", value: "G" }, { label: "H", value: "H" },
  { label: "Unbekannt", value: "unbekannt" },
]

// --- Determine which step is the first one that's NOT covered by initialData ---
function findFirstMissingStep(data: Record<string, string>): StepType {
  if (!data.plz && !data.stadt) return "plz"
  if (!data.objekttyp) return "objekttyp"
  if (!data.wohnflaeche) return "flaechen"
  if (!data.baujahr) return "baujahr"
  // ausstattung, lage, energie are subjective - always ask if not provided
  // But we can skip to miete if we have baujahr + zustand
  // Let's skip the "nice to have" qualitative steps if we have the core quantitative data
  if (!data.mieteinnahmen) return "miete"
  if (!data.kaufpreis) return "kaufpreis"
  return "kaufpreis" // All data present, go to final step
}

function mapInitialToFormData(data: Record<string, string>): Partial<AnalyseFormData> {
  const m: Partial<AnalyseFormData> = {}
  if (data.plz) m.plz = data.plz
  if (data.stadt) m.stadt = data.stadt
  if (data.objekttyp) m.objekttyp = data.objekttyp
  if (data.wohnflaeche) m.wohnflaeche = data.wohnflaeche
  if (data.grundstueck) m.grundstueck = data.grundstueck
  if (data.baujahr) m.baujahr = data.baujahr
  if (data.kaufpreis) m.kaufpreis = data.kaufpreis
  if (data.mieteinnahmen) m.istMiete = data.mieteinnahmen
  if (data.wohneinheiten) m.anzahlWohnungen = data.wohneinheiten
  if (data.zustand) m.zustand = data.zustand
  return m
}

function buildSummaryLines(data: Record<string, string>): string[] {
  const lines: string[] = []
  const typLabel = objektTypen.find(o => o.value === data.objekttyp)?.description || data.objekttyp
  if (data.objekttyp) lines.push(typLabel)
  if (data.stadt) lines.push(data.plz ? `${data.plz} ${data.stadt}` : data.stadt)
  if (data.wohnflaeche) lines.push(`${data.wohnflaeche} m2 Wohnflaeche`)
  if (data.grundstueck) lines.push(`${data.grundstueck} m2 Grundstueck`)
  if (data.baujahr) lines.push(`Baujahr ${data.baujahr}`)
  if (data.wohneinheiten) lines.push(`${data.wohneinheiten} Wohneinheiten`)
  if (data.kaufpreis) lines.push(`Kaufpreis ${Number(data.kaufpreis).toLocaleString("de-DE")} EUR`)
  if (data.mieteinnahmen) lines.push(`Miete ${Number(data.mieteinnahmen).toLocaleString("de-DE")} EUR/Monat`)
  if (data.zustand) lines.push(`Zustand: ${data.zustand}`)
  return lines
}

export function ChatWizard({ onDataChange, onCalculate, initialQuery, initialData }: ChatWizardProps) {
  const { user } = useAuth()
  const hasPrefilledData = !!initialData && Object.keys(initialData).length > 0

  const [messages, setMessages] = useState<Message[]>([])
  const [currentStep, setCurrentStep] = useState<StepType>("plz")
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AnalyseFormData>(() => {
    const base: AnalyseFormData = {
      plz: "", stadt: "", objekttyp: "", wohnflaeche: "", grundstueck: "",
      baujahr: "", zustand: "", ausstattung: "mittel", lage: "mittel",
      energieeffizienz: "unbekannt", anzahlWohnungen: "", stellplaetze: "",
      keller: false, balkon: false, aufzug: false, istMiete: "", bodenrichtwert: "",
      kaufpreis: "", mea: "", etage: "", hausgeld: "", gewerbeflaeche: "",
      gewerbemiete: "", vermieteteEinheiten: "", uploadedFiles: [],
    }
    if (initialData) {
      const mapped = mapInitialToFormData(initialData)
      return { ...base, ...mapped }
    }
    return base
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initRef = useRef(false)

  const progress = Math.round((STEP_ORDER.indexOf(currentStep) / (STEP_ORDER.length - 1)) * 100)

  const addBotMessage = useCallback((message: Omit<Message, "id" | "type">, delay = 600) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [...prev, { ...message, id: Date.now(), type: "bot" }])
    }, delay)
  }, [])

  const addUserMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, { id: Date.now(), type: "user", content }])
  }, [])

  // --- Produce the prompt for a given step ---
  const promptForStep = useCallback((step: StepType) => {
    switch (step) {
      case "plz":
        addBotMessage({
          content: "Wo befindet sich die Immobilie?",
          inputType: "form",
          formFields: [
            { label: "PLZ", key: "plz", placeholder: "z.B. 40239" },
            { label: "Stadt", key: "stadt", placeholder: "z.B. Duesseldorf" },
          ],
        }, 300)
        break
      case "objekttyp":
        addBotMessage({ content: "Um welchen Objekttyp handelt es sich?", options: objektTypen }, 300)
        break
      case "flaechen": {
        const typ = formData.objekttyp || initialData?.objekttyp || ""
        let fields: { label: string; key: string; placeholder: string; suffix?: string }[] = []
        if (typ === "etw") {
          fields = [
            { label: "Wohnflaeche", key: "wohnflaeche", placeholder: "z.B. 85", suffix: "m2" },
            { label: "Miteigentumsanteil", key: "mea", placeholder: "z.B. 125", suffix: "Promille" },
            { label: "Etage", key: "etage", placeholder: "z.B. 3 (EG=0)" },
          ]
        } else if (typ === "wgh") {
          fields = [
            { label: "Wohnflaeche", key: "wohnflaeche", placeholder: "z.B. 600", suffix: "m2" },
            { label: "Gewerbeflaeche", key: "gewerbeflaeche", placeholder: "z.B. 200", suffix: "m2" },
            { label: "Grundstueck", key: "grundstueck", placeholder: "z.B. 800", suffix: "m2" },
          ]
        } else {
          fields = [
            { label: "Wohnflaeche", key: "wohnflaeche", placeholder: "z.B. 850", suffix: "m2" },
            { label: "Grundstueck", key: "grundstueck", placeholder: "z.B. 1200", suffix: "m2" },
          ]
        }
        addBotMessage({ content: "Wie gross ist das Objekt?", inputType: "form", formFields: fields }, 300)
        break
      }
      case "baujahr":
        addBotMessage({
          content: "Wann wurde das Gebaeude errichtet?",
          inputType: "form",
          formFields: [{ label: "Baujahr", key: "baujahr", placeholder: "z.B. 1965" }],
        }, 300)
        break
      case "miete": {
        const typ = formData.objekttyp || ""
        const content = typ === "etw" ? "Was ist die monatliche Kaltmiete der Wohnung? Falls selbstgenutzt, geben Sie 0 ein."
          : typ === "mfh" ? "Wie hoch ist die gesamte monatliche Kaltmiete aller Einheiten zusammen?"
          : typ === "wgh" ? "Wie hoch ist die monatliche Wohnmiete (Kaltmiete)?"
          : "Wie hoch ist die aktuelle monatliche Kaltmiete (Ist-Miete)?"
        addBotMessage({ content, inputType: "number" }, 300)
        break
      }
      case "bodenrichtwert":
        addBotMessage({
          content: "Bitte geben Sie den Bodenrichtwert ein - diesen finden Sie im BORIS-Portal Ihres Bundeslandes.",
          inputType: "number",
        }, 300)
        break
      case "kaufpreis":
        addBotMessage({
          content: "Gibt es einen konkreten Kaufpreis? Das ermoeglicht die Renditeberechnung. Geben Sie 0 ein, falls Sie nur die Bewertung moechten.",
          inputType: "number",
        }, 300)
        break
      default:
        break
    }
  }, [addBotMessage, formData.objekttyp, initialData?.objekttyp])

  // --- INITIAL: show summary of pre-parsed data, then jump to first missing step ---
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    if (hasPrefilledData && initialData) {
      // Notify parent about pre-filled data
      onDataChange(mapInitialToFormData(initialData))

      // Build human-readable summary
      const lines = buildSummaryLines(initialData)
      const summaryText = lines.join(" | ")

      // Show the user's original query
      if (initialQuery) {
        setMessages([{ id: 1, type: "user", content: initialQuery }])
      }

      // Bot shows what it understood
      const firstMissing = findFirstMissingStep(initialData)
      setCurrentStep(firstMissing)

      addBotMessage({
        content: `Ich habe folgende Eckdaten erkannt:\n\n${lines.map(l => "- " + l).join("\n")}\n\nIch ueberspringe die bereits bekannten Angaben und frage nur noch was fehlt.`,
      }, 500)

      // After the summary, prompt for the first missing step
      setTimeout(() => {
        promptForStep(firstMissing)
      }, 1400)
    } else {
      // No pre-filled data - normal flow
      addBotMessage({
        content: "Hallo! Ich bin Ihr Proplytics-Assistent und erstelle fuer Sie eine professionelle Marktpreiseinschaetzung nach ImmoWertV 2024. Wo befindet sich die Immobilie?",
        inputType: "form",
        formFields: [
          { label: "PLZ", key: "plz", placeholder: "z.B. 40239" },
          { label: "Stadt", key: "stadt", placeholder: "z.B. Duesseldorf" },
        ],
      }, 300)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleOptionSelect = (value: string, label: string) => {
    addUserMessage(label)

    switch (currentStep) {
      case "objekttyp": {
        const newData = { ...formData, objekttyp: value }
        setFormData(newData)
        onDataChange({ objekttyp: value })

        let flaechenFields: { label: string; key: string; placeholder: string; suffix?: string }[] = []
        const typLabel = objektTypen.find(o => o.value === value)?.description || label

        if (value === "etw") {
          flaechenFields = [
            { label: "Wohnflaeche", key: "wohnflaeche", placeholder: "z.B. 85", suffix: "m2" },
            { label: "Miteigentumsanteil", key: "mea", placeholder: "z.B. 125", suffix: "Promille" },
            { label: "Etage", key: "etage", placeholder: "z.B. 3 (EG=0)" },
          ]
        } else if (value === "wgh") {
          flaechenFields = [
            { label: "Wohnflaeche", key: "wohnflaeche", placeholder: "z.B. 600", suffix: "m2" },
            { label: "Gewerbeflaeche", key: "gewerbeflaeche", placeholder: "z.B. 200", suffix: "m2" },
            { label: "Grundstueck", key: "grundstueck", placeholder: "z.B. 800", suffix: "m2" },
          ]
        } else {
          flaechenFields = [
            { label: "Wohnflaeche", key: "wohnflaeche", placeholder: "z.B. 850", suffix: "m2" },
            { label: "Grundstueck", key: "grundstueck", placeholder: "z.B. 1200", suffix: "m2" },
          ]
        }

        addBotMessage({
          content: `${typLabel} - gute Wahl. Wie gross ist das Objekt?`,
          inputType: "form",
          formFields: flaechenFields,
        })
        setCurrentStep("flaechen")
        break
      }

      case "baujahr": {
        setFormData(prev => ({ ...prev, zustand: value }))
        onDataChange({ zustand: value })
        addBotMessage({
          content: "Verstanden. Wie wuerden Sie die Ausstattungsqualitaet beschreiben?",
          options: ausstattungOptionen,
        })
        setCurrentStep("ausstattung")
        break
      }

      case "ausstattung": {
        setFormData(prev => ({ ...prev, ausstattung: value as AnalyseFormData['ausstattung'] }))
        onDataChange({ ausstattung: value as AnalyseFormData['ausstattung'] })
        addBotMessage({
          content: "Und wie schaetzen Sie die Lagequalitaet des Standorts ein?",
          options: lageOptionen,
        })
        setCurrentStep("lage")
        break
      }

      case "lage": {
        setFormData(prev => ({ ...prev, lage: value as AnalyseFormData['lage'] }))
        onDataChange({ lage: value as AnalyseFormData['lage'] })
        addBotMessage({
          content: "Fast geschafft! Welche Energieeffizienzklasse hat das Gebaeude?",
          options: energieOptionen,
        })
        setCurrentStep("energie")
        break
      }

      case "energie": {
        setFormData(prev => ({ ...prev, energieeffizienz: value }))
        onDataChange({ energieeffizienz: value })

        let detailsFields: { label: string; key: string; placeholder: string; suffix?: string }[] = []

        if (formData.objekttyp === "etw") {
          detailsFields = [
            { label: "Hausgeld", key: "hausgeld", placeholder: "z.B. 350", suffix: "EUR/Monat" },
            { label: "Stellplaetze", key: "stellplaetze", placeholder: "z.B. 1" },
          ]
        } else if (formData.objekttyp === "efh") {
          detailsFields = [
            { label: "Stellplaetze/Garage", key: "stellplaetze", placeholder: "z.B. 2" },
          ]
        } else if (formData.objekttyp === "zfh") {
          detailsFields = [
            { label: "Vermietete Einheiten", key: "vermieteteEinheiten", placeholder: "0, 1 oder 2" },
            { label: "Stellplaetze", key: "stellplaetze", placeholder: "z.B. 2" },
          ]
        } else if (formData.objekttyp === "mfh") {
          detailsFields = [
            { label: "Anzahl Wohnungen", key: "anzahlWohnungen", placeholder: "z.B. 6" },
            { label: "Davon vermietet", key: "vermieteteEinheiten", placeholder: "z.B. 5" },
            { label: "Stellplaetze", key: "stellplaetze", placeholder: "z.B. 4" },
          ]
        } else if (formData.objekttyp === "wgh") {
          detailsFields = [
            { label: "Wohnungen", key: "anzahlWohnungen", placeholder: "z.B. 4" },
            { label: "Davon vermietet", key: "vermieteteEinheiten", placeholder: "z.B. 4" },
            { label: "Stellplaetze", key: "stellplaetze", placeholder: "z.B. 3" },
          ]
        } else {
          detailsFields = [
            { label: "Wohnungen", key: "anzahlWohnungen", placeholder: "z.B. 6" },
            { label: "Stellplaetze", key: "stellplaetze", placeholder: "z.B. 4" },
          ]
        }

        addBotMessage({
          content: "Noch ein paar Details zum Objekt:",
          inputType: "form",
          formFields: detailsFields,
          showExtras: true,
        })
        setCurrentStep("details")
        break
      }
    }
  }

  const handleInputSubmit = () => {
    if (!inputValue.trim()) return
    const val = inputValue.trim()
    addUserMessage(val + (currentStep === "miete" ? " EUR" : currentStep === "bodenrichtwert" ? " EUR/m2" : ""))

    switch (currentStep) {
      case "miete": {
        if (formData.objekttyp === "wgh" && !formData.gewerbemiete && val) {
          setFormData(prev => ({ ...prev, istMiete: val }))
          onDataChange({ istMiete: val })
          addBotMessage({ content: "Und wie hoch ist die monatliche Gewerbemiete (Kaltmiete)?", inputType: "number" })
        } else if (formData.objekttyp === "wgh" && formData.istMiete && val) {
          setFormData(prev => ({ ...prev, gewerbemiete: val }))
          onDataChange({ gewerbemiete: val })
          addBotMessage({
            content: "Super! Jetzt noch der Bodenrichtwert (BORIS-Portal).",
            inputType: "number",
          })
          setCurrentStep("bodenrichtwert")
        } else {
          setFormData(prev => ({ ...prev, istMiete: val }))
          onDataChange({ istMiete: val })
          addBotMessage({
            content: "Gut notiert. Bitte geben Sie den Bodenrichtwert ein (BORIS-Portal).",
            inputType: "number",
          })
          setCurrentStep("bodenrichtwert")
        }
        break
      }

      case "bodenrichtwert": {
        setFormData(prev => ({ ...prev, bodenrichtwert: val }))
        onDataChange({ bodenrichtwert: val })

        // If we already have a kaufpreis from initialData, skip this step
        if (formData.kaufpreis && formData.kaufpreis !== "0") {
          const finalData = { ...formData, bodenrichtwert: val }
          setFormData(finalData)
          setCurrentStep("complete")
          onCalculate(finalData)
          handleAutoSave(finalData)
        } else {
          addBotMessage({
            content: "Letzte Frage: Gibt es einen konkreten Kaufpreis? Geben Sie 0 ein, falls Sie nur die Bewertung moechten.",
            inputType: "number",
          })
          setCurrentStep("kaufpreis")
        }
        break
      }

      case "kaufpreis": {
        const finalData = { ...formData, kaufpreis: val }
        setFormData(finalData)
        onDataChange({ kaufpreis: val })
        setCurrentStep("complete")
        onCalculate(finalData)
        handleAutoSave(finalData)
        break
      }
    }

    setInputValue("")
  }

  const handleAutoSave = (finalData: AnalyseFormData) => {
    if (user) {
      addBotMessage({
        content: "Alle Daten erfasst! Ihre Marktpreiseinschaetzung wird berechnet und gespeichert...",
      }, 300)
      setTimeout(async () => {
        try {
          const { calculateValuation } = await import("@/lib/calculate-valuation")
          const resultData = calculateValuation(finalData)
          const { data } = await saveBewertung({
            formData: finalData,
            resultData,
            adresse: `${finalData.plz} ${finalData.stadt}`,
            userId: user.id,
          })
          if (data) {
            setSavedId(data.id)
            setMessages(prev => [...prev, {
              id: Date.now(),
              type: "bot",
              content: "Gespeichert! Die Ergebnisse inkl. Investment-Score und Ampelbewertung finden Sie links. Sie koennen die Bewertung oben als PDF exportieren.",
              isComplete: true,
            }])
          }
        } catch {
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: "bot",
            content: "Berechnung fertig! Ergebnisse im linken Panel. Klicken Sie oben auf 'PDF Export' um die Bewertung herunterzuladen, oder auf 'Speichern' um sie zu sichern.",
            isComplete: true,
          }])
        }
      }, 2000)
    } else {
      addBotMessage({
        content: "Berechnung fertig! Die Ergebnisse mit Investment-Score finden Sie links. Klicken Sie oben auf 'PDF Export' fuer den Download. Fuer dauerhaftes Speichern melden Sie sich an.",
        isComplete: true,
      }, 1500)
    }
  }

  const handleUploadComplete = (files: UploadedFile[]) => {
    setFormData(prev => ({ ...prev, uploadedFiles: files }))
    onDataChange({ uploadedFiles: files })
    addUserMessage(files.length > 0 ? `${files.length} Datei(en) hochgeladen` : "Keine Dateien")
    goToMieteStep()
  }

  const handleSkipUpload = () => {
    addUserMessage("Uebersprungen")
    goToMieteStep()
  }

  const goToMieteStep = () => {
    // If miete already known from initialData, skip
    if (formData.istMiete && formData.istMiete !== "0") {
      addBotMessage({
        content: "Miete ist bereits bekannt. Bitte geben Sie den Bodenrichtwert ein (BORIS-Portal).",
        inputType: "number",
      }, 300)
      setCurrentStep("bodenrichtwert")
      return
    }
    let mieteContent = "Wie hoch ist die aktuelle monatliche Kaltmiete (Ist-Miete)?"
    if (formData.objekttyp === "etw") {
      mieteContent = "Was ist die monatliche Kaltmiete? Falls selbstgenutzt, geben Sie 0 ein."
    } else if (formData.objekttyp === "mfh") {
      mieteContent = "Wie hoch ist die gesamte monatliche Kaltmiete aller Einheiten zusammen?"
    } else if (formData.objekttyp === "wgh") {
      mieteContent = "Wie hoch ist die monatliche Wohnmiete (Kaltmiete)?"
    }
    addBotMessage({ content: mieteContent, inputType: "number" })
    setCurrentStep("miete")
  }

  const handleFormSubmit = (data: Record<string, string>) => {
    const summary = Object.entries(data)
      .filter(([, v]) => v)
      .map(([k, v]) => {
        const labels: Record<string, string> = {
          plz: "PLZ", stadt: "Stadt", wohnflaeche: "Wohnflaeche",
          grundstueck: "Grundstueck", baujahr: "Baujahr", mea: "MEA",
          etage: "Etage", gewerbeflaeche: "Gewerbeflaeche",
          anzahlWohnungen: "Wohnungen", stellplaetze: "Stellplaetze",
          hausgeld: "Hausgeld", vermieteteEinheiten: "Vermietet",
        }
        const suffix = k === "wohnflaeche" || k === "grundstueck" || k === "gewerbeflaeche" ? " m2" : ""
        return `${labels[k] || k}: ${v}${suffix}`
      })
      .join(", ")

    addUserMessage(summary)

    switch (currentStep) {
      case "plz": {
        setFormData(prev => ({ ...prev, plz: data.plz || "", stadt: data.stadt || "" }))
        onDataChange({ plz: data.plz, stadt: data.stadt })
        addBotMessage({
          content: `${data.plz} ${data.stadt} - alles klar! Um welchen Objekttyp handelt es sich?`,
          options: objektTypen,
        })
        setCurrentStep("objekttyp")
        break
      }

      case "flaechen": {
        setFormData(prev => ({
          ...prev,
          wohnflaeche: data.wohnflaeche || "", grundstueck: data.grundstueck || "",
          mea: data.mea || "", etage: data.etage || "", gewerbeflaeche: data.gewerbeflaeche || "",
        }))
        onDataChange({
          wohnflaeche: data.wohnflaeche, grundstueck: data.grundstueck,
          mea: data.mea, etage: data.etage, gewerbeflaeche: data.gewerbeflaeche,
        })
        addBotMessage({
          content: "Danke! Wann wurde das Gebaeude errichtet?",
          inputType: "form",
          formFields: [{ label: "Baujahr", key: "baujahr", placeholder: "z.B. 1965" }],
        })
        setCurrentStep("baujahr")
        break
      }

      case "baujahr": {
        setFormData(prev => ({ ...prev, baujahr: data.baujahr || "" }))
        onDataChange({ baujahr: data.baujahr })
        const bj = parseInt(data.baujahr)
        const age = bj ? new Date().getFullYear() - bj : 0
        const ageComment = age > 50 ? `Das Gebaeude ist ${age} Jahre alt - der Zustand ist hier besonders wichtig.` :
                           age > 20 ? `${age} Jahre - in welchem Zustand ist das Gebaeude?` :
                           `Baujahr ${data.baujahr}, relativ jung. Wie ist der aktuelle Zustand?`
        addBotMessage({ content: ageComment, options: zustandOptionen })
        break
      }

      case "details": {
        setFormData(prev => ({
          ...prev,
          anzahlWohnungen: data.anzahlWohnungen || "", stellplaetze: data.stellplaetze || "",
          keller: data.keller === "true", balkon: data.balkon === "true", aufzug: data.aufzug === "true",
          hausgeld: data.hausgeld || "", vermieteteEinheiten: data.vermieteteEinheiten || "",
        }))
        onDataChange({
          anzahlWohnungen: data.anzahlWohnungen, stellplaetze: data.stellplaetze,
          keller: data.keller === "true", balkon: data.balkon === "true",
          aufzug: data.aufzug === "true", hausgeld: data.hausgeld,
          vermieteteEinheiten: data.vermieteteEinheiten,
        })
        addBotMessage({
          content: "Optional: Laden Sie Fotos oder Dokumente hoch - die KI verbessert die Bewertungsgenauigkeit.",
          inputType: "upload",
        })
        setCurrentStep("upload")
        break
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Progress Bar */}
      <div className="px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground">Fortschritt</span>
          <span className="text-xs font-bold text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.type === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3",
                message.type === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border shadow-sm"
              )}
            >
              {/* Bot avatar */}
              {message.type === "bot" && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <ProplyticsLogo size="xs" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Proplytics</span>
                </div>
              )}

              {/* Content */}
              <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>

              {/* Option buttons */}
              {message.options && currentStep !== "complete" && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {message.options.map((opt) => (
                    <Button
                      key={opt.value}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleOptionSelect(opt.value, opt.label)}
                    >
                      <span>{opt.label}</span>
                      {opt.description && (
                        <span className="ml-1 text-muted-foreground">({opt.description})</span>
                      )}
                    </Button>
                  ))}
                </div>
              )}

              {/* Form fields */}
              {message.inputType === "form" && message.formFields && currentStep !== "complete" && (
                <FormInput fields={message.formFields} showExtras={message.showExtras} onSubmit={handleFormSubmit} />
              )}

              {/* Upload */}
              {message.inputType === "upload" && currentStep === "upload" && (
                <div className="mt-3 space-y-2">
                  <Button variant="outline" size="sm" onClick={handleSkipUpload} className="text-xs">
                    Uebersprungen - weiter
                  </Button>
                </div>
              )}

              {/* Complete state */}
              {message.isComplete && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline" className="text-xs">
                    <Link href="/portal">
                      Zum Portal <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                  {savedId && (
                    <Button asChild size="sm" className="text-xs">
                      <Link href={`/portal/bewertung/${savedId}`}>
                        Bewertung ansehen <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <ProplyticsLogo size="xs" />
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {currentStep !== "complete" && !messages.some(m => m.options || m.inputType === "form" || m.inputType === "upload") === false && (
        <div className="border-t border-border bg-card/50 p-4">
          {(currentStep === "miete" || currentStep === "bodenrichtwert" || currentStep === "kaufpreis") && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleInputSubmit()
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  currentStep === "miete" ? "Monatliche Kaltmiete in EUR" :
                  currentStep === "bodenrichtwert" ? "Bodenrichtwert in EUR/m2" :
                  "Kaufpreis in EUR"
                }
                type="number"
                className="flex-1"
                autoFocus
              />
              <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

// --- Inline form component for multi-field steps ---
function FormInput({
  fields,
  showExtras,
  onSubmit,
}: {
  fields: { label: string; key: string; placeholder: string; suffix?: string; type?: string }[]
  showExtras?: boolean
  onSubmit: (data: Record<string, string>) => void
}) {
  const [values, setValues] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="text-xs text-muted-foreground mb-1 block">{field.label}</label>
          <div className="flex items-center gap-2">
            <Input
              placeholder={field.placeholder}
              value={values[field.key] || ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              className="text-sm"
            />
            {field.suffix && <span className="text-xs text-muted-foreground whitespace-nowrap">{field.suffix}</span>}
          </div>
        </div>
      ))}

      {showExtras && (
        <div className="flex flex-wrap gap-3 pt-2">
          {[
            { key: "keller", label: "Keller" },
            { key: "balkon", label: "Balkon/Terrasse" },
            { key: "aufzug", label: "Aufzug" },
          ].map((cb) => (
            <label key={cb.key} className="flex items-center gap-1.5 text-xs cursor-pointer">
              <Checkbox
                checked={values[cb.key] === "true"}
                onCheckedChange={(checked) =>
                  setValues((prev) => ({ ...prev, [cb.key]: checked ? "true" : "false" }))
                }
              />
              {cb.label}
            </label>
          ))}
        </div>
      )}

      <Button type="submit" size="sm" className="w-full mt-2">
        Weiter <ArrowRight className="ml-1 h-3 w-3" />
      </Button>
    </form>
  )
}
