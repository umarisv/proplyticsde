"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send } from "lucide-react"
import { createReply } from "../server-actions"

export function ReplyForm({ postId }: { postId: string }) {
  const [content, setContent] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  function handleSubmit() {
    if (!content.trim()) return
    setError("")

    startTransition(async () => {
      const result = await createReply(postId, content)
      if (result.error) {
        setError(result.error)
      } else {
        setContent("")
      }
    })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <Textarea
          placeholder="Ihre Antwort..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mb-3 min-h-[100px] resize-none"
        />
        {error && (
          <p className="mb-2 text-xs text-destructive">{error}</p>
        )}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isPending}
            size="sm"
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Antworten
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
