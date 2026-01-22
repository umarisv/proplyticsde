'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ 
  title = "Fehler aufgetreten", 
  message = "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.", 
  onRetry,
  className 
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="mb-4 rounded-full bg-destructive/10 p-3">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-4 bg-transparent">
          Erneut versuchen
        </Button>
      )}
    </div>
  )
}
