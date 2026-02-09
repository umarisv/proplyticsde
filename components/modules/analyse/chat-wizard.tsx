"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, ArrowRight, ExternalLink } from "lucide-react"
import { ProplyticsLogo } from "@/components/proplytics-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { saveBewertung } from "@/lib/api/bewertungen"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import type { AnalyseFormData } from "@/lib/types"

// ─── Types ───
type StepType = "plz" | "objekttyp" | "flaechen" | "baujahr" | "zustand" | "ausstattung" | "lage" | "energie" | "details" | "miete" | "bodenrichtwert" | "kaufpreis" | "complete"

const STEPS: StepType[] = ["plz", "objekttyp", "flaechen", "baujahr", "zustand", "ausstattung", "lage", "energie", "details", "miete", "bodenrichtwert", "kaufpreis", "complete"]

interface Message {
  id: number
  type: "bot" | "user"
  content: string
  widget?: "options" | "form" | "none"
  options?: { label: string; value: string; desc?: string }[]
  formFields?: { label: string; key: string; placeholder: string; suffix?: string }[]
  showExtras?: boolean
  done?: boolean
}

interface ChatWizardProps {
  onDataChange: (data: Partial<AnalyseFormData>) => void
  onCalculate: (data: AnalyseFormData) => void
  initialQuery?: string
  initialData?: Record<string, string>
}

// ─── Option sets ───
const OBJ_TYPES = [
  { label: "MFH", value: "mfh", desc: "Mehrfamilienhaus" },
  { label: "ZFH", value: "zfh", desc: "Zweifamilienhaus" },
  { label: "EFH", value: "efh", desc: "Einfamilienhaus" },
  { label: "ETW", value: "etw", desc: "Eigentumswohnung" },
  { label: "WGH", value: "wgh", desc: "Wohn-/Geschaeftshaus" },
]
const ZUSTAND = [
  { label: "Neubau/Kernsaniert", value: "neubau" },
  { label: "Gepflegt", value: "gepflegt" },
  { label: "Durchschnittlich", value: "durchschnitt" },
  { label: "Sanierungsbedarf", value: "sanierung" },
]
const AUSSTATTUNG = [
  { label: "Einfach", value: "einfach", desc: "Standard" },
  { label: "Mittel", value: "mittel", desc: "Gehoben" },
  { label: "Gehoben", value: "gehoben", desc: "Hochwertig" },
  { label: "Luxus", value: "luxus", desc: "Exklusiv" },
]
const LAGE = [
  { label: "Einfach", value: "einfach", desc: "Randlage" },
  { label: "Mittel", value: "mittel", desc: "Durchschnitt" },
  { label: "Gut", value: "gut", desc: "Gute Lage" },
  { label: "Sehr gut", value: "sehr_gut", desc: "Beste Lage" },
]
const ENERGIE = [
  { label: "A+", value: "A+" }, { label: "A", value: "A" }, { label: "B", value: "B" },
  { label: "C", value: "C" }, { label: "D", value: "D" }, { label: "E", value: "E" },
  { label: "F", value: "F" }, { label: "G", value: "G" }, { label: "H", value: "H" },
  { label: "Unbekannt", value: "unbekannt" },
]

// ─── Helpers ───
function findFirstMissing(d: Record<string, string>): StepType {
  if (!d.plz && !d.stadt) return "plz"
  if (!d.objekttyp) return "objekttyp"
  if (!d.wohnflaeche) return "flaechen"
  if (!d.baujahr) return "baujahr"
  if (!d.mieteinnahmen) return "miete"
  if (!d.kaufpreis) return "kaufpreis"
  return "complete"
}

function summaryLines(d: Record<string, string>): string[] {
  const r: string[] = []
  const tl = OBJ_TYPES.find(o => o.value === d.objekttyp)?.desc || d.objekttyp
  if (d.objekttyp) r.push(tl)
  if (d.stadt) r.push(d.plz ? `${d.plz} ${d.stadt}` : d.stadt)
  if (d.wohnflaeche) r.push(`${d.wohnflaeche} m2`)
  if (d.baujahr) r.push(`Bj. ${d.baujahr}`)
  if (d.wohneinheiten) r.push(`${d.wohneinheiten} WE`)
  if (d.kaufpreis) r.push(`KP ${Number(d.kaufpreis).toLocaleString("de-DE")} EUR`)
  if (d.mieteinnahmen) r.push(`Miete ${Number(d.mieteinnahmen).toLocaleString("de-DE")} EUR/M`)
  return r
}

// ═══════════════════════════════════════════════════════════════════════
export function ChatWizard({ onDataChange, onCalculate, initialQuery, initialData }: ChatWizardProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [step, setStep] = useState<StepType>("plz")
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
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
      if (initialData.plz) base.plz = initialData.plz
      if (initialData.stadt) base.stadt = initialData.stadt
      if (initialData.objekttyp) base.objekttyp = initialData.objekttyp
      if (initialData.wohnflaeche) base.wohnflaeche = initialData.wohnflaeche
      if (initialData.grundstueck) base.grundstueck = initialData.grundstueck
      if (initialData.baujahr) base.baujahr = initialData.baujahr
      if (initialData.kaufpreis) base.kaufpreis = initialData.kaufpreis
      if (initialData.mieteinnahmen) base.istMiete = initialData.mieteinnahmen
      if (initialData.wohneinheiten) base.anzahlWohnungen = initialData.wohneinheiten
      if (initialData.zustand) base.zustand = initialData.zustand
    }
    return base
  })

  const endRef = useRef<HTMLDivElement>(null)
  const initDone = useRef(false)

  const progress = Math.round((STEPS.indexOf(step) / (STEPS.length - 1)) * 100)

  // ─── Add messages ───
  const bot = useCallback((msg: Omit<Message, "id" | "type">, delay = 500) => {
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(p => [...p, { ...msg, id: Date.now(), type: "bot" }])
    }, delay)
  }, [])

  const usr = useCallback((content: string) => {
    setMessages(p => [...p, { id: Date.now(), type: "user", content }])
  }, [])

  // ─── Auto-scroll ───
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typing])

  // ─── Prompt for any step ───
  const prompt = useCallback((s: StepType, fd: AnalyseFormData) => {
    switch (s) {
      case "plz":
        bot({
          content: "Wo befindet sich die Immobilie?",
          widget: "form",
          formFields: [
            { label: "PLZ", key: "plz", placeholder: "z.B. 40239" },
            { label: "Stadt", key: "stadt", placeholder: "z.B. Duesseldorf" },
          ],
        }, 300)
        break
      case "objekttyp":
        bot({ content: "Um welchen Objekttyp handelt es sich?", widget: "options", options: OBJ_TYPES }, 300)
        break
      case "flaechen": {
        const t = fd.objekttyp
        const fields = t === "etw"
          ? [{ label: "Wohnflaeche", key: "wohnflaeche", placeholder: "z.B. 85", suffix: "m2" }, { label: "MEA", key: "mea", placeholder: "z.B. 125", suffix: "Promille" }, { label: "Etage", key: "etage", placeholder: "z.B. 3" }]
          : t === "wgh"
          ? [{ label: "Wohnflaeche", key: "wohnflaeche", placeholder: "z.B. 600", suffix: "m2" }, { label: "Gewerbeflaeche", key: "gewerbeflaeche", placeholder: "z.B. 200", suffix: "m2" }, { label: "Grundstueck", key: "grundstueck", placeholder: "z.B. 800", suffix: "m2" }]
          : [{ label: "Wohnflaeche", key: "wohnflaeche", placeholder: "z.B. 850", suffix: "m2" }, { label: "Grundstueck", key: "grundstueck", placeholder: "z.B. 1200", suffix: "m2" }]
        bot({ content: "Wie gross ist das Objekt?", widget: "form", formFields: fields }, 300)
        break
      }
      case "baujahr":
        bot({ content: "Wann wurde das Gebaeude errichtet?", widget: "form", formFields: [{ label: "Baujahr", key: "baujahr", placeholder: "z.B. 1965" }] }, 300)
        break
      case "zustand":
        bot({ content: "In welchem Zustand befindet sich das Gebaeude?", widget: "options", options: ZUSTAND }, 300)
        break
      case "ausstattung":
        bot({ content: "Wie wuerden Sie die Ausstattungsqualitaet beschreiben?", widget: "options", options: AUSSTATTUNG }, 300)
        break
      case "lage":
        bot({ content: "Wie schaetzen Sie die Lagequalitaet ein?", widget: "options", options: LAGE }, 300)
        break
      case "energie":
        bot({ content: "Welche Energieeffizienzklasse hat das Gebaeude?", widget: "options", options: ENERGIE }, 300)
        break
      case "details": {
        const t = fd.objekttyp
        const fields = t === "etw"
          ? [{ label: "Hausgeld", key: "hausgeld", placeholder: "z.B. 350", suffix: "EUR/Mt" }, { label: "Stellplaetze", key: "stellplaetze", placeholder: "z.B. 1" }]
          : t === "mfh"
          ? [{ label: "Wohnungen", key: "anzahlWohnungen", placeholder: "z.B. 6" }, { label: "Davon vermietet", key: "vermieteteEinheiten", placeholder: "z.B. 5" }, { label: "Stellplaetze", key: "stellplaetze", placeholder: "z.B. 4" }]
          : t === "wgh"
          ? [{ label: "Wohnungen", key: "anzahlWohnungen", placeholder: "z.B. 4" }, { label: "Davon vermietet", key: "vermieteteEinheiten", placeholder: "z.B. 4" }, { label: "Stellplaetze", key: "stellplaetze", placeholder: "z.B. 3" }]
          : [{ label: "Stellplaetze", key: "stellplaetze", placeholder: "z.B. 2" }]
        bot({ content: "Noch ein paar Details:", widget: "form", formFields: fields, showExtras: true }, 300)
        break
      }
      case "miete": {
        const t = fd.objekttyp
        const txt = t === "mfh" ? "Wie hoch ist die gesamte monatliche Kaltmiete aller Einheiten?"
          : t === "etw" ? "Monatliche Kaltmiete? (0 = selbstgenutzt)"
          : t === "wgh" ? "Monatliche Wohnmiete (Kaltmiete)?"
          : "Aktuelle monatliche Kaltmiete (Ist-Miete)?"
        bot({ content: txt, widget: "form", formFields: [{ label: "Kaltmiete", key: "istMiete", placeholder: "z.B. 4500", suffix: "EUR/Mt" }] }, 300)
        break
      }
      case "bodenrichtwert":
        bot({ content: "Bodenrichtwert (BORIS-Portal Ihres Bundeslandes):", widget: "form", formFields: [{ label: "Bodenrichtwert", key: "bodenrichtwert", placeholder: "z.B. 250", suffix: "EUR/m2" }] }, 300)
        break
      case "kaufpreis":
        bot({ content: "Kaufpreis? (0 = nur Bewertung ohne Rendite)", widget: "form", formFields: [{ label: "Kaufpreis", key: "kaufpreis", placeholder: "z.B. 850000", suffix: "EUR" }] }, 300)
        break
      case "complete":
        runCalculation(fd)
        break
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bot])

  // ─── Run calculation ───
  const runCalculation = useCallback(async (fd: AnalyseFormData) => {
    bot({ content: "Alle Daten erfasst! Bewertung wird berechnet - Marktwert, Investment-Score und Risikoanalyse..." }, 300)
    setTimeout(async () => {
      onCalculate(fd)
      if (user) {
        try {
          const { calculateValuation } = await import("@/lib/calculate-valuation")
          const resultData = calculateValuation(fd)
          const { data } = await saveBewertung({ formData: fd, resultData, adresse: `${fd.plz} ${fd.stadt}`, userId: user.id })
          if (data) setSavedId(data.id)
        } catch { /* silent */ }
      }
      setMessages(p => [...p, {
        id: Date.now(), type: "bot",
        content: "Fertig! Die Ergebnisse mit Investment-Score und Ampelbewertung finden Sie links im Panel. Nutzen Sie den PDF-Export oben fuer den Download.",
        done: true,
      }])
    }, 1200)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bot, onCalculate, user])

  // ─── INIT ───
  useEffect(() => {
    if (initDone.current) return
    initDone.current = true

    if (initialData && Object.keys(initialData).length > 0) {
      onDataChange(formData)
      if (initialQuery) {
        setMessages([{ id: 1, type: "user", content: initialQuery }])
      }
      const lines = summaryLines(initialData)
      const firstMissing = findFirstMissing(initialData)
      setStep(firstMissing)

      bot({
        content: `Erkannt: ${lines.join(" | ")}\n\n${firstMissing === "complete" ? "Alle Kerndaten vorhanden - starte Analyse..." : "Ich frage nur noch was fehlt."}`,
      }, 400)

      setTimeout(() => {
        prompt(firstMissing, formData)
      }, 1200)
    } else {
      bot({
        content: "Willkommen bei Proplytics! Ich erstelle Ihre Marktpreiseinschaetzung nach ImmoWertV 2024.\n\nWo befindet sich die Immobilie?",
        widget: "form",
        formFields: [
          { label: "PLZ", key: "plz", placeholder: "z.B. 40239" },
          { label: "Stadt", key: "stadt", placeholder: "z.B. Duesseldorf" },
        ],
      }, 300)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Advance to next step ───
  const advance = useCallback((currentStep: StepType, fd: AnalyseFormData) => {
    const idx = STEPS.indexOf(currentStep)
    const next = STEPS[idx + 1] || "complete"
    setStep(next)
    prompt(next, fd)
  }, [prompt])

  // ─── Option select handler ───
  const onOption = (value: string, label: string) => {
    usr(label)
    const updated = { ...formData }
    switch (step) {
      case "objekttyp":
        updated.objekttyp = value
        break
      case "zustand":
        updated.zustand = value
        break
      case "ausstattung":
        updated.ausstattung = value as AnalyseFormData["ausstattung"]
        break
      case "lage":
        updated.lage = value as AnalyseFormData["lage"]
        break
      case "energie":
        updated.energieeffizienz = value
        break
    }
    setFormData(updated)
    onDataChange(updated)
    advance(step, updated)
  }

  // ─── Form submit handler ───
  const onForm = (data: Record<string, string>) => {
    const parts = Object.entries(data).filter(([,v]) => v).map(([k,v]) => {
      const labels: Record<string,string> = { plz:"PLZ", stadt:"Stadt", wohnflaeche:"Flaeche", grundstueck:"Grundst.", baujahr:"Bj.", mea:"MEA", etage:"Etage", gewerbeflaeche:"Gewerbe", anzahlWohnungen:"WE", stellplaetze:"Stellpl.", hausgeld:"Hausgeld", vermieteteEinheiten:"Vermietet", istMiete:"Miete", bodenrichtwert:"BRW", kaufpreis:"KP" }
      return `${labels[k]||k}: ${v}`
    })
    usr(parts.join(", "))

    const updated = { ...formData }
    for (const [k, v] of Object.entries(data)) {
      if (!v) continue
      if (k === "keller") { updated.keller = v === "true"; continue }
      if (k === "balkon") { updated.balkon = v === "true"; continue }
      if (k === "aufzug") { updated.aufzug = v === "true"; continue }
      ;(updated as Record<string, unknown>)[k] = v
    }
    setFormData(updated)
    onDataChange(updated)
    advance(step, updated)
  }

  // ─── Check if the LAST bot message has an active widget ───
  const lastBot = [...messages].reverse().find(m => m.type === "bot")
  const hasActiveWidget = lastBot?.widget === "options" || lastBot?.widget === "form"
  const showNumberInput = step === "miete" || step === "bodenrichtwert" || step === "kaufpreis"
  const showInput = !hasActiveWidget && showNumberInput && step !== "complete"

  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Progress */}
      <div className="px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground">Fortschritt</span>
          <span className="text-xs font-bold text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.type === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] rounded-2xl px-4 py-3", m.type === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border shadow-sm")}>
              {m.type === "bot" && (
                <div className="flex items-center gap-2 mb-2">
                  <ProplyticsLogo size="xs" />
                  <span className="text-xs font-medium text-muted-foreground">proplytics.de</span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-line">{m.content}</p>

              {/* Options */}
              {m.widget === "options" && m.options && m === lastBot && step !== "complete" && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {m.options.map(o => (
                    <Button key={o.value} variant="outline" size="sm" className="text-xs" onClick={() => onOption(o.value, o.label)}>
                      {o.label}{o.desc && <span className="ml-1 text-muted-foreground">({o.desc})</span>}
                    </Button>
                  ))}
                </div>
              )}

              {/* Form */}
              {m.widget === "form" && m.formFields && m === lastBot && step !== "complete" && (
                <InlineForm fields={m.formFields} showExtras={m.showExtras} onSubmit={onForm} />
              )}

              {/* Done */}
              {m.done && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline" className="text-xs">
                    <Link href="/portal">Zum Portal <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                  {savedId && (
                    <Button asChild size="sm" className="text-xs">
                      <Link href={`/portal/bewertung/${savedId}`}>Bewertung ansehen <ExternalLink className="ml-1 h-3 w-3" /></Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <ProplyticsLogo size="xs" />
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Bottom input - only for number steps when no form widget is active */}
      {showInput && (
        <div className="border-t border-border bg-card/50 p-3">
          <form onSubmit={(e) => { e.preventDefault(); if (!input.trim()) return; usr(input.trim()); const fd = { ...formData }; if (step === "miete") fd.istMiete = input.trim(); else if (step === "bodenrichtwert") fd.bodenrichtwert = input.trim(); else if (step === "kaufpreis") fd.kaufpreis = input.trim(); setFormData(fd); onDataChange(fd); setInput(""); advance(step, fd); }} className="flex gap-2">
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder={step === "miete" ? "Kaltmiete EUR/Monat" : step === "bodenrichtwert" ? "EUR/m2" : "Kaufpreis EUR"} type="number" className="flex-1" autoFocus />
            <Button type="submit" size="icon" disabled={!input.trim()}><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      )}
    </div>
  )
}

// ─── Inline Form ───
function InlineForm({ fields, showExtras, onSubmit }: {
  fields: { label: string; key: string; placeholder: string; suffix?: string }[]
  showExtras?: boolean
  onSubmit: (data: Record<string, string>) => void
}) {
  const [vals, setVals] = useState<Record<string, string>>({})
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(vals) }} className="mt-3 space-y-2">
      {fields.map(f => (
        <div key={f.key}>
          <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
          <div className="flex items-center gap-2">
            <Input placeholder={f.placeholder} value={vals[f.key] || ""} onChange={e => setVals(p => ({ ...p, [f.key]: e.target.value }))} className="text-sm" />
            {f.suffix && <span className="text-xs text-muted-foreground whitespace-nowrap">{f.suffix}</span>}
          </div>
        </div>
      ))}
      {showExtras && (
        <div className="flex flex-wrap gap-3 pt-2">
          {[{ key: "keller", label: "Keller" }, { key: "balkon", label: "Balkon" }, { key: "aufzug", label: "Aufzug" }].map(cb => (
            <label key={cb.key} className="flex items-center gap-1.5 text-xs cursor-pointer">
              <Checkbox checked={vals[cb.key] === "true"} onCheckedChange={c => setVals(p => ({ ...p, [cb.key]: c ? "true" : "false" }))} />
              {cb.label}
            </label>
          ))}
        </div>
      )}
      <Button type="submit" size="sm" className="w-full mt-2">Weiter <ArrowRight className="ml-1 h-3 w-3" /></Button>
    </form>
  )
}
