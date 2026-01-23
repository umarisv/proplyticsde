export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      vollmachten: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          status: 'aktiv' | 'inaktiv' | 'abgelaufen'
          valid_from: string
          valid_until: string | null
          bank_connections: Json | null
          permissions: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          status?: 'aktiv' | 'inaktiv' | 'abgelaufen'
          valid_from: string
          valid_until?: string | null
          bank_connections?: Json | null
          permissions?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          status?: 'aktiv' | 'inaktiv' | 'abgelaufen'
          valid_from?: string
          valid_until?: string | null
          bank_connections?: Json | null
          permissions?: string[]
        }
      }
      finanzierungsantraege: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          bewertung_id: string
          status: 'entwurf' | 'eingereicht' | 'in_pruefung' | 'genehmigt' | 'abgelehnt'
          bank_name: string
          dokumente_required: string[]
          dokumente_submitted: Json | null
          ki_agent_status: 'idle' | 'analysiere' | 'beantrage_dokumente' | 'warte_auf_dokumente' | 'fertig'
          ki_agent_notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          bewertung_id: string
          status?: 'entwurf' | 'eingereicht' | 'in_pruefung' | 'genehmigt' | 'abgelehnt'
          bank_name: string
          dokumente_required?: string[]
          dokumente_submitted?: Json | null
          ki_agent_status?: 'idle' | 'analysiere' | 'beantrage_dokumente' | 'warte_auf_dokumente' | 'fertig'
          ki_agent_notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          bewertung_id?: string
          status?: 'entwurf' | 'eingereicht' | 'in_pruefung' | 'genehmigt' | 'abgelehnt'
          bank_name?: string
          dokumente_required?: string[]
          dokumente_submitted?: Json | null
          ki_agent_status?: 'idle' | 'analysiere' | 'beantrage_dokumente' | 'warte_auf_dokumente' | 'fertig'
          ki_agent_notes?: string | null
        }
      }
      dokumente: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          finanzierungsantrag_id: string | null
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          document_type: 'vollmacht' | 'einkommensnachweis' | 'schufa' | 'grundbuchauszug' | 'bankauszug' | 'steuerbescheid' | 'sonstiges'
          status: 'hochgeladen' | 'in_pruefung' | 'freigegeben' | 'abgelehnt'
          extracted_data: Json | null
          ai_analysis: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          finanzierungsantrag_id?: string | null
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          document_type: 'vollmacht' | 'einkommensnachweis' | 'schufa' | 'grundbuchauszug' | 'bankauszug' | 'steuerbescheid' | 'sonstiges'
          status?: 'hochgeladen' | 'in_pruefung' | 'freigegeben' | 'abgelehnt'
          extracted_data?: Json | null
          ai_analysis?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          finanzierungsantrag_id?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          document_type?: 'vollmacht' | 'einkommensnachweis' | 'schufa' | 'grundbuchauszug' | 'bankauszug' | 'steuerbescheid' | 'sonstiges'
          status?: 'hochgeladen' | 'in_pruefung' | 'freigegeben' | 'abgelehnt'
          extracted_data?: Json | null
          ai_analysis?: Json | null
        }
      }
      bewertungen: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string | null
          adresse: string | null
          plz: string | null
          stadt: string | null
          objekttyp: string | null
          wohnflaeche: number | null
          grundstueck: number | null
          baujahr: number | null
          zustand: string | null
          ausstattung: string | null
          lage: string | null
          energieeffizienz: string | null
          anzahl_wohnungen: number | null
          stellplaetze: number | null
          keller: boolean | null
          balkon: boolean | null
          aufzug: boolean | null
          ist_miete: number | null
          bodenrichtwert: number | null
          kaufpreis: number | null
          ergebnisse: Json | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          adresse?: string | null
          plz?: string | null
          stadt?: string | null
          objekttyp?: string | null
          wohnflaeche?: number | null
          grundstueck?: number | null
          baujahr?: number | null
          zustand?: string | null
          ausstattung?: string | null
          lage?: string | null
          energieeffizienz?: string | null
          anzahl_wohnungen?: number | null
          stellplaetze?: number | null
          keller?: boolean | null
          balkon?: boolean | null
          aufzug?: boolean | null
          ist_miete?: number | null
          bodenrichtwert?: number | null
          kaufpreis?: number | null
          ergebnisse?: Json | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          adresse?: string | null
          plz?: string | null
          stadt?: string | null
          objekttyp?: string | null
          wohnflaeche?: number | null
          grundstueck?: number | null
          baujahr?: number | null
          zustand?: string | null
          ausstattung?: string | null
          lage?: string | null
          energieeffizienz?: string | null
          anzahl_wohnungen?: number | null
          stellplaetze?: number | null
          keller?: boolean | null
          balkon?: boolean | null
          aufzug?: boolean | null
          ist_miete?: number | null
          bodenrichtwert?: number | null
          kaufpreis?: number | null
          ergebnisse?: Json | null
          status?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Bewertung = Database['public']['Tables']['bewertungen']['Row']
export type BewertungInsert = Database['public']['Tables']['bewertungen']['Insert']
export type BewertungUpdate = Database['public']['Tables']['bewertungen']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
