import { Suspense } from 'react'
import { VollmachtManager } from '@/components/vollmacht-manager'
import { RateLimitBanner } from '@/components/rate-limit-banner'

export default function FinanzierungPage() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <RateLimitBanner />
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold tracking-tight">Finanzierung</h1>
          <span className="ml-2 text-sm text-muted-foreground">Vollmacht-Management</span>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Lade Finanzierungs-Tools...</p>
            </div>
          </div>
        }>
          <VollmachtManager />
        </Suspense>
      </main>
    </div>
  )
}