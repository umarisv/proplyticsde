"use client"

import React, { useEffect, useRef } from "react"

import { useState } from "react"
import { Bot, Send, User, X, Sparkles, TrendingUp, AlertTriangle, Target, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { analyzeRisk, generateRiskSummary, type RiskAnalysisResult } from "@/lib/risk-engine"
import type { Case, ChatMessage, AnalyseFormData, AnalyseResultData } from "@/lib/types"

interface ChatPanelProps {
  activeChatCase: Case | null
  isDragging: boolean
  onDrop: () => void
  onRemoveCase: () => void
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)

const initialMessages: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hallo! Ich bin Ihr KI-Agent für Preis- und Risikoanalyse. Ziehen Sie eine Bewertung in den Chat, um eine stochastische Risikomodellierung durchzuführen.",
    timestamp: new Date(),
  },
]

// Simulierte KI-Antworten basierend auf Kontext
function generateAIResponse(
  userInput: string, 
  caseData: Case | null,
  riskData: RiskAnalysisResult | null
): string {
  const input = userInput.toLowerCase()
  
  if (!caseData) {
    return "Bitte ziehen Sie zunächst eine Bewertung in den Chat, damit ich Ihnen eine fundierte Analyse liefern kann."
  }

  // Risiko-bezogene Fragen
  if (input.includes('risiko') || input.includes('sicher') || input.includes('gefahr')) {
    if (riskData) {
      const riskLevel = riskData.riskCategory
      const cv = (riskData.coefficientOfVariation * 100).toFixed(1)
      return `**Risikoanalyse für ${caseData.address}:**\n\n` +
        `Das Gesamtrisiko ist **${riskLevel}** (Score: ${riskData.overallRiskScore}/100).\n\n` +
        `Der Variationskoeffizient von ${cv}% zeigt eine ${parseFloat(cv) < 10 ? 'geringe' : parseFloat(cv) < 15 ? 'moderate' : 'erhöhte'} Preisunsicherheit.\n\n` +
        `**90% Konfidenzintervall:**\n${formatCurrency(riskData.confidence90.min)} - ${formatCurrency(riskData.confidence90.max)}\n\n` +
        `${riskData.riskFactors.length > 0 ? 'Hauptrisikofaktoren: ' + riskData.riskFactors.map(f => f.name).join(', ') : 'Keine kritischen Risikofaktoren identifiziert.'}`
    }
  }

  // Preis-bezogene Fragen
  if (input.includes('preis') || input.includes('wert') || input.includes('marktwert')) {
    return `**Preisanalyse für ${caseData.address}:**\n\n` +
      `Ermittelter Marktwert: **${formatCurrency(caseData.marktwert)}**\n\n` +
      `- Ertragswert: ${formatCurrency(caseData.ertragswert)}\n` +
      `- Sachwert: ${formatCurrency(caseData.sachwert)}\n` +
      `- Faktor: ${caseData.faktor.toFixed(1)}x\n` +
      `- Brutto-Rendite: ${caseData.rendite.toFixed(2)}%\n\n` +
      (riskData ? `Mit 90% Wahrscheinlichkeit liegt der tatsächliche Wert zwischen ${formatCurrency(riskData.confidence90.min)} und ${formatCurrency(riskData.confidence90.max)}.` : '')
  }

  // Verhandlungs-bezogene Fragen
  if (input.includes('verhandl') || input.includes('strategie') || input.includes('kaufen')) {
    if (riskData && caseData.bodenrichtwert > 0) {
      const kaufpreis = caseData.bodenrichtwert // Placeholder
      const probAbove = riskData.probabilityAboveAsking
      return `**Verhandlungsstrategie:**\n\n` +
        `Bei einem Marktwert von ${formatCurrency(caseData.marktwert)} empfehle ich:\n\n` +
        `1. **Einstiegspreis:** ${formatCurrency(riskData.percentiles.p25)} (25. Perzentil)\n` +
        `2. **Zielpreis:** ${formatCurrency(riskData.percentiles.p50)} (Median)\n` +
        `3. **Maximalpreis:** ${formatCurrency(riskData.percentiles.p75)} (75. Perzentil)\n\n` +
        `Das ${riskData.riskCategory}e Risikoprofil ${riskData.overallRiskScore < 40 ? 'unterstützt' : 'erfordert Vorsicht bei'} einer Investitionsentscheidung.`
    }
  }

  // Rendite-bezogene Fragen
  if (input.includes('rendite') || input.includes('ertrag') || input.includes('cashflow')) {
    return `**Renditeanalyse für ${caseData.address}:**\n\n` +
      `- Brutto-Rendite: **${caseData.rendite.toFixed(2)}%**\n` +
      `- Ertragswert: ${formatCurrency(caseData.ertragswert)}\n` +
      `- Faktor: ${caseData.faktor.toFixed(1)}x (${caseData.faktor < 20 ? 'günstig' : caseData.faktor < 25 ? 'marktüblich' : 'teuer'})\n\n` +
      `${caseData.rendite >= 5 ? '✅ Überdurchschnittliche Rendite' : caseData.rendite >= 3.5 ? '⚠️ Durchschnittliche Rendite' : '❌ Unterdurchschnittliche Rendite'}`
  }

  // Allgemeine Fragen
  return `**Analyse für ${caseData.address}:**\n\n` +
    `Ich habe folgende Daten zu dieser Immobilie:\n\n` +
    `- Marktwert: ${formatCurrency(caseData.marktwert)}\n` +
    `- Objekttyp: ${caseData.objekttyp}\n` +
    `- Baujahr: ${caseData.baujahr}\n` +
    `- Wohnfläche: ${caseData.wohnflaeche} m²\n` +
    `- Rendite: ${caseData.rendite.toFixed(2)}%\n\n` +
    `Fragen Sie mich nach **Risiko**, **Preis**, **Rendite** oder **Verhandlungsstrategie** für detailliertere Analysen.`
}

export function ChatPanel({
  activeChatCase,
  isDragging,
  onDrop,
  onRemoveCase,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isOver, setIsOver] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysisResult | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Führe Risikoanalyse durch wenn Case geladen wird
  useEffect(() => {
    if (activeChatCase) {
      // Simuliere FormData und ResultData aus Case
      const mockFormData: AnalyseFormData = {
        plz: activeChatCase.zip,
        stadt: activeChatCase.city,
        objekttyp: activeChatCase.objekttyp,
        wohnflaeche: String(activeChatCase.wohnflaeche),
        grundstueck: String(activeChatCase.grundstueck),
        baujahr: String(activeChatCase.baujahr),
        zustand: 'durchschnitt',
        ausstattung: 'mittel',
        lage: 'mittel',
        energieeffizienz: 'unbekannt',
        anzahlWohnungen: '',
        stellplaetze: '',
        keller: false,
        balkon: false,
        aufzug: false,
        istMiete: String(activeChatCase.istMiete),
        bodenrichtwert: String(activeChatCase.bodenrichtwert),
        kaufpreis: '',
      }

      const mockResultData: AnalyseResultData = {
        marktwert: activeChatCase.marktwert,
        verkehrswert: activeChatCase.marktwert,
        ertragswert: activeChatCase.ertragswert,
        sachwert: activeChatCase.sachwert,
        faktor: activeChatCase.faktor,
        bruttoRendite: activeChatCase.rendite,
        nettoRendite: activeChatCase.rendite * 0.7,
        qmPreis: activeChatCase.marktwert / activeChatCase.wohnflaeche,
        cashflowMonat: 0,
        eigenkapitalrendite: 0,
        marktMiete: activeChatCase.istMiete,
        mietpotenzial: 0,
      }

      const analysis = analyzeRisk(mockFormData, mockResultData)
      setRiskAnalysis(analysis)

      // Auto-Nachricht mit Risikoanalyse
      const riskMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `**${activeChatCase.address} geladen.**\n\n` +
          `Ich habe eine stochastische Risikoanalyse (Monte-Carlo, n=10.000) durchgeführt:\n\n` +
          `- **Erwartungswert:** ${formatCurrency(analysis.expectedValue)}\n` +
          `- **Risikokategorie:** ${analysis.riskCategory} (${analysis.overallRiskScore}/100)\n` +
          `- **90% Konfidenz:** ${formatCurrency(analysis.confidence90.min)} - ${formatCurrency(analysis.confidence90.max)}\n\n` +
          `Fragen Sie mich nach Details zu Risiko, Preis, Rendite oder Verhandlungsstrategie.`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, riskMessage])
    }
  }, [activeChatCase])

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulierte Verzögerung für "Tippen"
    setTimeout(() => {
      const response = generateAIResponse(input, activeChatCase, riskAnalysis)
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 800 + Math.random() * 700)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(true)
  }

  const handleDragLeave = () => {
    setIsOver(false)
  }

  const handleDropEvent = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)
    onDrop()
  }

  // Markdown-ähnliche Formatierung für Nachrichten
  const formatMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold
      const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Lists
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4" dangerouslySetInnerHTML={{ __html: boldFormatted.slice(2) }} />
      }
      if (line.match(/^\d+\.\s/)) {
        return <li key={i} className="ml-4 list-decimal" dangerouslySetInnerHTML={{ __html: boldFormatted.replace(/^\d+\.\s/, '') }} />
      }
      return <p key={i} dangerouslySetInnerHTML={{ __html: boldFormatted }} />
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">KI-Risikoagent</h2>
            <p className="text-sm text-muted-foreground">
              {riskAnalysis ? (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Risiko: {riskAnalysis.riskCategory} ({riskAnalysis.overallRiskScore}/100)
                </span>
              ) : (
                "Stochastische Analyse"
              )}
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" && "flex-row-reverse"
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className={message.role === "assistant" ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground" : "bg-muted"}>
                  {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-4 py-3 text-sm",
                  message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
                )}
              >
                <div className="space-y-1 [&_strong]:font-semibold [&_strong]:text-primary">
                  {formatMessage(message.content)}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-4 py-3 text-sm">
                <div className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-muted-foreground">Analysiere...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="space-y-3 border-t p-4 flex-shrink-0">
        {activeChatCase ? (
          <Card className="bg-muted/50">
            <CardContent className="flex items-center justify-between p-3">
              <div className="flex min-w-0 items-center gap-2">
                <Badge variant="secondary" className="shrink-0 text-xs">
                  Geladen
                </Badge>
                <span className="truncate text-sm font-medium">
                  {activeChatCase.address}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={onRemoveCase}
              >
                <X className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div
            className={cn(
              "rounded-lg border-2 border-dashed p-4 text-center transition-colors",
              isDragging || isOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropEvent}
          >
            <p className="text-sm text-muted-foreground">
              {isDragging
                ? "Hier ablegen"
                : "Bewertung hierher ziehen"}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            placeholder="Nachricht eingeben..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            className="min-h-[44px] resize-none"
            rows={1}
          />
          <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Senden</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
