"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Automatische Weiterleitung zum Dashboard
    router.push("/dashboard")
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">proplytics.de</h1>
        <p className="text-muted-foreground">Weiterleitung zum Dashboard...</p>
      </div>
    </div>
  )
}
