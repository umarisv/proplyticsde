"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowUp,
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
} from "lucide-react"
import { ProplyticsLogo } from "@/components/proplytics-logo"

const suggestions = [
  {
    icon: Building2,
    label: "Wohnung bewerten",
    prompt: "Ich moechte eine 3-Zimmer-Wohnung in Muenchen Schwabing bewerten lassen. Baujahr 1985, ca. 78 qm, guter Zustand.",
  },
  {
    icon: TrendingUp,
    label: "Rendite berechnen",
    prompt: "Ich habe ein Mehrfamilienhaus zum Kauf gefunden und moechte die Rendite und den Cashflow analysieren.",
  },
  {
    icon: BarChart3,
    label: "Markt analysieren",
    prompt: "Wie entwickelt sich der Immobilienmarkt in Berlin aktuell? Ich suche nach Investitionsmoeglichkeiten.",
  },
]

const platformLinks = [
  { href: "/portal", icon: LayoutDashboard, label: "Portal", desc: "Ihre Bewertungen verwalten" },
  { href: "/portal/marktplatz", icon: TrendingUp, label: "Marktplatz", desc: "Partner und Dienstleister" },
  { href: "/portal/academy", icon: BookOpen, label: "Academy", desc: "Immobilienwissen vertiefen" },
  { href: "/blog", icon: FileText, label: "Blog", desc: "Fachartikel und Analysen" },
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  const handleSubmit = () => {
    if (!query.trim() && files.length === 0) return
    const params = new URLSearchParams()
    if (query.trim()) params.set("q", query.trim())
    router.push(`/analyse${params.toString() ? "?" + params.toString() : ""}`)
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

  return (
    <div
      className="flex min-h-[calc(100vh-3.5rem-3.5rem)] flex-col items-center justify-center px-4 py-12"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 px-12 py-10 text-center">
            <Paperclip className="mx-auto mb-3 h-8 w-8 text-primary" />
            <p className="text-lg font-medium">Dateien hier ablegen</p>
            <p className="mt-1 text-sm text-muted-foreground">Bilder, PDFs, Dokumente</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl">
        {/* Brand greeting */}
        <div className="mb-8 text-center">
          <div className="mb-5 flex justify-center">
            <ProplyticsLogo size="lg" showText={false} />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Was moechten Sie analysieren?
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Beschreiben Sie Ihre Immobilie oder laden Sie Dokumente hoch.
          </p>
        </div>

        {/* Input Box */}
        <div
          className={`overflow-hidden rounded-2xl border bg-card shadow-sm transition-all ${
            query || files.length > 0
              ? "border-primary/30 shadow-md shadow-primary/5"
              : "border-border hover:border-border/80"
          }`}
        >
          {/* Uploaded files */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 border-b border-border/40 px-4 py-3">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg bg-secondary px-2.5 py-1.5 text-xs"
                >
                  {isImage(file.type) ? (
                    <ImageIcon className="h-3.5 w-3.5 text-primary/70" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-primary/70" />
                  )}
                  <span className="max-w-[120px] truncate font-medium">{file.name}</span>
                  <span className="text-muted-foreground">{formatSize(file.size)}</span>
                  <button
                    onClick={() => removeFile(i)}
                    className="ml-0.5 rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="z.B. 3-Zimmer-Wohnung in Berlin, 85qm, Baujahr 1998..."
            className="w-full resize-none bg-transparent px-4 pt-4 pb-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50 sm:text-base"
            rows={3}
          />

          {/* Bottom bar */}
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
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                title="Bild hochladen"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!query.trim() && files.length === 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-20"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {suggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => handleSuggestion(s.prompt)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-primary/20 hover:text-foreground sm:text-sm"
            >
              <s.icon className="h-3.5 w-3.5 text-primary/60" />
              {s.label}
            </button>
          ))}
        </div>

        {/* Platform sections */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {platformLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group flex flex-col gap-1.5 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/20 hover:shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                  <item.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium group-hover:text-primary">{item.label}</span>
              </div>
              <span className="pl-[38px] text-xs text-muted-foreground">{item.desc}</span>
            </a>
          ))}
        </div>

        {/* Trust bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground/40">
          <span>ImmoWertV 2024</span>
          <span className="h-3 w-px bg-border" />
          <span>DSGVO-konform</span>
          <span className="h-3 w-px bg-border" />
          <span>KI-gestuetzt</span>
          <span className="h-3 w-px bg-border" />
          <span>Made in Germany</span>
        </div>
      </div>
    </div>
  )
}
