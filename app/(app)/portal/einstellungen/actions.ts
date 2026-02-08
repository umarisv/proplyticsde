"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Nicht authentifiziert" }
  }

  const fullName = formData.get("full_name") as string

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      full_name: fullName,
      email: user.email,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/portal/einstellungen")
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Nicht authentifiziert" }
  }

  const newPassword = formData.get("new_password") as string
  const confirmPassword = formData.get("confirm_password") as string

  if (newPassword !== confirmPassword) {
    return { error: "Passwoerter stimmen nicht ueberein" }
  }

  if (newPassword.length < 8) {
    return { error: "Passwort muss mindestens 8 Zeichen lang sein" }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Nicht authentifiziert" }
  }

  // Archive all bewertungen
  await supabase
    .from("bewertungen")
    .update({ status: "archiviert" })
    .eq("user_id", user.id)

  // Sign out
  await supabase.auth.signOut()

  return { success: true, redirect: "/" }
}
