"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, CheckCircle2, MessageSquare, ExternalLink, ShieldCheck } from "lucide-react"
import Link from "next/link"

interface PartnerCardProps {
  id: string
  name: string
  category: string
  subcategory: string
  rating: number
  reviews: number
  regions: string[]
  logo: string
  isVerified?: boolean
  description: string
}

export function PartnerCard({
  id,
  name,
  category,
  subcategory,
  rating,
  reviews,
  regions,
  logo,
  isVerified,
  description
}: PartnerCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all border-border/50 group">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="w-16 h-16 rounded-xl border bg-white p-2 flex items-center justify-center overflow-hidden shrink-0">
            <img src={logo} alt={name} className="object-contain w-full h-full" />
          </div>
          {isVerified && (
            <Badge className="bg-primary/10 text-primary border-none gap-1">
              <ShieldCheck className="w-3 h-3" />
              Handverlesen
            </Badge>
          )}
        </div>
        <div className="mt-4 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{name}</h3>
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{category} • {subcategory}</p>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-0 space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground font-normal">({reviews})</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{regions.slice(0, 2).join(", ")}{regions.length > 2 && "..."}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {regions.slice(0, 3).map(region => (
            <Badge key={region} variant="secondary" className="text-[10px] py-0 px-2 font-normal">
              {region}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-6 flex gap-3">
        <Button asChild className="flex-1 gap-2">
          <Link href={`/portal/marktplatz/anfrage?partner=${id}`}>
            <MessageSquare className="w-4 h-4" />
            Anfrage stellen
          </Link>
        </Button>
        <Button variant="outline" size="icon" asChild className="shrink-0">
          <Link href={`/portal/marktplatz/partner/${id}`}>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
