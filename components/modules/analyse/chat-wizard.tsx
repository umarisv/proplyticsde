"use client"

import { useState, useRef, useEffect } from "react"
import { Building2, Send, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { AnalyseFormData, UploadedFile } from "@/lib/types"

type MessageType = "bot" | "user"
type StepType = "plz" | "objekttyp" | "flaechen" | "baujahr" | "ausstattung" | "lage" | "energie" | "details" | "upload" | "miete" | "bodenrichtwert" | "kaufpreis" | "complete"

interface Message {
  id: number
  type: MessageType
  content: string
  options?: { label: string; value: string; description?: string }[]
  inputType?: "text" | "number" | "form" | "upload"
  formFields?: { label: string; key: string; placeholder: string; suffix?: string; type?: "text" | "checkbox" }[]
  showBorisLink?: boolean
  showExtras?: boolean
}

interface ChatWizardProps {
  onDataChange: (data: Partial<AnalyseFormData>) => void
  onCalculate: (data: AnalyseFormData) => void
}

const initialMessages: Message[] = [
  {
    id: 1,
    type: "bot",
    content:
      "Willkommen bei Proplytics! Ich erstelle eine professionelle Marktpreiseinschätzung nach ImmoWertV 2024. Bitte geben Sie die PLZ und Stadt des Objekts ein:",
    inputType: "form",
    formFields: [
      { label: "PLZ", key: "plz", placeholder: "z.B. 40239" },
      { label: "Stadt", key: "stadt", placeholder: "z.B. Düsseldorf" },
    ],
  },
]

const objektTypen = [
  { label: "MFH", value: "mfh", description: "Mehrfamilienhaus" },
  { label: "ZFH", value: "zfh", description: "Zweifamilienhaus" },
  { label: "EFH", value: "efh", description: "Einfamilienhaus" },
  { label: "ETW", value: "etw", description: "Eigentumswohnung" },
  { label: "WGH", value: "wgh", description: "Wohn-/Geschäftshaus" },
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
  { label: "A+", value: "A+" },
  { label: "A", value: "A" },
  { label: "B", value: "B" },
  { label: "C", value: "C" },
  { label: "D", value: "D" },
  { label: "E", value: "E" },
  { label: "F", value: "F" },
  { label: "G", value: "G" },
  { label: "H", value: "H" },
  { label: "Unbekannt", value: "unbekannt" },
]

export function ChatWizard({ onDataChange, onCalculate }: ChatWizardProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [currentStep, setCurrentStep] = useState<StepType>("plz")
  const [inputValue, setInputValue] = useState("")
  const [formData, setFormData] = useState<AnalyseFormData>({
    plz: "",
    stadt: "",
    objekttyp: "",
    wohnflaeche: "",
    grundstueck: "",
    baujahr: "",
    zustand: "",
    ausstattung: "mittel",
    lage: "mittel",
    energieeffizienz: "unbekannt",
    anzahlWohnungen: "",
    stellplaetze: "",
    keller: false,
    balkon: false,
    aufzug: false,
    istMiete: "",
    bodenrichtwert: "",
    kaufpreis: "",
    // ETW-spezifisch
    mea: "",
    etage: "",
    hausgeld: "",
    // WGH-spezifisch
    gewerbeflaeche: "",
    gewerbemiete: "",
    // MFH-spezifisch
    vermieteteEinheiten: "",
    // Dokumente
    uploadedFiles: [],
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const addMessage = (message: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { ...message, id: Date.now() }])
  }

  const handleOptionSelect = (value: string, label: string) => {
    addMessage({ type: "user", content: label })

    switch (currentStep) {
      case "objekttyp":
        const newData = { ...formData, objekttyp: value }
        setFormData(newData)
        onDataChange({ objekttyp: value })
        setTimeout(() => {
          // Objekttyp-spezifische Flächen-Fragen
          let flaechenFields: { label: string; key: string; placeholder: string; suffix?: string }[] = []
          let flaechenContent = `${label} ausgewählt. `
          
          if (value === "etw") {
            flaechenContent += "Bitte geben Sie die Wohnungsdaten ein:"
            flaechenFields = [
              { label: "Wohnfläche", key: "wohnflaeche", placeholder: "z.B. 85", suffix: "m²" },
              { label: "Miteigentumsanteil", key: "mea", placeholder: "z.B. 125", suffix: "‰" },
              { label: "Etage", key: "etage", placeholder: "z.B. 3 (EG=0)" },
            ]
          } else if (value === "wgh") {
            flaechenContent += "Bitte geben Sie die Flächen ein:"
            flaechenFields = [
              { label: "Wohnfläche", key: "wohnflaeche", placeholder: "z.B. 600", suffix: "m²" },
              { label: "Gewerbefläche", key: "gewerbeflaeche", placeholder: "z.B. 200", suffix: "m²" },
              { label: "Grundstück", key: "grundstueck", placeholder: "z.B. 800", suffix: "m²" },
            ]
          } else {
            // EFH, ZFH, MFH
            flaechenContent += "Bitte geben Sie die Flächen ein:"
            flaechenFields = [
              { label: "Wohnfläche", key: "wohnflaeche", placeholder: "z.B. 850", suffix: "m²" },
              { label: "Grundstück", key: "grundstueck", placeholder: "z.B. 1200", suffix: "m²" },
            ]
          }
          
          addMessage({
            type: "bot",
            content: flaechenContent,
            inputType: "form",
            formFields: flaechenFields,
          })
          setCurrentStep("flaechen")
        }, 400)
        break

      case "baujahr":
        const dataWithZustand = { ...formData, zustand: value }
        setFormData(dataWithZustand)
        onDataChange({ zustand: value })
        setTimeout(() => {
          addMessage({
            type: "bot",
            content: "Wie würden Sie die Ausstattungsqualität beschreiben?",
            options: ausstattungOptionen,
          })
          setCurrentStep("ausstattung")
        }, 400)
        break

      case "ausstattung":
        const dataWithAusstattung = { ...formData, ausstattung: value as AnalyseFormData['ausstattung'] }
        setFormData(dataWithAusstattung)
        onDataChange({ ausstattung: value as AnalyseFormData['ausstattung'] })
        setTimeout(() => {
          addMessage({
            type: "bot",
            content: "Wie ist die Lagequalität des Standorts?",
            options: lageOptionen,
          })
          setCurrentStep("lage")
        }, 400)
        break

      case "lage":
        const dataWithLage = { ...formData, lage: value as AnalyseFormData['lage'] }
        setFormData(dataWithLage)
        onDataChange({ lage: value as AnalyseFormData['lage'] })
        setTimeout(() => {
          addMessage({
            type: "bot",
            content: "Welche Energieeffizienzklasse hat das Gebäude?",
            options: energieOptionen,
          })
          setCurrentStep("energie")
        }, 400)
        break

      case "energie":
        const dataWithEnergie = { ...formData, energieeffizienz: value }
        setFormData(dataWithEnergie)
        onDataChange({ energieeffizienz: value })
        setTimeout(() => {
          // Objekttyp-spezifische Details-Fragen
          let detailsFields: { label: string; key: string; placeholder: string; suffix?: string }[] = []
          let detailsContent = "Bitte geben Sie weitere Details ein:"
          let showExtrasCheckboxes = true
          
          if (formData.objekttyp === "etw") {
            detailsContent = "Bitte geben Sie die Wohnungsdetails ein:"
            detailsFields = [
              { label: "Hausgeld", key: "hausgeld", placeholder: "z.B. 350", suffix: "€/Monat" },
              { label: "Stellplätze", key: "stellplaetze", placeholder: "z.B. 1" },
            ]
          } else if (formData.objekttyp === "efh") {
            detailsContent = "Bitte geben Sie die Hausdetails ein:"
            detailsFields = [
              { label: "Stellplätze/Garage", key: "stellplaetze", placeholder: "z.B. 2" },
            ]
          } else if (formData.objekttyp === "zfh") {
            detailsContent = "Bitte geben Sie die Details zum Zweifamilienhaus ein:"
            detailsFields = [
              { label: "Vermietete Einheiten", key: "vermieteteEinheiten", placeholder: "0, 1 oder 2" },
              { label: "Stellplätze", key: "stellplaetze", placeholder: "z.B. 2" },
            ]
          } else if (formData.objekttyp === "mfh") {
            detailsContent = "Bitte geben Sie die Details zum Mehrfamilienhaus ein:"
            detailsFields = [
              { label: "Anzahl Wohnungen", key: "anzahlWohnungen", placeholder: "z.B. 6" },
              { label: "Davon vermietet", key: "vermieteteEinheiten", placeholder: "z.B. 5" },
              { label: "Stellplätze", key: "stellplaetze", placeholder: "z.B. 4" },
            ]
          } else if (formData.objekttyp === "wgh") {
            detailsContent = "Bitte geben Sie die Details zum Wohn-/Geschäftshaus ein:"
            detailsFields = [
              { label: "Wohnungen", key: "anzahlWohnungen", placeholder: "z.B. 4" },
              { label: "Davon vermietet", key: "vermieteteEinheiten", placeholder: "z.B. 4" },
              { label: "Stellplätze", key: "stellplaetze", placeholder: "z.B. 3" },
            ]
          } else {
            detailsFields = [
              { label: "Wohnungen", key: "anzahlWohnungen", placeholder: "z.B. 6" },
              { label: "Stellplätze", key: "stellplaetze", placeholder: "z.B. 4" },
            ]
          }
          
          addMessage({
            type: "bot",
            content: detailsContent,
            inputType: "form",
            formFields: detailsFields,
            showExtras: showExtrasCheckboxes,
          })
          setCurrentStep("details")
        }, 400)
        break
    }
  }

  const handleInputSubmit = () => {
    if (!inputValue.trim()) return

    addMessage({
      type: "user",
      content: inputValue + (currentStep === "miete" ? " €" : currentStep === "bodenrichtwert" ? " €/m²" : ""),
    })

    switch (currentStep) {
      case "miete":
        // Bei WGH: Prüfen ob Gewerbemiete noch fehlt
        if (formData.objekttyp === "wgh" && !formData.gewerbemiete && inputValue) {
          // Erste Eingabe = Wohnmiete, jetzt Gewerbemiete abfragen
          const dataWithWohnmiete = { ...formData, istMiete: inputValue }
          setFormData(dataWithWohnmiete)
          onDataChange({ istMiete: inputValue })
          setTimeout(() => {
            addMessage({
              type: "bot",
              content: "Wie hoch ist die monatliche Gewerbemiete (Kaltmiete)?",
              inputType: "number",
            })
            // Bleibe bei miete step, aber nächste Eingabe ist gewerbemiete
          }, 400)
        } else if (formData.objekttyp === "wgh" && formData.istMiete && inputValue) {
          // Zweite Eingabe = Gewerbemiete
          const dataWithGewerbemiete = { ...formData, gewerbemiete: inputValue }
          setFormData(dataWithGewerbemiete)
          onDataChange({ gewerbemiete: inputValue })
          setTimeout(() => {
            addMessage({
              type: "bot",
              content: `Bitte geben Sie den Bodenrichtwert ein. Sie finden diesen im BORIS-Portal Ihres Bundeslandes:`,
              inputType: "number",
              showBorisLink: true,
            })
            setCurrentStep("bodenrichtwert")
          }, 400)
        } else {
          // Alle anderen Objekttypen
          const dataWithMiete = { ...formData, istMiete: inputValue }
          setFormData(dataWithMiete)
          onDataChange({ istMiete: inputValue })
          setTimeout(() => {
            addMessage({
              type: "bot",
              content: `Bitte geben Sie den Bodenrichtwert ein. Sie finden diesen im BORIS-Portal Ihres Bundeslandes:`,
              inputType: "number",
              showBorisLink: true,
            })
            setCurrentStep("bodenrichtwert")
          }, 400)
        }
        break

      case "bodenrichtwert":
        const dataWithBrw = { ...formData, bodenrichtwert: inputValue }
        setFormData(dataWithBrw)
        onDataChange({ bodenrichtwert: inputValue })
        setTimeout(() => {
          addMessage({
            type: "bot",
            content:
              "Optional: Geben Sie einen Kaufpreis ein, um die Rendite zu berechnen. Oder '0' für nur die Bewertung:",
            inputType: "number",
          })
          setCurrentStep("kaufpreis")
        }, 400)
        break

      case "kaufpreis":
        const finalData = { ...formData, kaufpreis: inputValue }
        setFormData(finalData)
        onDataChange({ kaufpreis: inputValue })
        setTimeout(() => {
          addMessage({
            type: "bot",
            content: "Alle Daten erfasst! Die Marktpreiseinschätzung wird berechnet...",
          })
          setCurrentStep("complete")
          onCalculate(finalData)
        }, 400)
        break
    }

    setInputValue("")
  }

  const handleUploadComplete = (files: UploadedFile[]) => {
    const dataWithFiles = { ...formData, uploadedFiles: files }
    setFormData(dataWithFiles)
    onDataChange({ uploadedFiles: files })
    
    addMessage({ 
      type: "user", 
      content: files.length > 0 
        ? `${files.length} Datei(en) hochgeladen` 
        : "Keine Dateien hochgeladen" 
    })
    
    goToMieteStep()
  }

  const handleSkipUpload = () => {
    addMessage({ type: "user", content: "Übersprungen" })
    goToMieteStep()
  }

  const goToMieteStep = () => {
    setTimeout(() => {
      // Objekttyp-spezifische Miete-Fragen
      let mieteContent = "Wie hoch ist die aktuelle monatliche Kaltmiete (Ist-Miete)?"
      
      if (formData.objekttyp === "etw") {
        mieteContent = "Wie hoch ist die monatliche Kaltmiete der Wohnung? (0 wenn selbstgenutzt)"
      } else if (formData.objekttyp === "mfh") {
        mieteContent = "Wie hoch ist die gesamte monatliche Kaltmiete aller Einheiten?"
      } else if (formData.objekttyp === "wgh") {
        mieteContent = "Wie hoch ist die monatliche Wohnmiete (Kaltmiete)?"
      }
      
      addMessage({
        type: "bot",
        content: mieteContent,
        inputType: "number",
      })
      setCurrentStep("miete")
    }, 400)
  }

  const handleFormSubmit = (data: Record<string, string>) => {
    const summary = Object.entries(data)
      .filter(([_, v]) => v)
      .map(([k, v]) => {
        const labels: Record<string, string> = {
          plz: "PLZ",
          stadt: "Stadt",
          wohnflaeche: "Wohnfläche",
          grundstueck: "Grundstück",
          baujahr: "Baujahr",
        }
        const suffix = k === "wohnflaeche" || k === "grundstueck" ? " m²" : ""
        return `${labels[k] || k}: ${v}${suffix}`
      })
      .join(", ")

    addMessage({ type: "user", content: summary })

    switch (currentStep) {
      case "plz":
        const plzData = { ...formData, plz: data.plz || "", stadt: data.stadt || "" }
        setFormData(plzData)
        onDataChange({ plz: data.plz, stadt: data.stadt })
        setTimeout(() => {
          addMessage({
            type: "bot",
            content: `Standort: ${data.plz} ${data.stadt}. Welcher Objekttyp soll bewertet werden?`,
            options: objektTypen,
          })
          setCurrentStep("objekttyp")
        }, 400)
        break

      case "flaechen":
        const flaechenData = {
          ...formData,
          wohnflaeche: data.wohnflaeche || "",
          grundstueck: data.grundstueck || "",
          // ETW-spezifisch
          mea: data.mea || "",
          etage: data.etage || "",
          // WGH-spezifisch
          gewerbeflaeche: data.gewerbeflaeche || "",
        }
        setFormData(flaechenData)
        onDataChange({ 
          wohnflaeche: data.wohnflaeche, 
          grundstueck: data.grundstueck,
          mea: data.mea,
          etage: data.etage,
          gewerbeflaeche: data.gewerbeflaeche,
        })
        setTimeout(() => {
          addMessage({
            type: "bot",
            content: "Wann wurde das Gebäude gebaut?",
            inputType: "form",
            formFields: [{ label: "Baujahr", key: "baujahr", placeholder: "z.B. 1965" }],
          })
          setCurrentStep("baujahr")
        }, 400)
        break

      case "baujahr":
        const baujahrData = { ...formData, baujahr: data.baujahr || "" }
        setFormData(baujahrData)
        onDataChange({ baujahr: data.baujahr })
        setTimeout(() => {
          addMessage({
            type: "bot",
            content: "Wie würden Sie den Gesamtzustand des Gebäudes einschätzen?",
            options: zustandOptionen,
          })
        }, 400)
        break

      case "details":
        const detailsData = { 
          ...formData, 
          anzahlWohnungen: data.anzahlWohnungen || "",
          stellplaetze: data.stellplaetze || "",
          keller: data.keller === "true",
          balkon: data.balkon === "true",
          aufzug: data.aufzug === "true",
          // ETW-spezifisch
          hausgeld: data.hausgeld || "",
          // MFH/ZFH-spezifisch
          vermieteteEinheiten: data.vermieteteEinheiten || "",
        }
        setFormData(detailsData)
        onDataChange({ 
          anzahlWohnungen: data.anzahlWohnungen,
          stellplaetze: data.stellplaetze,
          keller: data.keller === "true",
          balkon: data.balkon === "true",
          aufzug: data.aufzug === "true",
          hausgeld: data.hausgeld,
          vermieteteEinheiten: data.vermieteteEinheiten,
        })
        setTimeout(() => {
          // Nach Details kommt Upload-Step
          addMessage({
            type: "bot",
            content: "Optional: Laden Sie Fotos, Grundrisse oder Dokumente hoch. Die KI analysiert diese automatisch und verbessert die Bewertung.",
            inputType: "upload",
          })
          setCurrentStep("upload")
        }, 400)
        break
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-3", message.type === "user" ? "justify-end" : "justify-start")}>
            {message.type === "bot" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3",
                message.type === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border",
              )}
            >
              <p className="text-sm">{message.content}</p>

              {message.showBorisLink && (
                <a
                  href="https://www.bodenrichtwerte-boris.de/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  BORIS-D Portal öffnen
                </a>
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
                <UploadSection 
                  onComplete={handleUploadComplete}
                  onSkip={handleSkipUpload}
                />
              )}
            </div>
            {message.type === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">Du</span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area for number inputs */}
      {(currentStep === "miete" || currentStep === "bodenrichtwert" || currentStep === "kaufpreis") && (
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder={
                currentStep === "miete"
                  ? "z.B. 12500"
                  : currentStep === "bodenrichtwert"
                    ? "z.B. 580"
                    : "z.B. 3200000 (oder 0)"
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
              className="bg-input"
            />
            <span className="flex items-center text-sm text-muted-foreground">
              {currentStep === "bodenrichtwert" ? "€/m²" : "€"}
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
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFiles = (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      type: file.type,
      size: file.size,
      category: detectCategory(file.name, file.type),
      url: URL.createObjectURL(file),
    }))
    setFiles(prev => [...prev, ...uploadedFiles])
  }

  const detectCategory = (name: string, type: string): UploadedFile['category'] => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('grundriss') || lowerName.includes('floor')) return 'grundriss'
    if (lowerName.includes('energie') || lowerName.includes('ausweis')) return 'energie'
    if (lowerName.includes('expose') || type === 'application/pdf') return 'expose'
    if (lowerName.includes('aussen') || lowerName.includes('fassade')) return 'aussen'
    if (type.startsWith('image/')) return 'innen'
    return 'sonstiges'
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
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
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
        />
        <div className="text-muted-foreground text-sm">
          <p className="font-medium">Dateien hier ablegen</p>
          <p className="text-xs mt-1">oder klicken zum Auswählen</p>
          <p className="text-xs mt-2 opacity-70">Bilder, PDFs, Word, Excel</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{files.length} Datei(en):</p>
          <div className="flex flex-wrap gap-2">
            {files.map(file => (
              <div 
                key={file.id} 
                className="flex items-center gap-2 bg-muted rounded-lg px-2 py-1 text-xs"
              >
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button 
                  onClick={() => removeFile(file.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={onSkip}
        >
          Überspringen
        </Button>
        <Button 
          size="sm" 
          className="flex-1"
          onClick={() => onComplete(files)}
        >
          {files.length > 0 ? "Weiter mit Analyse" : "Ohne Dateien fortfahren"}
        </Button>
      </div>
    </div>
  )
}

function FormInputs({
  fields,
  onSubmit,
  defaultValues,
  showExtras = false,
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
  const [extras, setExtras] = useState({
    keller: false,
    balkon: false,
    aufzug: false,
  })

  const handleSubmit = () => {
    if (showExtras) {
      onSubmit({
        ...values,
        keller: String(extras.keller),
        balkon: String(extras.balkon),
        aufzug: String(extras.aufzug),
      })
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
            <Input
              type="text"
              placeholder={field.placeholder}
              value={values[field.key]}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              className="bg-input text-sm h-8"
            />
            {field.suffix && <span className="text-xs text-muted-foreground">{field.suffix}</span>}
          </div>
        </div>
      ))}
      {showExtras && (
        <div className="flex flex-wrap gap-4 pt-2">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <Checkbox 
              checked={extras.keller} 
              onCheckedChange={(checked) => setExtras(prev => ({ ...prev, keller: !!checked }))}
            />
            Keller
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <Checkbox 
              checked={extras.balkon} 
              onCheckedChange={(checked) => setExtras(prev => ({ ...prev, balkon: !!checked }))}
            />
            Balkon/Terrasse
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <Checkbox 
              checked={extras.aufzug} 
              onCheckedChange={(checked) => setExtras(prev => ({ ...prev, aufzug: !!checked }))}
            />
            Aufzug
          </label>
        </div>
      )}
      <Button size="sm" className="w-full mt-2" onClick={handleSubmit}>
        Weiter
      </Button>
    </div>
  )
}
