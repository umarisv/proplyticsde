export default function FinanzierungPage() {
  console.log('🎯 Finanzierung-Seite wird geladen!')

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary">🎯 Finanzierung</h1>
          <span className="ml-2 text-sm text-muted-foreground">Route funktioniert!</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold mb-4">Finanzierung-System</h2>
          <p className="text-muted-foreground mb-6">
            Die Route funktioniert! Vollmacht-Management kommt bald...
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-mono">
              ✅ Route: /finanzierung<br/>
              ✅ Next.js lädt<br/>
              ✅ Container funktioniert
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}