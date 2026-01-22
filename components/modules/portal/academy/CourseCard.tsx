"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Clock, BookOpen, Star, Lock } from "lucide-react"
import Link from "next/link"

interface CourseCardProps {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  lessons: number
  rating: number
  price: number
  progress?: number
  isEnrolled?: boolean
  category: string
}

export function CourseCard({
  id,
  title,
  description,
  thumbnail,
  duration,
  lessons,
  rating,
  price,
  progress,
  isEnrolled,
  category
}: CourseCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all border-border/50">
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={thumbnail} 
          alt={title} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge className="bg-background/80 backdrop-blur text-foreground border-none">
            {category}
          </Badge>
        </div>
        {!isEnrolled && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="secondary" size="sm" className="gap-2">
              <Lock className="w-3 h-3" />
              Kurs-Details
            </Button>
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-1 text-yellow-500 mb-1">
          <Star className="w-3 h-3 fill-current" />
          <span className="text-xs font-bold">{rating.toFixed(1)}</span>
        </div>
        <CardTitle className="text-lg line-clamp-1">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {description}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {duration}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {lessons} Lektionen
          </div>
        </div>
        {isEnrolled && progress !== undefined && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-primary">
              <span>Fortschritt</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/50 mt-auto">
        {isEnrolled ? (
          <Button asChild className="w-full gap-2 mt-4">
            <Link href={`/portal/academy/kurse/${id}`}>
              <Play className="w-4 h-4 fill-current" />
              Fortsetzen
            </Link>
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full mt-4">
            <span className="text-xl font-bold">{price === 0 ? "Gratis" : `${price}€`}</span>
            <Button asChild size="sm">
              <Link href={`/portal/academy/kurse/${id}`}>
                Details
              </Link>
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
