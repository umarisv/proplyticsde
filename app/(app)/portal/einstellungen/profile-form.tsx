"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Check } from "lucide-react"
import { updateProfile } from "./actions"

interface ProfileFormProps {
  fullName: string
  email: string
}

export function ProfileForm({ fullName, email }: ProfileFormProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setSaving(true)
    setError(null)
    setSaved(false)

    const result = await updateProfile(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }

    setSaving(false)
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Name</Label>
          <Input id="full_name" name="full_name" defaultValue={fullName} placeholder="Ihr Name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input id="email" defaultValue={email} disabled className="text-muted-foreground" />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Speichern...
          </>
        ) : saved ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Gespeichert
          </>
        ) : (
          "Speichern"
        )}
      </Button>
    </form>
  )
}
