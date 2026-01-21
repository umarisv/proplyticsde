"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Building2, ArrowLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getBewertungById } from "@/lib/api/bewertungen"
import { formatCurrency, formatPercent } from "@/lib/format"
import type { Bewertung } from "@/lib/database.types"
import type { AnalyseResultData } from "@/lib/types"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface ComparisonData {
  bewertung: Bewertung
  ergebnisse: AnalyseResultData
}

const objektTypLabels: Record<string, string> = {
  mfh: "Mehrfamilienhaus",
  zfh: "Zweifamilienhaus",
  efh: "Einfamilienhaus",
  etw: "Eigentumswohnung",
  wgh: "Wohn-/Geschäftshaus",
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

export default function VergleichPage() {
  const searchParams = useSearchParams()
  const [comparisons, setComparisons] = useState<ComparisonData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const idsParam = searchParams.get("ids")
    if (!idsParam) {
      setIsLoading(false)
      return
    }

    const ids = idsParam.split(",").filter(Boolean).slice(0, 4) // Max 4 comparisons
    
    const loadComparisons = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            const { data, error } = await getBewertungById(id)
            if (error || !data) return null
            return {
              bewertung: data,
              ergebnisse: data.ergebnisse as unknown as AnalyseResultData,
            }
          })
        )
        
        setComparisons(results.filter(Boolean) as ComparisonData[])
      } catch (err) {
        console.error('Fehler beim Laden:', err)
        setError('Fehler beim Laden der Bewertungen')
      } finally {
        setIsLoading(false)
      }
    }

    loadComparisons()
  }, [searchParams])

  const removeComparison = (id: string) => {
    setComparisons(prev => prev.filter(c => c.bewertung.id !== id))
  }

  // Prepare radar chart data
  const radarData = comparisons.length > 0 ? [
    {
      metric: "Rendite",
      fullMark: 10,
      ...Object.fromEntries(
        comparisons.map((c, i) => [`value${i}`, Math.min(c.ergebnisse?.bruttoRendite || 0, 10)])
      ),
    },
    {
      metric: "Faktor",
      fullMark: 30,
      ...Object.fromEntries(
        comparisons.map((c, i) => [`value${i}`, 30 - Math.min(c.ergebnisse?.faktor || 30, 30)])
      ),
    },
    {
      metric: "€/m²",
      fullMark: 5000,
      ...Object.fromEntries(
        comparisons.map((c, i) => [`value${i}`, (5000 - Math.min(c.ergebnisse?.qmPreis || 0, 5000)) / 100])
      ),
    },
    {
      metric: "Cashflow",
      fullMark: 100,
      ...Object.fromEntries(
        comparisons.map((c, i) => [`value${i}`, Math.max(0, (c.ergebnisse?.cashflowMonat || 0) / 100 + 50)])
      ),
    },
    {
      metric: "EK-Rendite",
      fullMark: 20,
      ...Object.fromEntries(
        comparisons.map((c, i) => [`value${i}`, Math.max(0, (c.ergebnisse?.eigenkapitalrendite || 0) + 10)])
      ),
    },
  ] : []

  const getBestValue = (
    values: number[], 
    type: 'highest' | 'lowest'
  ): number => {
    if (values.length === 0) return -1
    const fn = type === 'highest' ? Math.max : Math.min
    const best = fn(...values)
    return values.indexOf(best)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Vergleichsdaten...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Link href="/">
            <Button>Zurück zur Übersicht</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (comparisons.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Keine Bewertungen zum Vergleichen</h2>
          <p className="text-muted-foreground mb-4">
            Wählen Sie mindestens 2 Bewertungen aus der Übersicht aus
          </p>
          <Link href="/">
            <Button>Zur Übersicht</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Building2 className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-semibold">Immobilienvergleich</h1>
            <Badge variant="secondary">{comparisons.length} Objekte</Badge>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Comparison Cards */}
        <div className={`grid gap-4 mb-8 grid-cols-${Math.min(comparisons.length, 4)}`} style={{
          gridTemplateColumns: `repeat(${Math.min(comparisons.length, 4)}, minmax(0, 1fr))`
        }}>
          {comparisons.map((comp, index) => (
            <Card key={comp.bewertung.id} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeComparison(comp.bewertung.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <CardHeader className="pb-2">
                <div 
                  className="w-3 h-3 rounded-full mb-2" 
                  style={{ backgroundColor: COLORS[index] }}
                />
                <CardTitle className="text-sm font-medium truncate pr-8">
                  {comp.bewertung.adresse}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {comp.bewertung.plz} {comp.bewertung.stadt}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <Badge variant="outline" className="mb-3">
                  {objektTypLabels[comp.bewertung.objekttyp || ''] || comp.bewertung.objekttyp}
                </Badge>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(comp.ergebnisse?.marktwert || 0)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Radar Chart */}
        {comparisons.length >= 2 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Kennzahlen-Vergleich</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                    {comparisons.map((comp, index) => (
                      <Radar
                        key={comp.bewertung.id}
                        name={comp.bewertung.adresse || `Objekt ${index + 1}`}
                        dataKey={`value${index}`}
                        stroke={COLORS[index]}
                        fill={COLORS[index]}
                        fillOpacity={0.2}
                      />
                    ))}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailvergleich</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Kennzahl</th>
                    {comparisons.map((comp, index) => (
                      <th key={comp.bewertung.id} className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: COLORS[index] }}
                          />
                          <span className="font-medium truncate max-w-[150px]">
                            {comp.bewertung.adresse}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Marktwert */}
                  <tr className="border-b">
                    <td className="py-3 px-4 text-muted-foreground">Marktwert</td>
                    {comparisons.map((comp, index) => {
                      const values = comparisons.map(c => c.ergebnisse?.marktwert || 0)
                      const isBest = getBestValue(values, 'highest') === index
                      return (
                        <td key={comp.bewertung.id} className={`text-right py-3 px-4 font-medium ${isBest ? 'text-green-600' : ''}`}>
                          {formatCurrency(comp.ergebnisse?.marktwert || 0)}
                        </td>
                      )
                    })}
                  </tr>
                  {/* Brutto-Rendite */}
                  <tr className="border-b">
                    <td className="py-3 px-4 text-muted-foreground">Brutto-Rendite</td>
                    {comparisons.map((comp, index) => {
                      const values = comparisons.map(c => c.ergebnisse?.bruttoRendite || 0)
                      const isBest = getBestValue(values, 'highest') === index
                      return (
                        <td key={comp.bewertung.id} className={`text-right py-3 px-4 font-medium ${isBest ? 'text-green-600' : ''}`}>
                          {formatPercent(comp.ergebnisse?.bruttoRendite || 0)}
                        </td>
                      )
                    })}
                  </tr>
                  {/* Netto-Rendite */}
                  <tr className="border-b">
                    <td className="py-3 px-4 text-muted-foreground">Netto-Rendite</td>
                    {comparisons.map((comp, index) => {
                      const values = comparisons.map(c => c.ergebnisse?.nettoRendite || 0)
                      const isBest = getBestValue(values, 'highest') === index
                      return (
                        <td key={comp.bewertung.id} className={`text-right py-3 px-4 font-medium ${isBest ? 'text-green-600' : ''}`}>
                          {formatPercent(comp.ergebnisse?.nettoRendite || 0)}
                        </td>
                      )
                    })}
                  </tr>
                  {/* Faktor */}
                  <tr className="border-b">
                    <td className="py-3 px-4 text-muted-foreground">Faktor</td>
                    {comparisons.map((comp, index) => {
                      const values = comparisons.map(c => c.ergebnisse?.faktor || 0)
                      const isBest = getBestValue(values, 'lowest') === index
                      return (
                        <td key={comp.bewertung.id} className={`text-right py-3 px-4 font-medium ${isBest ? 'text-green-600' : ''}`}>
                          {(comp.ergebnisse?.faktor || 0).toFixed(1)}x
                        </td>
                      )
                    })}
                  </tr>
                  {/* €/m² */}
                  <tr className="border-b">
                    <td className="py-3 px-4 text-muted-foreground">€/m²</td>
                    {comparisons.map((comp, index) => {
                      const values = comparisons.map(c => c.ergebnisse?.qmPreis || 0)
                      const isBest = getBestValue(values, 'lowest') === index
                      return (
                        <td key={comp.bewertung.id} className={`text-right py-3 px-4 font-medium ${isBest ? 'text-green-600' : ''}`}>
                          {formatCurrency(comp.ergebnisse?.qmPreis || 0)}
                        </td>
                      )
                    })}
                  </tr>
                  {/* Cashflow/Monat */}
                  <tr className="border-b">
                    <td className="py-3 px-4 text-muted-foreground">Cashflow/Monat</td>
                    {comparisons.map((comp, index) => {
                      const values = comparisons.map(c => c.ergebnisse?.cashflowMonat || 0)
                      const isBest = getBestValue(values, 'highest') === index
                      const value = comp.ergebnisse?.cashflowMonat || 0
                      return (
                        <td key={comp.bewertung.id} className={`text-right py-3 px-4 font-medium ${isBest ? 'text-green-600' : value < 0 ? 'text-red-600' : ''}`}>
                          {formatCurrency(value)}
                        </td>
                      )
                    })}
                  </tr>
                  {/* EK-Rendite */}
                  <tr className="border-b">
                    <td className="py-3 px-4 text-muted-foreground">EK-Rendite</td>
                    {comparisons.map((comp, index) => {
                      const values = comparisons.map(c => c.ergebnisse?.eigenkapitalrendite || 0)
                      const isBest = getBestValue(values, 'highest') === index
                      const value = comp.ergebnisse?.eigenkapitalrendite || 0
                      return (
                        <td key={comp.bewertung.id} className={`text-right py-3 px-4 font-medium ${isBest ? 'text-green-600' : value < 0 ? 'text-red-600' : ''}`}>
                          {formatPercent(value)}
                        </td>
                      )
                    })}
                  </tr>
                  {/* Wohnfläche */}
                  <tr className="border-b">
                    <td className="py-3 px-4 text-muted-foreground">Wohnfläche</td>
                    {comparisons.map((comp) => (
                      <td key={comp.bewertung.id} className="text-right py-3 px-4">
                        {comp.bewertung.wohnflaeche?.toLocaleString('de-DE')} m²
                      </td>
                    ))}
                  </tr>
                  {/* Baujahr */}
                  <tr className="border-b">
                    <td className="py-3 px-4 text-muted-foreground">Baujahr</td>
                    {comparisons.map((comp) => (
                      <td key={comp.bewertung.id} className="text-right py-3 px-4">
                        {comp.bewertung.baujahr}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
