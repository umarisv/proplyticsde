'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Suspense } from 'react'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push(next)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router, next])

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-pulse">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">E-Mail bestätigt!</CardTitle>
        <CardDescription className="text-base">
          Ihr Konto wurde erfolgreich aktiviert.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground">
          Sie werden in <strong>{countdown}</strong> Sekunden weitergeleitet...
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href={next}>
          <Button>
            Jetzt zum Dashboard
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <Card className="shadow-xl border-0">
        <CardContent className="p-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
