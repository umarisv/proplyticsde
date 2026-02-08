"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin } from "lucide-react"

interface MapPanelProps {
  address: string
  isLoading?: boolean
}

type MapLayer = "satellite" | "roadmap" | "hybrid"

export function MapPanel({ address, isLoading = false }: MapPanelProps) {
  const [layer, setLayer] = useState<MapLayer>("roadmap")

  const encodedAddress = encodeURIComponent(address)
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}&maptype=${layer}&zoom=14`

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-4 gap-4">
        <Skeleton className="flex-1 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium truncate max-w-[200px]">{address}</span>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          {(["roadmap", "satellite", "hybrid"] as MapLayer[]).map((l) => (
            <Button
              key={l}
              variant={layer === l ? "default" : "ghost"}
              size="sm"
              className="text-xs h-6 px-2"
              onClick={() => setLayer(l)}
            >
              {l === "roadmap" ? "Karte" : l === "satellite" ? "Satellit" : "Hybrid"}
            </Button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <iframe
          key={`${encodedAddress}-${layer}`}
          src={mapUrl}
          className="w-full h-full absolute inset-0"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Standortkarte"
        />
      </div>
    </div>
  )
}
