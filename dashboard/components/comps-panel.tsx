"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, MapPin, Loader2, TrendingUp, TrendingDown, Minus, BarChart3, Building2, Info } from "lucide-react"

interface RegionalStats {
  id: string
  region: string
  bundesland: string
  region_type: string
  avg_price_sqm: number
  price_range_min: number
  price_range_max: number
  trend_percent: number
  trend_direction: string
  estimated_price?: number
  national_comparison: string
  data_source: string
  updated: string
}

interface StatsResponse {
  success: boolean
  stats?: RegionalStats
  comparable_regions: RegionalStats[]
  error?: string
}

interface CompsPanelProps {
  initialAddress?: string
}

export function CompsPanel({ initialAddress }: CompsPanelProps) {
  const [address, setAddress] = useState(initialAddress || "")
  const [rooms, setRooms] = useState("")
  const [size, setSize] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<RegionalStats | null>(null)
  const [comparables, setComparables] = useState<RegionalStats[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()

    if (!address.trim()) {
      setError("Bitte geben Sie eine Adresse oder PLZ ein")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/comps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address.trim(),
          rooms: rooms ? Number(rooms) : undefined,
          size: size ? Number(size) : undefined,
        }),
      })

      const data = (await response.json()) as StatsResponse

      if (!data.success) {
        setError(data.error || "Fehler beim Laden der Statistiken")
        setStats(null)
        setComparables([])
        return
      }

      setStats(data.stats || null)
      setComparables(data.comparable_regions || [])
    } catch (err) {
      console.error("Stats fetch error:", err)
      setError("Netzwerkfehler. Bitte versuchen Sie es später erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price)

  const formatPricePerSqm = (price: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price) + "/m²"

  const TrendIcon = ({ direction }: { direction: string }) => {
    if (direction === "steigend") return <TrendingUp className="h-4 w-4 text-green-500" />
    if (direction === "fallend") return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const TrendBadge = ({ direction, percent }: { direction: string; percent: number }) => {
    const variant = direction === "steigend" ? "default" : direction === "fallend" ? "destructive" : "secondary"
    return (
      <Badge variant={variant} className="gap-1">
        <TrendIcon direction={direction} />
        {percent > 0 ? "+" : ""}{percent.toFixed(1)}%
      </Badge>
    )
  }

  // Calculate position on price range for visualization
  const getPricePosition = (price: number, min: number, max: number) => {
    return Math.min(100, Math.max(0, ((price - min) / (max - min)) * 100))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Regionale Preisstatistiken
          </CardTitle>
          <CardDescription>
            Offizielle Marktdaten basierend auf Destatis und regionalen Gutachterausschüssen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="address">Stadt / PLZ</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="z.B. Düsseldorf oder 40239"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rooms">Zimmer (optional)</Label>
                <Input
                  id="rooms"
                  type="number"
                  min={1}
                  max={20}
                  placeholder="z.B. 3"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Fläche m² (optional)</Label>
                <Input
                  id="size"
                  type="number"
                  min={10}
                  max={1000}
                  placeholder="z.B. 80"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Lade Statistiken...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Preisstatistik abrufen
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">{error}</div>
      )}

      {stats && (
        <>
          {/* Main Stats Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {stats.region}
                  </CardTitle>
                  <CardDescription>
                    {stats.bundesland} • {stats.region_type}
                  </CardDescription>
                </div>
                <TrendBadge direction={stats.trend_direction} percent={stats.trend_percent} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price per sqm */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Durchschnittspreis</p>
                  <p className="text-3xl font-bold">{formatPricePerSqm(stats.avg_price_sqm)}</p>
                  <p className="text-sm text-muted-foreground">{stats.national_comparison}</p>
                </div>
                
                {stats.estimated_price && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Geschätzter Objektpreis</p>
                    <p className="text-3xl font-bold text-primary">{formatPrice(stats.estimated_price)}</p>
                    <p className="text-sm text-muted-foreground">für {size || 75} m² Wohnfläche</p>
                  </div>
                )}
              </div>

              {/* Price Range Visualization */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Preisspanne in der Region</span>
                  <span>{formatPricePerSqm(stats.price_range_min)} - {formatPricePerSqm(stats.price_range_max)}</span>
                </div>
                <div className="relative">
                  <Progress value={getPricePosition(stats.avg_price_sqm, stats.price_range_min, stats.price_range_max)} className="h-3" />
                  <div 
                    className="absolute top-0 h-3 w-1 bg-primary rounded"
                    style={{ left: `${getPricePosition(stats.avg_price_sqm, stats.price_range_min, stats.price_range_max)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Günstig</span>
                  <span>Durchschnitt</span>
                  <span>Premium</span>
                </div>
              </div>

              {/* Data Source */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-4">
                <Info className="h-3 w-3" />
                <span>Quelle: {stats.data_source} • Stand: {stats.updated}</span>
              </div>
            </CardContent>
          </Card>

          {/* Comparable Regions */}
          {comparables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vergleichbare Regionen</CardTitle>
                <CardDescription>Städte mit ähnlichem Preisniveau</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {comparables.map((comp) => (
                    <div key={comp.id} className="rounded-lg border p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{comp.region}</p>
                        <TrendBadge direction={comp.trend_direction} percent={comp.trend_percent} />
                      </div>
                      <p className="text-2xl font-bold">{formatPricePerSqm(comp.avg_price_sqm)}</p>
                      <p className="text-xs text-muted-foreground">{comp.bundesland}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!isLoading && !stats && !error && (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p className="mb-2">Geben Sie eine Stadt oder PLZ ein, um Preisstatistiken abzurufen.</p>
          <p className="text-sm">Basierend auf offiziellen Marktdaten des Statistischen Bundesamtes.</p>
        </div>
      )}
    </div>
  )
}
