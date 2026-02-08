"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { submitRating } from "../actions"

const dimensions = [
  { key: "rendite", label: "Rendite", desc: "Bruttomietrendite, Cashflow, IRR" },
  { key: "risiko", label: "Risiko", desc: "Deal-Killer, Standort-Score" },
  { key: "finanzierung", label: "Finanzierung", desc: "DSCR, EK-Quote, Zinsen" },
  { key: "value_add", label: "Value-Add", desc: "Werthebel, Mietsteigerung" },
  { key: "lage_markt", label: "Lage & Markt", desc: "Makrolage, Nachfrage" },
  { key: "deal_sourcing", label: "Deal Sourcing", desc: "Preis fair? Off-Market?" },
]

const ampelOptions = [
  { value: 1, label: "Kritisch", color: "border-red-300 bg-red-50 text-red-700", active: "border-red-500 bg-red-100 ring-2 ring-red-500/20" },
  { value: 2, label: "Neutral", color: "border-amber-300 bg-amber-50 text-amber-700", active: "border-amber-500 bg-amber-100 ring-2 ring-amber-500/20" },
  { value: 3, label: "Positiv", color: "border-emerald-300 bg-emerald-50 text-emerald-700", active: "border-emerald-500 bg-emerald-100 ring-2 ring-emerald-500/20" },
]

export function RatingForm({ postId }: { postId: string }) {
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [kommentar, setKommentar] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const allRated = dimensions.every((d) => ratings[d.key])

  function handleSubmit() {
    if (!allRated) return
    setError("")

    const formData = new FormData()
    for (const d of dimensions) {
      formData.set(d.key, String(ratings[d.key]))
    }
    formData.set("kommentar", kommentar)

    startTransition(async () => {
      const result = await submitRating(postId, formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  if (success) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm font-medium text-primary">
            Ihre Einschaetzung wurde gespeichert!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Ihre Einschaetzung</CardTitle>
        <p className="text-xs text-muted-foreground">
          Bewerten Sie das Objekt in 6 Dimensionen (Ampel-System)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {dimensions.map((dim) => (
          <div key={dim.key}>
            <div className="mb-1.5">
              <p className="text-xs font-semibold">{dim.label}</p>
              <p className="text-[10px] text-muted-foreground">{dim.desc}</p>
            </div>
            <div className="flex gap-2">
              {ampelOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setRatings((prev) => ({ ...prev, [dim.key]: opt.value }))
                  }
                  className={cn(
                    "flex-1 rounded-md border px-2 py-1.5 text-[10px] font-medium transition-all",
                    ratings[dim.key] === opt.value
                      ? opt.active
                      : opt.color + " opacity-60 hover:opacity-100"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-1.5 text-xs font-semibold">Kommentar (optional)</p>
          <Textarea
            placeholder="Ihre Einschaetzung in Kurzform..."
            value={kommentar}
            onChange={(e) => setKommentar(e.target.value)}
            className="min-h-[60px] resize-none text-sm"
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={!allRated || isPending}
          className="w-full gap-2"
          size="sm"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          Einschaetzung abgeben
        </Button>
      </CardContent>
    </Card>
  )
}
