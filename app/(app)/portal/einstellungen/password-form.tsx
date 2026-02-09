"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Check } from "lucide-react"
import { updatePassword } from "./actions"

export function PasswordForm() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setSaving(true)
    setError(null)
    setSaved(false)

    const result = await updatePassword(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setSaved(true)
      formRef.current?.reset()
      setTimeout(() => setSaved(false), 2000)
    }

    setSaving(false)
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="new_password">Neues Passwort</Label>
          <Input id="new_password" name="new_password" type="password" placeholder="Min. 8 Zeichen" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm_password">Passwort bestaetigen</Label>
          <Input id="confirm_password" name="confirm_password" type="password" placeholder="Passwort wiederholen" />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={saving} variant="secondary">
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Aktualisieren...
          </>
        ) : saved ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Aktualisiert
          </>
        ) : (
          "Passwort aktualisieren"
        )}
      </Button>
    </form>
  )
}
