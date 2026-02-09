"use client"

import { useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  Building2,
  TrendingUp,
  BarChart3,
  BookOpen,
  Users,
  LayoutDashboard,
  Check,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import {
  parsePropertyText,
  getParsedFields,
  getMissingFields,
  getCompleteness,
  buildAnalyseParams,
} from "@/lib/property-parser"

const suggestions = [
  {
    icon: Building2,
    label: "MFH bewerten",
    prompt:
      "Mehrfamilienhaus in Leipzig, 24 Wohneinheiten, Baujahr 1985, 1.850 qm, Kaufpreis 2,1 Mio, Mieteinnahmen 14.500 EUR/Monat",
  },
  {
    icon: TrendingUp,
    label: "ETW analysieren",
    prompt:
      "3-Zimmer-Wohnung in Muenchen Schwabing, 78 qm, Baujahr 1998, guter Zustand, Kaufpreis 520.000 EUR",
  },
  {
    icon: BarChart3,
    label: "Rendite pruefen",
    prompt:
      "Zinshaus Berlin Neukoelln, 12 WE, Bj. 1907 kernsaniert, 950 qm, KP 3,8 Mio, Kaltmiete 22.000/Monat",
  },
]

const platformLinks = [
  { href: "/portal", icon: LayoutDashboard, label: "Portal", desc: "Bewertungen verwalten" },
  { href: "/portal/marktplatz", icon: TrendingUp, label: "Marktplatz", desc: "Partner finden" },
  { href: "/portal/academy", icon: BookOpen, label: "Academy", desc: "Wissen vertiefen" },
  { href: "/blog", icon: FileText, label: "Blog", desc: "Fachartikel lesen" },
  { href: "/community", icon: Users, label: "Community", desc: "Austausch mit Experten" },
  { href: "/analyse", icon: BarChart3, label: "Analyse", desc: "Detaillierte Auswertung" },
]

interface UploadedFile {
  name: string
  type: string
  size: number
}

export default function HomePage() {
  const [query, setQuery] = useState("")
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [showAllMissing, setShowAllMissing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  // Parse in real-time
  const parsed = useMemo(() => parsePropertyText(query), [query])
  const fields = useMemo(() => getParsedFields(parsed), [parsed])
  const missing = useMemo(() => getMissingFields(parsed), [parsed])
  const completeness = useMemo(() => getCompleteness(parsed), [parsed])

  const highMissing = missing.filter((m) => m.priority === "hoch")
  const otherMissing = missing.filter((m) => m.priority !== "hoch")
  const hasInput = query.trim().length > 8

  const handleSubmit = () => {
    if (!query.trim() && files.length === 0) return
    const params = buildAnalyseParams(parsed)
    // Also pass the raw text for the chat wizard to use
    if (query.trim()) params.set("q", query.trim())
    router.push(`/analyse?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return
    const newFiles: UploadedFile[] = Array.from(selectedFiles).map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
    }))
    setFiles((prev) => [...prev, ...newFiles])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = e.dataTransfer.files
    if (!droppedFiles) return
    const newFiles: UploadedFile[] = Array.from(droppedFiles).map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleSuggestion = (prompt: string) => {
    setQuery(prompt)
    textareaRef.current?.focus()
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const isImage = (type: string) => type.startsWith("image/")

  const completenessColor =
    completeness >= 70
      ? "bg-emerald-500"
      : completeness >= 40
        ? "bg-amber-500"
        : "bg-primary/40"

  return (
    <div
      className="relative flex min-h-[calc(100vh-3.5rem-3.5rem)] flex-col items-center justify-center px-4 py-16"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[400px] w-[800px] rounded-full bg-primary/[0.04] blur-[120px]" />
      </div>

      {isDragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 px-12 py-10 text-center">
            <Paperclip className="mx-auto mb-3 h-6 w-6 text-primary" />
            <p className="font-medium">Dateien hier ablegen</p>
            <p className="mt-1 text-sm text-muted-foreground">Bilder, PDFs, Dokumente</p>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-2xl">
        {/* Greeting */}
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Was moechten Sie{" "}
            <span className="text-gradient">analysieren</span>?
          </h1>
          <p className="text-muted-foreground">
            Beschreiben Sie Ihre Immobilie - wir erkennen die Eckdaten automatisch.
          </p>
        </div>

        {/* Input Box */}
        <div
          className={`overflow-hidden rounded-xl border transition-all ${
            query || files.length > 0
              ? "border-primary/30 glow-sm"
              : "border-border hover:border-border/80"
          } bg-card`}
        >
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 border-b border-border/50 px-4 py-3">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-md bg-secondary px-2.5 py-1.5 text-xs"
                >
                  {isImage(file.type) ? (
                    <ImageIcon className="h-3.5 w-3.5 text-primary/60" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-primary/60" />
                  )}
                  <span className="max-w-[120px] truncate">{file.name}</span>
                  <span className="text-muted-foreground">{formatSize(file.size)}</span>
                  <button
                    onClick={() => removeFile(i)}
                    className="ml-0.5 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="z.B. MFH Leipzig, 24 WE, Bj. 1985, 1.850qm, Kaufpreis 2,1 Mio, Miete 14.500/Monat..."
            className="w-full resize-none bg-transparent px-4 pt-4 pb-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/40"
            rows={3}
          />

          {/* Completeness bar - only show when typing */}
          {hasInput && (
            <div className="px-4 pb-2">
              <div className="flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${completenessColor}`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {completeness}%
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-0.5">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                title="Dateien hochladen"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "image/*"
                    fileInputRef.current.click()
                    fileInputRef.current.accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  }
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                title="Bild hochladen"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!query.trim() && files.length === 0}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-20"
            >
              Analyse starten
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Live parsed fields */}
        {hasInput && fields.length > 0 && (
          <div className="mt-3 rounded-lg border border-border/50 bg-card/50 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              Erkannte Daten
            </div>
            <div className="flex flex-wrap gap-1.5">
              {fields.map((f) => (
                <span
                  key={f.key}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-xs text-emerald-700 dark:text-emerald-400"
                >
                  <span className="font-medium">{f.label}:</span> {f.value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing fields - hints */}
        {hasInput && highMissing.length > 0 && (
          <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5" />
              {completeness >= 60
                ? "Noch nuetzlich fuer eine genauere Analyse:"
                : "Diese Infos verbessern die Analyse deutlich:"}
            </div>
            <div className="space-y-1.5">
              {highMissing.map((m) => (
                <div key={m.key} className="flex items-start gap-2 text-xs">
                  <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                  <div>
                    <span className="font-medium text-foreground">{m.label}</span>
                    <span className="text-muted-foreground"> - {m.hint}</span>
                  </div>
                </div>
              ))}
            </div>

            {otherMissing.length > 0 && (
              <button
                onClick={() => setShowAllMissing(!showAllMissing)}
                className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {showAllMissing ? (
                  <>
                    <ChevronUp className="h-3 w-3" /> Weniger anzeigen
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" /> {otherMissing.length} weitere optionale Angaben
                  </>
                )}
              </button>
            )}

            {showAllMissing && (
              <div className="mt-2 space-y-1.5 border-t border-amber-500/10 pt-2">
                {otherMissing.map((m) => (
                  <div key={m.key} className="flex items-start gap-2 text-xs">
                    <Info className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/50" />
                    <div>
                      <span className="font-medium text-foreground">{m.label}</span>
                      <span className="text-muted-foreground"> - {m.hint}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ready to go message */}
        {hasInput && completeness >= 60 && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <span className="text-xs text-emerald-700 dark:text-emerald-400">
              {completeness >= 80
                ? "Sehr gute Datenlage - die Analyse wird umfassend ausfallen."
                : "Genug Daten fuer eine solide Erstbewertung. Sie koennen jederzeit Details ergaenzen."}
            </span>
          </div>
        )}

        {/* Suggestions */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {suggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => handleSuggestion(s.prompt)}
              className="inline-flex items-center gap-2 rounded-md border border-border/50 bg-card/50 px-3.5 py-2 text-xs text-muted-foreground transition-all hover:border-primary/20 hover:text-foreground"
            >
              <s.icon className="h-3.5 w-3.5 text-primary/50" />
              {s.label}
            </button>
          ))}
        </div>

        {/* Platform links */}
        <div className="mt-14 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {platformLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-lg border border-border/30 bg-card/30 p-3.5 transition-all hover:border-border hover:bg-card"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
                <item.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="truncate text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Trust */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-[11px] tracking-wide text-muted-foreground/30">
          <span>ImmoWertV 2024</span>
          <span className="h-3 w-px bg-border/50" />
          <span>DSGVO-konform</span>
          <span className="h-3 w-px bg-border/50" />
          <span>KI-gestuetzt</span>
          <span className="h-3 w-px bg-border/50" />
          <span>Made in Germany</span>
        </div>
      </div>
    </div>
  )
}
