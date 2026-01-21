"use client"

import React from "react"

import { useState } from "react"
import { Bot, Send, User, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { Case, ChatMessage } from "@/lib/types"

interface ChatPanelProps {
  activeChatCase: Case | null
  isDragging: boolean
  onDrop: () => void
  onRemoveCase: () => void
}

const initialMessages: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hallo! Ich bin Ihr KI-Agent fur Preis- und Strategieberatung. Ziehen Sie eine Bewertung in den Chat, um diese zu besprechen.",
    timestamp: new Date(),
  },
]

export function ChatPanel({
  activeChatCase,
  isDragging,
  onDrop,
  onRemoveCase,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isOver, setIsOver] = useState(false)

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

    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: activeChatCase
          ? `Bezuglich ${activeChatCase.address}: Der Marktwert von ${new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(activeChatCase.marktwert)} liegt im erwarteten Bereich fur diese Lage. Mochten Sie eine detaillierte Analyse der Vergleichsobjekte oder eine Strategieempfehlung?`
          : "Bitte ziehen Sie eine Bewertung in den Chat, damit ich Ihnen gezielt helfen kann.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    }, 1000)
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

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">KI-Assistent</h2>
            <p className="text-sm text-muted-foreground">Preis und Strategie</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
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
                <AvatarFallback className={message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"}>
                  {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                  message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="space-y-3 border-t p-4">
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
