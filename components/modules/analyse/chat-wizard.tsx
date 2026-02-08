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

export function ChatWizard({ onDataChange, onCalculate, initialQuery }: ChatWizardProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentStep, setCurrentStep] = useState<StepType>("plz")
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AnalyseFormData>({
    plz: "", stadt: "", objekttyp: "", wohnflaeche: "", grundstueck: "",
    baujahr: "", zustand: "", ausstattung: "mittel", lage: "mittel",
    energieeffizienz: "unbekannt", anzahlWohnungen: "", stellplaetze: "",
    keller: false, balkon: false, aufzug: false, istMiete: "", bodenrichtwert: "",
    kaufpreis: "", mea: "", etage: "", hausgeld: "", gewerbeflaeche: "",
    gewerbemiete: "", vermieteteEinheiten: "", uploadedFiles: [],
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const progress = Math.round((STEP_ORDER.indexOf(currentStep) / (STEP_ORDER.length - 1)) * 100)

  // Simulated typing delay for natural feel
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

  // Initial greeting
  useEffect(() => {
    if (initialQuery) {
      setMessages([{ id: 1, type: "user", content: initialQuery }])
      addBotMessage({
        content: "Danke fuer die Beschreibung! Lassen Sie mich Ihnen helfen, eine praezise Marktpreiseinschaetzung zu erstellen. Wo befindet sich das Objekt?",
        inputType: "form",
        formFields: [
          { label: "PLZ", key: "plz", placeholder: "z.B. 40239" },
          { label: "Stadt", key: "stadt", placeholder: "z.B. Duesseldorf" },
        ],
      }, 800)
    } else {
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
          content: "Fast geschafft! Welche Energieeffizienzklasse hat das Gebaeude? Falls unbekannt, kein Problem.",
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
            content: "Super, Mietdaten erfasst! Jetzt noch der Bodenrichtwert. Sie finden diesen kostenlos im BORIS-Portal Ihres Bundeslandes.",
            inputType: "number",
          })
          setCurrentStep("bodenrichtwert")
        } else {
          setFormData(prev => ({ ...prev, istMiete: val }))
          onDataChange({ istMiete: val })
          addBotMessage({
            content: "Gut notiert. Bitte geben Sie den Bodenrichtwert ein - diesen finden Sie im BORIS-Portal Ihres Bundeslandes.",
            inputType: "number",
          })
          setCurrentStep("bodenrichtwert")
        }
        break
      }

      case "bodenrichtwert": {
        setFormData(prev => ({ ...prev, bodenrichtwert: val }))
        onDataChange({ bodenrichtwert: val })
        addBotMessage({
          content: "Letzte Frage: Gibt es einen konkreten Kaufpreis? Das ermoeglicht mir, die Rendite zu berechnen. Geben Sie 0 ein, falls Sie nur die Bewertung moechten.",
          inputType: "number",
        })
        setCurrentStep("kaufpreis")
        break
      }

      case "kaufpreis": {
        const finalData = { ...formData, kaufpreis: val }
        setFormData(finalData)
        onDataChange({ kaufpreis: val })
        setCurrentStep("complete")
        onCalculate(finalData)

        // Auto-save if user is logged in
        if (user) {
          addBotMessage({
            content: "Perfekt - alle Daten erfasst! Ihre Marktpreiseinschaetzung wird jetzt berechnet und automatisch gespeichert...",
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
                  content: "Die Bewertung wurde gespeichert! Sie finden die Ergebnisse links im Ergebnis-Panel und koennen diese jederzeit in Ihrem Portal abrufen.",
                  isComplete: true,
                }])
              }
            } catch {
              setMessages(prev => [...prev, {
                id: Date.now(),
                type: "bot",
                content: "Die Berechnung ist fertig! Schauen Sie sich die Ergebnisse im linken Panel an. Klicken Sie oben auf 'Speichern', um die Bewertung zu sichern.",
                isComplete: true,
              }])
            }
          }, 2000)
        } else {
          addBotMessage({
            content: "Die Berechnung ist fertig! Schauen Sie sich die Ergebnisse im linken Panel an. Melden Sie sich an, um die Bewertung dauerhaft zu speichern.",
            isComplete: true,
          }, 1500)
        }
        break
      }
    }

    setInputValue("")
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
    let mieteContent = "Wie hoch ist die aktuelle monatliche Kaltmiete (Ist-Miete)?"
    if (formData.objekttyp === "etw") {
      mieteContent = "Was ist die monatliche Kaltmiete der Wohnung? Falls selbstgenutzt, geben Sie 0 ein."
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
          content: "Optional: Laden Sie Fotos, Grundrisse oder Dokumente hoch - die KI analysiert diese und verbessert die Bewertungsgenauigkeit.",
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
          <div key={message.id} className={cn("flex gap-3", message.type === "user" ? "justify-end" : "justify-start")}>
            {message.type === "bot" && (
              <div className="flex-shrink-0">
                <ProplyticsLogo size="sm" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3",
                message.type === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border",
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>

              {/* Completion CTA */}
              {message.isComplete && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {savedId && (
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs" asChild>
                      <Link href="/portal">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        Zum Portal
                      </Link>
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" asChild>
                    <Link href={`/portal/bewertungen${savedId ? `/${savedId}` : ""}`}>
                      <ArrowRight className="h-3.5 w-3.5" />
                      Bewertung ansehen
                    </Link>
                  </Button>
                </div>
              )}

              {/* Option Buttons */}
              {message.options && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {message.options.map((option) => (
                    <Button
                      key={option.value}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent"
                      onClick={() => handleOptionSelect(option.value, option.label)}
                    >
                      {option.label}
                      {option.description && <span className="ml-1 text-muted-foreground">({option.description})</span>}
                    </Button>
                  ))}
                </div>
              )}

              {/* Form Fields */}
              {message.inputType === "form" && message.formFields && (
                <FormInputs
                  fields={message.formFields}
                  onSubmit={handleFormSubmit}
                  defaultValues={formData}
                  showExtras={message.showExtras}
                />
              )}

              {/* Upload UI */}
              {message.inputType === "upload" && currentStep === "upload" && (
                <UploadSection onComplete={handleUploadComplete} onSkip={handleSkipUpload} />
              )}
            </div>
            {message.type === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">Du</span>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <ProplyticsLogo size="sm" />
            </div>
            <div className="bg-card border border-border rounded-2xl px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area for number inputs */}
      {(currentStep === "miete" || currentStep === "bodenrichtwert" || currentStep === "kaufpreis") && (
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder={
                currentStep === "miete" ? "z.B. 12500"
                  : currentStep === "bodenrichtwert" ? "z.B. 580"
                  : "z.B. 3200000 (oder 0)"
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
              className="bg-input"
              autoFocus
            />
            <span className="flex items-center text-sm text-muted-foreground">
              {currentStep === "bodenrichtwert" ? "EUR/m2" : "EUR"}
            </span>
            <Button onClick={handleInputSubmit} size="icon" className="bg-primary hover:bg-primary/90">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function UploadSection({
  onComplete,
  onSkip,
}: {
  onComplete: (files: UploadedFile[]) => void
  onSkip: () => void
}) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(Array.from(e.dataTransfer.files))
  }

  const handleFiles = async (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = []
    for (const [index, file] of newFiles.entries()) {
      const category = detectCategory(file.name, file.type)
      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${index}`, name: file.name, type: file.type,
        size: file.size, category, url: URL.createObjectURL(file),
      }
      if (file.type.startsWith('image/')) {
        try {
          const base64 = await fileToBase64(file)
          const aiAnalysis = await analyzeImageWithAI(base64, category)
          if (aiAnalysis) uploadedFile.aiAnalysis = aiAnalysis
        } catch { /* continue without AI */ }
      }
      uploadedFiles.push(uploadedFile)
    }
    setFiles(prev => [...prev, ...uploadedFiles])
  }

  const detectCategory = (name: string, type: string): UploadedFile['category'] => {
    const n = name.toLowerCase()
    if (n.includes('grundriss') || n.includes('floor')) return 'grundriss'
    if (n.includes('energie') || n.includes('ausweis')) return 'energie'
    if (n.includes('expose') || type === 'application/pdf') return 'expose'
    if (n.includes('aussen') || n.includes('fassade')) return 'aussen'
    if (type.startsWith('image/')) return 'innen'
    return 'sonstiges'
  }

  return (
    <div className="mt-3 space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        )}
      >
        <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="hidden"
          onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))} />
        <div className="text-muted-foreground text-sm">
          <p className="font-medium">Dateien hier ablegen</p>
          <p className="text-xs mt-1">oder klicken zum Auswaehlen</p>
        </div>
      </div>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map(file => (
            <div key={file.id} className="flex items-center gap-2 bg-muted rounded-lg px-2 py-1 text-xs">
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))} className="text-muted-foreground hover:text-destructive">x</button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onSkip}>Ueberspringen</Button>
        <Button size="sm" className="flex-1" onClick={() => onComplete(files)}>
          {files.length > 0 ? "Weiter mit Analyse" : "Ohne Dateien fortfahren"}
        </Button>
      </div>
    </div>
  )
}

function FormInputs({
  fields, onSubmit, defaultValues, showExtras = false,
}: {
  fields: { label: string; key: string; placeholder: string; suffix?: string; type?: "text" | "checkbox" }[]
  onSubmit: (data: Record<string, string>) => void
  defaultValues: Record<string, string | boolean>
  showExtras?: boolean
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    fields.forEach((f) => {
      const val = defaultValues[f.key as keyof typeof defaultValues]
      initial[f.key] = typeof val === 'boolean' ? String(val) : (val as string) || ""
    })
    return initial
  })
  const [extras, setExtras] = useState({ keller: false, balkon: false, aufzug: false })

  const handleSubmit = () => {
    if (showExtras) {
      onSubmit({ ...values, keller: String(extras.keller), balkon: String(extras.balkon), aufzug: String(extras.aufzug) })
    } else {
      onSubmit(values)
    }
  }

  return (
    <div className="mt-3 space-y-2">
      {fields.map((field) => (
        <div key={field.key} className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground w-24 flex-shrink-0">{field.label}</label>
          <div className="flex-1 flex items-center gap-1">
            <Input type="text" placeholder={field.placeholder} value={values[field.key]}
              onChange={(e) => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="bg-input text-sm h-8" />
            {field.suffix && <span className="text-xs text-muted-foreground">{field.suffix}</span>}
          </div>
        </div>
      ))}
      {showExtras && (
        <div className="flex flex-wrap gap-4 pt-2">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <Checkbox checked={extras.keller} onCheckedChange={(c) => setExtras(p => ({ ...p, keller: !!c }))} /> Keller
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <Checkbox checked={extras.balkon} onCheckedChange={(c) => setExtras(p => ({ ...p, balkon: !!c }))} /> Balkon/Terrasse
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <Checkbox checked={extras.aufzug} onCheckedChange={(c) => setExtras(p => ({ ...p, aufzug: !!c }))} /> Aufzug
          </label>
        </div>
      )}
      <Button size="sm" className="w-full mt-2" onClick={handleSubmit}>Weiter</Button>
    </div>
  )
}
