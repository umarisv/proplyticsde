import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Vollmacht, VollmachtInsert, VollmachtUpdate, Finanzierungsantrag, FinanzierungsantragInsert, Dokument, DokumentInsert } from '@/lib/database.types'

export interface VollmachtInput {
  file: File
  validFrom: string
  validUntil?: string
  bankConnections?: any[]
  permissions?: string[]
}

export interface FinanzierungsantragInput {
  bewertungId: string
  bankName: string
  dokumenteRequired?: string[]
}

export interface DokumentInput {
  file: File
  finanzierungsantragId?: string
  documentType: 'vollmacht' | 'einkommensnachweis' | 'schufa' | 'grundbuchauszug' | 'bankauszug' | 'steuerbescheid' | 'sonstiges'
}

// Vollmachten Management
export async function uploadVollmacht(input: VollmachtInput): Promise<{ data: Vollmacht | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') }
  }

  try {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) {
      return { data: null, error: new Error('User not authenticated') }
    }

    // Upload file to Supabase Storage
    const fileExt = input.file.name.split('.').pop()
    const fileName = `vollmacht-${userId}-${Date.now()}.${fileExt}`
    const filePath = `vollmachten/${userId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, input.file)

    if (uploadError) {
      return { data: null, error: new Error(uploadError.message) }
    }

    // Create database entry
    const vollmachtData: VollmachtInsert = {
      user_id: userId,
      file_name: input.file.name,
      file_path: filePath,
      file_size: input.file.size,
      mime_type: input.file.type,
      valid_from: input.validFrom,
      valid_until: input.validUntil || null,
      bank_connections: input.bankConnections ? JSON.parse(JSON.stringify(input.bankConnections)) : null,
      permissions: input.permissions || []
    }

    const { data, error } = await supabase
      .from('vollmachten')
      .insert(vollmachtData)
      .select()
      .single()

    return { data, error: error ? new Error(error.message) : null }
  } catch (err) {
    console.error('Error uploading vollmacht:', err)
    return { data: null, error: new Error('Fehler beim Hochladen der Vollmacht') }
  }
}

export async function getVollmachten(): Promise<{ data: Vollmacht[] | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null }
  }

  try {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) {
      return { data: [], error: new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('vollmachten')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'aktiv')
      .order('created_at', { ascending: false })

    return { data: data || [], error: error ? new Error(error.message) : null }
  } catch (err) {
    console.error('Error getting vollmachten:', err)
    return { data: [], error: new Error('Fehler beim Laden der Vollmachten') }
  }
}

// Finanzierungsanträge Management
export async function createFinanzierungsantrag(input: FinanzierungsantragInput): Promise<{ data: Finanzierungsantrag | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') }
  }

  try {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) {
      return { data: null, error: new Error('User not authenticated') }
    }

    const antragData: FinanzierungsantragInsert = {
      user_id: userId,
      bewertung_id: input.bewertungId,
      bank_name: input.bankName,
      dokumente_required: input.dokumenteRequired || []
    }

    const { data, error } = await supabase
      .from('finanzierungsantraege')
      .insert(antragData)
      .select()
      .single()

    return { data, error: error ? new Error(error.message) : null }
  } catch (err) {
    console.error('Error creating finanzierungsantrag:', err)
    return { data: null, error: new Error('Fehler beim Erstellen des Finanzierungsantrags') }
  }
}

export async function getFinanzierungsantraege(): Promise<{ data: Finanzierungsantrag[] | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null }
  }

  try {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) {
      return { data: [], error: new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('finanzierungsantraege')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data: data || [], error: error ? new Error(error.message) : null }
  } catch (err) {
    console.error('Error getting finanzierungsantraege:', err)
    return { data: [], error: new Error('Fehler beim Laden der Finanzierungsanträge') }
  }
}

// KI-Agent: Automatische Dokumenten-Anforderung
export async function triggerKIAgent(antragId: string): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase is not configured' }
  }

  try {
    // 1. Antrag laden
    const { data: antrag, error: antragError } = await supabase
      .from('finanzierungsantraege')
      .select('*, bewertungen(*)')
      .eq('id', antragId)
      .single()

    if (antragError || !antrag) {
      return { success: false, message: 'Antrag nicht gefunden' }
    }

    // 2. Vollmachten prüfen
    const { data: vollmachten, error: vollmachtenError } = await supabase
      .from('vollmachten')
      .select('*')
      .eq('user_id', antrag.user_id)
      .eq('status', 'aktiv')

    if (vollmachtenError) {
      return { success: false, message: 'Fehler beim Laden der Vollmachten' }
    }

    if (!vollmachten || vollmachten.length === 0) {
      return { success: false, message: 'Keine gültige Vollmacht gefunden' }
    }

    // 3. KI-Agent Status aktualisieren
    await supabase
      .from('finanzierungsantraege')
      .update({
        ki_agent_status: 'analysiere',
        ki_agent_notes: 'Analysiere Immobilie und erforderliche Dokumente...'
      })
      .eq('id', antragId)

    // 4. Hier würde die KI-Logik implementiert werden:
    // - Analyse der Bewertung
    // - Bestimmung erforderlicher Dokumente
    // - Automatische Anforderung bei Banken via APIs

    // Für jetzt: Simulierte KI-Antwort
    const requiredDocs = ['einkommensnachweis', 'schufa', 'grundbuchauszug']

    await supabase
      .from('finanzierungsantraege')
      .update({
        dokumente_required: requiredDocs,
        ki_agent_status: 'beantrage_dokumente',
        ki_agent_notes: `Erforderliche Dokumente bestimmt: ${requiredDocs.join(', ')}. Beantrage Dokumente automatisch...`
      })
      .eq('id', antragId)

    return { success: true, message: 'KI-Agent wurde gestartet. Dokumente werden automatisch beantragt.' }
  } catch (err) {
    console.error('KI-Agent error:', err)
    return { success: false, message: 'Fehler beim KI-Agent' }
  }
}

// Dokumente Management
export async function uploadDokument(input: DokumentInput): Promise<{ data: Dokument | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') }
  }

  try {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) {
      return { data: null, error: new Error('User not authenticated') }
    }

    // Upload file to Supabase Storage
    const fileExt = input.file.name.split('.').pop()
    const fileName = `dokument-${userId}-${Date.now()}.${fileExt}`
    const filePath = `dokumente/${userId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, input.file)

    if (uploadError) {
      return { data: null, error: new Error(uploadError.message) }
    }

    // Create database entry
    const dokumentData: DokumentInsert = {
      user_id: userId,
      finanzierungsantrag_id: input.finanzierungsantragId || null,
      file_name: input.file.name,
      file_path: filePath,
      file_size: input.file.size,
      mime_type: input.file.type,
      document_type: input.document_type
    }

    const { data, error } = await supabase
      .from('dokumente')
      .insert(dokumentData)
      .select()
      .single()

    return { data, error: error ? new Error(error.message) : null }
  } catch (err) {
    console.error('Error uploading dokument:', err)
    return { data: null, error: new Error('Fehler beim Hochladen des Dokuments') }
  }
}