"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Layers, Edit3, Check, ExternalLink } from "lucide-react"

interface MapPanelProps {
  address: string
  isLoading?: boolean
}

type MapLayer = "satellite" | "roadmap" | "hybrid"

const LAYER_OPTIONS: { value: MapLayer; label: string }[] = [
  { value: "satellite", label: "Satellit" },
  { value: "roadmap", label: "Karte" },
  { value: "hybrid", label: "Hybrid" },
]

export function MapPanel({ address, isLoading = false }: MapPanelProps) {
  const [layer, setLayer] = useState<MapLayer>("satellite")
  const [bodenrichtwert, setBodenrichtwert] = useState("580")
  const [isEditingBrw, setIsEditingBrw] = useState(false)

  const encodedAddress = encodeURIComponent(address)
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}&maptype=${layer}&zoom=18`

  const handleSaveBrw = () => {
    setIsEditingBrw(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-4 gap-4">
        <Skeleton className="flex-1 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Map Container */}
      <Card className="flex-1 overflow-hidden">
        <div className="relative h-full">
          <iframe
            src={mapUrl}
            className="w-full h-full min-h-[300px]"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Standortkarte"
          />

          {/* Layer Toggle */}
          <div className="absolute top-3 right-3 flex gap-1 bg-card/95 backdrop-blur-sm rounded-lg p-1 border border-border shadow-lg">
            {LAYER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={layer === option.value ? "default" : "ghost"}
                size="sm"
                className={`text-xs h-7 px-2`}
                onClick={() => setLayer(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Address Badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-border shadow-lg">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium truncate max-w-[200px]">{address}</span>
          </div>
        </div>
      </Card>

      {/* Bodenrichtwert Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Bodenrichtwert
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              BORIS-D
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isEditingBrw ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="brw" className="sr-only">Bodenrichtwert</Label>
                <Input
                  id="brw"
                  type="number"
                  value={bodenrichtwert}
                  onChange={(e) => setBodenrichtwert(e.target.value)}
                  className="flex-1 h-9"
                  autoFocus
                />
                <span className="text-sm text-muted-foreground">€/m²</span>
                <Button size="sm" onClick={handleSaveBrw}>
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">{bodenrichtwert} €/m²</p>
                <p className="text-xs text-muted-foreground mt-1">Stichtag: 01.01.2024</p>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8" 
                onClick={() => setIsEditingBrw(true)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <a
            href="https://www.bodenrichtwerte-boris.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline mt-3"
          >
            <ExternalLink className="w-3 h-3" />
            BORIS-D Portal öffnen
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
