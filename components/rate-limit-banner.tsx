'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { getRemainingEvaluations, MAX_EVALUATIONS } from '@/lib/rate-limit'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Info, X } from 'lucide-react'

export function RateLimitBanner() {
  const { user, loading } = useAuth()
  const [remaining, setRemaining] = useState(MAX_EVALUATIONS)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRemaining(getRemainingEvaluations())
    }
  }, [])

  // Don't show for logged-in users or if loading
  if (loading || user || dismissed) {
    return null
  }

  // Only show if user has used at least one evaluation
  if (remaining === MAX_EVALUATIONS) {
    return null
  }

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
      <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-amber-800 dark:text-amber-200">
          {remaining > 0 ? (
            <>Sie haben noch <strong>{remaining}</strong> von {MAX_EVALUATIONS} kostenlosen Bewertungen heute.</>
          ) : (
            <>Sie haben Ihr tägliches Limit erreicht. Erstellen Sie ein kostenloses Konto für unbegrenzte Bewertungen.</>
          )}
        </span>
        <div className="flex items-center gap-2">
          <Link href="/register">
            <Button size="sm" variant="default" className="bg-amber-600 hover:bg-amber-700">
              Kostenlos registrieren
            </Button>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-amber-600 hover:text-amber-800"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
