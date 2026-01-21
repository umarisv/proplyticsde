"use client"

import { useState, useRef, useEffect } from "react"
import { Building2, Send, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { AnalyseFormData } from "@/lib/types"

type MessageType = "bot" | "user"
type StepType = "plz" | "objekttyp" | "flaechen" | "baujahr" | "miete" | "bodenrichtwert" | "kaufpreis" | "complete"

interface Message {
  id: number
  type: MessageType
  content: string
  options?: { label: string; value: string; description?: string }[]
  inputType?: "text" | "number" | "form"
  formFields?: { label: string; key: string; placeholder: string; suffix?: string }[]
  showBorisLink?: boolean
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
    istMiete: "",
    bodenrichtwert: "",
    kaufpreis: "",
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
          addMessage({
            type: "bot",
            content: `${label} ausgewählt. Bitte geben Sie die Flächen ein:`,
            inputType: "form",
            formFields: [
              { label: "Wohnfläche", key: "wohnflaeche", placeholder: "z.B. 850", suffix: "m²" },
              { label: "Grundstück", key: "grundstueck", placeholder: "z.B. 1200", suffix: "m²" },
            ],
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
            content: "Wie hoch ist die aktuelle monatliche Kaltmiete (Ist-Miete)?",
            inputType: "number",
          })
          setCurrentStep("miete")
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
        }
        setFormData(flaechenData)
        onDataChange({ wohnflaeche: data.wohnflaeche, grundstueck: data.grundstueck })
        setTimeout(() => {
          addMessage({
            type: "bot",
            content: "Wann wurde das Gebäude gebaut und wie ist der Zustand?",
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
                <FormInputs fields={message.formFields} onSubmit={handleFormSubmit} defaultValues={formData} />
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

function FormInputs({
  fields,
  onSubmit,
  defaultValues,
}: {
  fields: { label: string; key: string; placeholder: string; suffix?: string }[]
  onSubmit: (data: Record<string, string>) => void
  defaultValues: Record<string, string>
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    fields.forEach((f) => {
      initial[f.key] = (defaultValues[f.key as keyof typeof defaultValues] as string) || ""
    })
    return initial
  })

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
      <Button size="sm" className="w-full mt-2" onClick={() => onSubmit(values)}>
        Weiter
      </Button>
    </div>
  )
}
