"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Shield, CreditCard, Bell, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EinstellungenPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <header className="bg-white border-b py-8 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/portal')} className="-ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zum Portal
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihr Konto, Abonnements und Benachrichtigungen.</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Profil Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profil-Informationen
            </CardTitle>
            <CardDescription>Aktualisieren Sie Ihre persönlichen Daten.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="Umar" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" defaultValue="umar@example.de" disabled />
              </div>
            </div>
            <Button>Speichern</Button>
          </CardContent>
        </Card>

        {/* Subscription Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Abonnement
              </CardTitle>
              <Badge>Pro Plan</Badge>
            </div>
            <CardDescription>Verwalten Sie Ihre Zahlungen und Pläne.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Pro Plan (Jährlich)</p>
                  <p className="text-sm text-muted-foreground">Nächste Abrechnung: 15.02.2026</p>
                </div>
                <p className="text-xl font-bold">299 € / Jahr</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">Zahlungsmethode ändern</Button>
              <Button variant="outline" className="text-destructive hover:text-destructive">Abo kündigen</Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Sicherheit
            </CardTitle>
            <CardDescription>Passwort und Sicherheitseinstellungen.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-pass">Aktuelles Passwort</Label>
              <Input id="current-pass" type="password" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-pass">Neues Passwort</Label>
                <Input id="new-pass" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pass">Passwort bestätigen</Label>
                <Input id="confirm-pass" type="password" />
              </div>
            </div>
            <Button variant="secondary">Passwort aktualisieren</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
