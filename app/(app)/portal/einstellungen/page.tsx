import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Shield, CreditCard, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { updateProfile, updatePassword } from "./actions"
import { ProfileForm } from "./profile-form"
import { PasswordForm } from "./password-form"

export default async function EinstellungenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Load profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const fullName = profile?.full_name ?? ""
  const email = user.email ?? ""

  return (
    <div className="bg-background pb-20">
      <div className="border-b border-border bg-card py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/portal">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurueck zum Portal
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihr Konto und Sicherheitseinstellungen.</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-8">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profil-Informationen
            </CardTitle>
            <CardDescription>Aktualisieren Sie Ihre persoenlichen Daten.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm fullName={fullName} email={email} />
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Abonnement
              </CardTitle>
              <Badge variant="secondary">Free Plan</Badge>
            </div>
            <CardDescription>Verwalten Sie Ihre Zahlungen und Plaene.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-secondary/50 p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Kostenloser Zugang</p>
                  <p className="text-sm text-muted-foreground">Basis-Funktionen fuer Immobilienanalysen</p>
                </div>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/analyse">Upgrade auf Pro</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Sicherheit
            </CardTitle>
            <CardDescription>Passwort und Sicherheitseinstellungen.</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
