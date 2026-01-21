import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Bewertung, BewertungInsert, BewertungUpdate } from '@/lib/database.types'
import type { AnalyseFormData, AnalyseResultData } from '@/lib/types'

export interface BewertungInput {
  formData: AnalyseFormData
  resultData: AnalyseResultData
  adresse?: string
  userId?: string | null
}

// Convert form data to database format
function formDataToDbFormat(input: BewertungInput): BewertungInsert {
  const { formData, resultData, adresse, userId } = input
  
  return {
    adresse: adresse || `${formData.plz} ${formData.stadt}`,
    plz: formData.plz,
    stadt: formData.stadt,
    objekttyp: formData.objekttyp,
    wohnflaeche: parseFloat(formData.wohnflaeche) || null,
    grundstueck: parseFloat(formData.grundstueck) || null,
    baujahr: parseInt(formData.baujahr) || null,
    zustand: formData.zustand,
    ausstattung: formData.ausstattung,
    lage: formData.lage,
    energieeffizienz: formData.energieeffizienz,
    anzahl_wohnungen: parseInt(formData.anzahlWohnungen) || null,
    stellplaetze: parseInt(formData.stellplaetze) || null,
    keller: formData.keller,
    balkon: formData.balkon,
    aufzug: formData.aufzug,
    ist_miete: parseFloat(formData.istMiete) || null,
    bodenrichtwert: parseFloat(formData.bodenrichtwert) || null,
    kaufpreis: parseFloat(formData.kaufpreis) || null,
    ergebnisse: resultData as unknown as Record<string, unknown>,
    status: 'aktiv',
    user_id: userId || null,
  }
}

// Convert database format back to form data
export function dbFormatToFormData(bewertung: Bewertung): AnalyseFormData {
  return {
    plz: bewertung.plz || '',
    stadt: bewertung.stadt || '',
    objekttyp: bewertung.objekttyp || '',
    wohnflaeche: bewertung.wohnflaeche?.toString() || '',
    grundstueck: bewertung.grundstueck?.toString() || '',
    baujahr: bewertung.baujahr?.toString() || '',
    zustand: bewertung.zustand || '',
    ausstattung: (bewertung.ausstattung as AnalyseFormData['ausstattung']) || 'mittel',
    lage: (bewertung.lage as AnalyseFormData['lage']) || 'mittel',
    energieeffizienz: bewertung.energieeffizienz || 'unbekannt',
    anzahlWohnungen: bewertung.anzahl_wohnungen?.toString() || '',
    stellplaetze: bewertung.stellplaetze?.toString() || '',
    keller: bewertung.keller || false,
    balkon: bewertung.balkon || false,
    aufzug: bewertung.aufzug || false,
    istMiete: bewertung.ist_miete?.toString() || '',
    bodenrichtwert: bewertung.bodenrichtwert?.toString() || '',
    kaufpreis: bewertung.kaufpreis?.toString() || '',
  }
}

// Get current user ID
async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

// Save a new bewertung
export async function saveBewertung(input: BewertungInput): Promise<{ data: Bewertung | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') }
  }

  // Get current user ID if not provided
  const userId = input.userId ?? await getCurrentUserId()
  const dbData = formDataToDbFormat({ ...input, userId })
  
  const { data, error } = await supabase
    .from('bewertungen')
    .insert(dbData)
    .select()
    .single()

  return { data, error: error ? new Error(error.message) : null }
}

// Get all bewertungen (filtered by user if authenticated)
export async function getBewertungen(): Promise<{ data: Bewertung[] | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') }
  }

  const userId = await getCurrentUserId()
  
  let query = supabase
    .from('bewertungen')
    .select('*')
    .eq('status', 'aktiv')
  
  // If user is logged in, show only their bewertungen
  // Otherwise, RLS will handle visibility
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })

  return { data, error: error ? new Error(error.message) : null }
}

// Get a single bewertung by ID
export async function getBewertungById(id: string): Promise<{ data: Bewertung | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') }
  }

  const { data, error } = await supabase
    .from('bewertungen')
    .select('*')
    .eq('id', id)
    .single()

  return { data, error: error ? new Error(error.message) : null }
}

// Update a bewertung
export async function updateBewertung(
  id: string, 
  input: Partial<BewertungInput>
): Promise<{ data: Bewertung | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') }
  }

  const updateData: BewertungUpdate = {
    updated_at: new Date().toISOString(),
  }

  if (input.formData) {
    const { formData } = input
    updateData.plz = formData.plz
    updateData.stadt = formData.stadt
    updateData.objekttyp = formData.objekttyp
    updateData.wohnflaeche = parseFloat(formData.wohnflaeche) || null
    updateData.grundstueck = parseFloat(formData.grundstueck) || null
    updateData.baujahr = parseInt(formData.baujahr) || null
    updateData.zustand = formData.zustand
    updateData.ausstattung = formData.ausstattung
    updateData.lage = formData.lage
    updateData.energieeffizienz = formData.energieeffizienz
    updateData.anzahl_wohnungen = parseInt(formData.anzahlWohnungen) || null
    updateData.stellplaetze = parseInt(formData.stellplaetze) || null
    updateData.keller = formData.keller
    updateData.balkon = formData.balkon
    updateData.aufzug = formData.aufzug
    updateData.ist_miete = parseFloat(formData.istMiete) || null
    updateData.bodenrichtwert = parseFloat(formData.bodenrichtwert) || null
    updateData.kaufpreis = parseFloat(formData.kaufpreis) || null
  }

  if (input.resultData) {
    updateData.ergebnisse = input.resultData as unknown as Record<string, unknown>
  }

  if (input.adresse) {
    updateData.adresse = input.adresse
  }

  const { data, error } = await supabase
    .from('bewertungen')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  return { data, error: error ? new Error(error.message) : null }
}

// Delete (archive) a bewertung
export async function deleteBewertung(id: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase is not configured') }
  }

  const { error } = await supabase
    .from('bewertungen')
    .update({ status: 'archiviert' })
    .eq('id', id)

  return { error: error ? new Error(error.message) : null }
}

// Permanently delete a bewertung
export async function hardDeleteBewertung(id: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase is not configured') }
  }

  const { error } = await supabase
    .from('bewertungen')
    .delete()
    .eq('id', id)

  return { error: error ? new Error(error.message) : null }
}

// Duplicate a bewertung
export async function duplicateBewertung(id: string): Promise<{ data: Bewertung | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') }
  }

  // First get the original
  const { data: original, error: fetchError } = await getBewertungById(id)
  if (fetchError || !original) {
    return { data: null, error: fetchError || new Error('Bewertung not found') }
  }

  // Get current user ID (duplicate should belong to current user)
  const userId = await getCurrentUserId()

  // Create a copy without id and timestamps
  const { id: _, created_at, updated_at, ...copyData } = original
  const newData: BewertungInsert = {
    ...copyData,
    adresse: `${original.adresse} (Kopie)`,
    user_id: userId, // Assign to current user
  }

  const { data, error } = await supabase
    .from('bewertungen')
    .insert(newData)
    .select()
    .single()

  return { data, error: error ? new Error(error.message) : null }
}
