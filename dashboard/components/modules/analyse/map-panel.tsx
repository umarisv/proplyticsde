"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, ExternalLink } from "lucide-react"

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

  const encodedAddress = encodeURIComponent(address)
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}&maptype=${layer}&zoom=18`


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

    </div>
  )
}
