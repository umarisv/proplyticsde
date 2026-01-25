"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, MapPin, Loader2, Home } from "lucide-react"

interface Comparable {
  id: string
  address: string
  price: number
  size: number
  rooms: number
  distance: number
  listingDate: string
  url?: string
}

interface CompsPanelProps {
  initialAddress?: string
}

export function CompsPanel({ initialAddress }: CompsPanelProps) {
  const [address, setAddress] = useState(initialAddress || "")
  const [rooms, setRooms] = useState("")
  const [size, setSize] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [comps, setComps] = useState<Comparable[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()

    if (!address.trim()) {
      setError("Bitte geben Sie eine Adresse ein")
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
          radius: 5,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || "Fehler beim Laden der Vergleichsobjekte")
        setComps([])
        return
      }

      setComps(data.comps)
    } catch (err) {
      console.error("Comps fetch error:", err)
      setError("Netzwerkfehler. Bitte versuchen Sie es später erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(price)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Vergleichsobjekte suchen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="address">Adresse / PLZ</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="z.B. 40239 Düsseldorf"
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
                  Suche läuft...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Vergleichsobjekte suchen
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">{error}</div>
      )}

      {comps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              {comps.length} Vergleichsobjekte gefunden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adresse</TableHead>
                    <TableHead className="text-right">Preis</TableHead>
                    <TableHead className="text-right">Fläche</TableHead>
                    <TableHead className="text-right">Zimmer</TableHead>
                    <TableHead className="text-right">Entfernung</TableHead>
                    <TableHead>Inseriert</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comps.map((comp) => (
                    <TableRow key={comp.id}>
                      <TableCell className="font-medium">
                        {comp.url ? (
                          <a
                            href={comp.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            {comp.address}
                          </a>
                        ) : (
                          comp.address
                        )}
                      </TableCell>
                      <TableCell className="text-right">{formatPrice(comp.price)}</TableCell>
                      <TableCell className="text-right">{comp.size} m²</TableCell>
                      <TableCell className="text-right">{comp.rooms}</TableCell>
                      <TableCell className="text-right">{comp.distance} km</TableCell>
                      <TableCell>{comp.listingDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && comps.length === 0 && !error && (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <Home className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p>Geben Sie eine Adresse ein, um Vergleichsobjekte zu finden.</p>
        </div>
      )}
    </div>
  )
}
