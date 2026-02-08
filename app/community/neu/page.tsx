"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, MessageSquare, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createPost } from "../server-actions"

const categories = [
  { value: "deal-analyse", label: "Deal-Analyse" },
  { value: "finanzierung", label: "Finanzierung" },
  { value: "strategie", label: "Strategie" },
  { value: "steuern", label: "Steuern & Recht" },
  { value: "allgemein", label: "Allgemein" },
]

export default function NewPostPage() {
  const router = useRouter()
  const [postType, setPostType] = useState<"diskussion" | "meinungsbild">(
    "diskussion"
  )
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    const formData = new FormData(e.currentTarget)
    formData.set("post_type", postType)

    if (postType === "meinungsbild") {
      formData.set("category", "meinungsbild")
    }

    startTransition(async () => {
      const result = await createPost(formData)
      if (result.error) {
        setError(result.error)
      } else if (result.id) {
        router.push(`/community/${result.id}`)
      }
    })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Back */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/community">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurueck zur Community
          </Link>
        </Button>
      </div>

      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Neuer Beitrag
      </h1>

      {/* Type selector */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setPostType("diskussion")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
            postType === "diskussion"
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-border hover:border-primary/30"
          )}
        >
          <MessageSquare
            className={cn(
              "h-6 w-6",
              postType === "diskussion"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          />
          <div>
            <p className="text-sm font-semibold">Diskussion</p>
            <p className="text-[10px] text-muted-foreground">
              Frage stellen oder Thema besprechen
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setPostType("meinungsbild")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
            postType === "meinungsbild"
              ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500/20"
              : "border-border hover:border-amber-300"
          )}
        >
          <BarChart3
            className={cn(
              "h-6 w-6",
              postType === "meinungsbild"
                ? "text-amber-600"
                : "text-muted-foreground"
            )}
          />
          <div>
            <p className="text-sm font-semibold">Meinungsbild</p>
            <p className="text-[10px] text-muted-foreground">
              Objekt teilen und Community-Bewertung erhalten
            </p>
          </div>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              {postType === "diskussion"
                ? "Diskussion starten"
                : "Objekt fuer Meinungsbild teilen"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm">
                Titel
              </Label>
              <Input
                id="title"
                name="title"
                required
                placeholder={
                  postType === "diskussion"
                    ? "z.B. Wie bewertet ihr den Standort Leipzig-Sued?"
                    : "z.B. MFH Leipzig 24 WE - Lohnt sich der Deal?"
                }
              />
            </div>

            {/* Category (only for Diskussion) */}
            {postType === "diskussion" && (
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-sm">
                  Kategorie
                </Label>
                <select
                  id="category"
                  name="category"
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Kategorie waehlen...</option>
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Objektdaten (only for Meinungsbild) */}
            {postType === "meinungsbild" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                  Objektdaten
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Adresse / Stadt</Label>
                    <Input
                      name="obj_adresse"
                      placeholder="z.B. Leipzig-Sued"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Objekttyp</Label>
                    <select
                      name="obj_objekttyp"
                      className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm"
                    >
                      <option value="">Waehlen...</option>
                      <option value="MFH">Mehrfamilienhaus</option>
                      <option value="ETW">Eigentumswohnung</option>
                      <option value="EFH">Einfamilienhaus</option>
                      <option value="Gewerbe">Gewerbe</option>
                      <option value="Mischnutzung">Mischnutzung</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Baujahr</Label>
                    <Input
                      name="obj_baujahr"
                      placeholder="z.B. 1985"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Wohneinheiten</Label>
                    <Input
                      name="obj_wohneinheiten"
                      placeholder="z.B. 24"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Kaufpreis (EUR)</Label>
                    <Input
                      name="obj_kaufpreis"
                      placeholder="z.B. 2.100.000"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Mieteinnahmen/M (EUR)</Label>
                    <Input
                      name="obj_mieteinnahmen"
                      placeholder="z.B. 14.500"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="space-y-1.5">
              <Label htmlFor="content" className="text-sm">
                {postType === "diskussion" ? "Beschreibung" : "Ihre Einschaetzung / Fragen"}
              </Label>
              <Textarea
                id="content"
                name="content"
                required
                className="min-h-[140px]"
                placeholder={
                  postType === "diskussion"
                    ? "Beschreiben Sie Ihr Thema oder Ihre Frage..."
                    : "Beschreiben Sie das Objekt, Ihre bisherige Einschaetzung und was Sie von der Community wissen moechten..."
                }
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" asChild>
                <Link href="/community">Abbrechen</Link>
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="gap-2"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {postType === "diskussion"
                  ? "Diskussion starten"
                  : "Meinungsbild anfragen"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
