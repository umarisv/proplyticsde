import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface ImmobilieDaten {
  adresse: string
  objekttyp: string
  wohnflaeche: number
  grundstueck: number
  baujahr: number
  zustand: string
  lage: string
  marktwert: number
  financing_amount: number
}

export interface VollmachtDaten {
  banken: string[]
  permissions: string[]
  valid_until: string
}

export interface KIAgentResult {
  success: boolean
  message: string
  required_documents: string[]
  recommended_banks: string[]
  risk_assessment: {
    score: number
    factors: string[]
    recommendations: string[]
  }
  next_steps: string[]
}

/**
 * KI-Agent für automatische Finanzierungsunterlagen-Anforderung
 * Analysiert Immobilie und beantragt fehlende Dokumente automatisch
 */
export class FinanzierungsAgent {
  private userId: string
  private antragId: string

  constructor(userId: string, antragId: string) {
    this.userId = userId
    this.antragId = antragId
  }

  /**
   * Haupt-Workflow: Vollständige Finanzierungsanalyse und Dokumenten-Anforderung
   */
  async processFinanzierungsantrag(
    immobilie: ImmobilieDaten,
    vollmacht: VollmachtDaten
  ): Promise<KIAgentResult> {
    try {
      // Schritt 1: Immobilie analysieren
      await this.updateStatus('analysiere', 'Analysiere Immobilienbewertung und Marktbedingungen...')

      const analyse = await this.analysiereImmobilie(immobilie)

      // Schritt 2: Erforderliche Dokumente bestimmen
      const requiredDocs = await this.bestimmeErforderlicheDokumente(immobilie, analyse)

      // Schritt 3: Risiko bewerten
      const riskAssessment = await this.bewerteRisiko(immobilie, analyse)

      // Schritt 4: Banken empfehlen
      const recommendedBanks = await this.empfehleBanken(immobilie, vollmacht, riskAssessment)

      // Schritt 5: Dokumente automatisch beantragen
      await this.updateStatus('beantrage_dokumente', 'Beantrage fehlende Dokumente automatisch bei Banken...')
      const antragErfolg = await this.beantrageDokumenteAutomatisch(requiredDocs, vollmacht, recommendedBanks)

      // Schritt 6: Status aktualisieren
      const finalStatus = antragErfolg ? 'warte_auf_dokumente' : 'fertig'
      const message = antragErfolg
        ? 'Dokumente wurden erfolgreich beantragt. Warte auf Bearbeitung...'
        : 'Manuelle Nachreichung erforderlich.'

      await this.updateStatus(finalStatus, message)

      return {
        success: antragErfolg,
        message,
        required_documents: requiredDocs,
        recommended_banks: recommendedBanks,
        risk_assessment: riskAssessment,
        next_steps: this.generiereNextSteps(antragErfolg, requiredDocs)
      }

    } catch (error) {
      console.error('KI-Agent Fehler:', error)
      await this.updateStatus('idle', `Fehler: ${error.message}`)
      return {
        success: false,
        message: `KI-Agent Fehler: ${error.message}`,
        required_documents: [],
        recommended_banks: [],
        risk_assessment: { score: 0, factors: [], recommendations: [] },
        next_steps: ['Fehler beheben und erneut versuchen']
      }
    }
  }

  /**
   * Schritt 1: Immobilie mit KI analysieren
   */
  private async analysiereImmobilie(immobilie: ImmobilieDaten) {
    const prompt = `
    Analysiere diese Immobilie für eine Finanzierung:

    Adresse: ${immobilie.adresse}
    Objekttyp: ${immobilie.objekttyp}
    Wohnfläche: ${immobilie.wohnflaeche} m²
    Grundstück: ${immobilie.grundstueck} m²
    Baujahr: ${immobilie.baujahr}
    Zustand: ${immobilie.zustand}
    Lage: ${immobilie.lage}
    Marktwert: ${immobilie.marktwert}€
    Finanzierungsbetrag: ${immobilie.financing_amount}€

    Erstelle eine detaillierte Analyse:
    1. Stärken der Immobilie
    2. Risikofaktoren
    3. Marktsituation
    4. Finanzierungschancen
    5. Empfohlene Bonität des Kreditnehmers

    Antworte im JSON-Format.
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    return JSON.parse(response.choices[0].message.content)
  }

  /**
   * Schritt 2: Erforderliche Dokumente bestimmen
   */
  private async bestimmeErforderlicheDokumente(
    immobilie: ImmobilieDaten,
    analyse: any
  ): Promise<string[]> {
    const baseDocuments = [
      'einkommensnachweis',
      'schufa',
      'personalausweis'
    ]

    // Zusätzliche Dokumente basierend auf Immobilientyp
    if (immobilie.objekttyp === 'mfh') {
      baseDocuments.push('grundbuchauszug', 'mietvertraege', 'nebenkostenabrechnung')
    } else if (immobilie.objekttyp === 'efh') {
      baseDocuments.push('grundbuchauszug', 'bauzeichnungen')
    }

    // Dokumente basierend auf Analyse
    if (analyse.risikofaktoren?.includes('alter')) {
      baseDocuments.push('baubeschreibung', 'energetisches_gutachten')
    }

    if (immobilie.financing_amount > immobilie.marktwert * 0.8) {
      baseDocuments.push('vermoegensnachweis', 'schenkungserklaerung')
    }

    return [...new Set(baseDocuments)] // Duplikate entfernen
  }

  /**
   * Schritt 3: Risiko bewerten
   */
  private async bewerteRisiko(immobilie: ImmobilieDaten, analyse: any) {
    // KI-basierte Risikobewertung
    const prompt = `
    Bewerte das Finanzierungsrisiko für diese Immobilie:

    Immobilie: ${JSON.stringify(immobilie)}
    Analyse: ${JSON.stringify(analyse)}

    Gib eine Risikobewertung von 1-10 (1=niedrig, 10=hoch) und begründe sie.
    Antworte im JSON-Format mit: score, factors, recommendations
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" }
    })

    return JSON.parse(response.choices[0].message.content)
  }

  /**
   * Schritt 4: Banken empfehlen
   */
  private async empfehleBanken(
    immobilie: ImmobilieDaten,
    vollmacht: VollmachtDaten,
    riskAssessment: any
  ): Promise<string[]> {
    // Berücksichtige Vollmacht-Einschränkungen
    const availableBanks = vollmacht.banken || []

    if (availableBanks.length === 0) {
      // Fallback: Beliebte deutsche Banken
      return ['Sparkasse', 'Volksbank', 'Deutsche Bank', 'Commerzbank']
    }

    // Priorisiere Banken basierend auf Risiko und Immobilientyp
    const prioritizedBanks = availableBanks.filter(bank => {
      if (riskAssessment.score > 7) {
        // Hohes Risiko: Konservative Banken
        return ['Sparkasse', 'Volksbank'].includes(bank)
      } else {
        // Normales Risiko: Alle verfügbaren Banken
        return true
      }
    })

    return prioritizedBanks.slice(0, 3) // Max 3 Banken
  }

  /**
   * Schritt 5: Dokumente automatisch beantragen
   */
  private async beantrageDokumenteAutomatisch(
    requiredDocs: string[],
    vollmacht: VollmachtDaten,
    banks: string[]
  ): Promise<boolean> {
    // Hier würde die echte Banken-API-Integration implementiert werden
    // Für jetzt: Simulierte Beantragung

    console.log('🚀 Beantrage Dokumente automatisch:', {
      dokumente: requiredDocs,
      banken: banks,
      vollmacht: vollmacht
    })

    // Simuliere API-Calls zu Banken
    for (const bank of banks) {
      for (const doc of requiredDocs) {
        // Hier würden echte API-Calls stattfinden
        console.log(`📄 Beantrage ${doc} bei ${bank}`)

        // Simuliere Verzögerung
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Erfolgreich beantragt
    return true
  }

  /**
   * Next Steps generieren
   */
  private generiereNextSteps(antragErfolg: boolean, requiredDocs: string[]): string[] {
    if (antragErfolg) {
      return [
        'Warten Sie 2-5 Werktage auf die Dokumente',
        'Überprüfen Sie regelmäßig Ihr Dashboard',
        'Bei Fragen kontaktieren Sie Ihren Berater'
      ]
    } else {
      return [
        'Fehlende Dokumente manuell beschaffen',
        'Bei Bedarf Berater kontaktieren',
        'Dokumente im Dashboard hochladen'
      ]
    }
  }

  /**
   * Status in Datenbank aktualisieren
   */
  private async updateStatus(status: string, notes: string) {
    await supabase
      .from('finanzierungsantraege')
      .update({
        ki_agent_status: status,
        ki_agent_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', this.antragId)
  }
}

/**
 * Convenience Funktion für KI-Agent Aufruf
 */
export async function startFinanzierungsKIAgent(
  userId: string,
  antragId: string,
  immobilie: ImmobilieDaten,
  vollmacht: VollmachtDaten
): Promise<KIAgentResult> {
  const agent = new FinanzierungsAgent(userId, antragId)
  return await agent.processFinanzierungsantrag(immobilie, vollmacht)
}