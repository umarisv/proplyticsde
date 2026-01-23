"use client"

import { use, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, MessageCircle, ThumbsUp, Share2, Flag, MoreHorizontal, User, Calendar, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock discussion data
const discussionData = {
  "zinspolitik-diskussion": {
    title: "EZB Zinsentscheidung: Was bedeutet das für Immobilienkäufer?",
    content: "Die EZB hat gestern die Zinsen stabil gehalten. Wie wirkt sich das auf die Immobilienpreise aus? Diskutieren wir über die Auswirkungen auf Käufer und Investoren.",
    author: "Markus_Finanzguru",
    authorAvatar: "",
    date: "2024-01-23",
    category: "Finanzierung",
    tags: ["EZB", "Zinsen", "Immobilienkauf", "2024"],
    replies: [
      {
        id: "reply-1",
        author: "Sarah_Investorin",
        authorAvatar: "",
        content: "Ich denke, die stabile Zinsentscheidung ist erstmal eine gute Nachricht für alle, die noch nicht gekauft haben. Die Finanzierungskosten bleiben kalkulierbar. Allerdings befürchte ich, dass die Preise weiter steigen werden, da die Nachfrage hoch bleibt.",
        date: "2024-01-23T10:15:00Z",
        likes: 8
      },
      {
        id: "reply-2",
        author: "Thomas_Bankberater",
        authorAvatar: "",
        content: "Als Bankberater kann ich bestätigen, dass die Zinsentscheidung für eine gewisse Planungssicherheit sorgt. Viele Kunden warten allerdings noch auf die nächsten Entscheidungen. Bei 3,85% Sollzins sind die Finanzierungen immer noch attraktiv, besonders mit den KfW-Förderungen.",
        date: "2024-01-23T11:30:00Z",
        likes: 12
      },
      {
        id: "reply-3",
        author: "Michael_Makler",
        authorAvatar: "",
        content: "Aus Maklersicht sehe ich, dass die stabilen Zinsen zu mehr Kaufinteresse führen. Allerdings sind die Preisvorstellungen der Verkäufer oft noch zu hoch. Die Marktberichte zeigen eine leichte Abkühlung, aber keine Trendwende.",
        date: "2024-01-23T12:45:00Z",
        likes: 6
      },
      {
        id: "reply-4",
        author: "Anna_Erstkäuferin",
        authorAvatar: "",
        content: "Ich bin Erstkäuferin und habe letzte Woche ein Angebot für meine Traumwohnung bekommen. Bei den aktuellen Zinsen könnte ich mir das leisten, aber ich habe Angst vor weiteren Preissteigerungen. Soll ich zuschlagen oder noch warten?",
        date: "2024-01-23T14:00:00Z",
        likes: 15
      }
    ]
  }
}

interface DiscussionPageProps {
  params: Promise<{ id: string }>
}

export default function DiscussionPage({ params }: DiscussionPageProps) {
  const { id } = use(params)
  const [newReply, setNewReply] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const discussion = discussionData[id as keyof typeof discussionData]

  if (!discussion) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Diskussion nicht gefunden</h1>
          <p className="text-slate-600 mb-6">Die gesuchte Diskussion existiert nicht.</p>
          <Link href="/community">
            <Button>Zurück zur Community</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmitReply = async () => {
    if (!newReply.trim()) return

    setIsSubmitting(true)
    // In a real app, this would submit to an API
    setTimeout(() => {
      setNewReply("")
      setIsSubmitting(false)
      alert("Antwort wurde erfolgreich gepostet!")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/community" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Community
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Discussion */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                {discussion.category}
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 mb-4">
              {discussion.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={discussion.authorAvatar} />
                  <AvatarFallback className="text-xs">{discussion.author[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{discussion.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(discussion.date).toLocaleDateString('de-DE')}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {Math.floor(Math.random() * 100) + 50} Views
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed mb-6">
              {discussion.content}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {discussion.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Hilfreich
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Teilen
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Flag className="w-4 h-4 mr-2" />
                    Melden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="space-y-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900">
            {discussion.replies.length} Antworten
          </h3>

          {discussion.replies.map((reply) => (
            <Card key={reply.id} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={reply.authorAvatar} />
                    <AvatarFallback className="text-xs">{reply.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-slate-900">{reply.author}</span>
                      <span className="text-sm text-slate-500">
                        {new Date(reply.date).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed mb-4">
                      {reply.content}
                    </p>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {reply.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Antworten
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reply Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Antwort schreiben</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Teile deine Gedanken und Erfahrungen..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              className="min-h-[120px] mb-4"
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Markdown wird unterstützt
              </div>
              <Button
                onClick={handleSubmitReply}
                disabled={!newReply.trim() || isSubmitting}
                className="bg-emerald-500 text-white hover:bg-emerald-600"
              >
                {isSubmitting ? "Wird gesendet..." : "Antwort posten"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Related Discussions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Ähnliche Diskussionen
          </h3>
          <div className="space-y-3">
            <Link href="/community/preisentwicklung-fragen" className="block">
              <Card className="hover:shadow-md transition-shadow border-0">
                <CardContent className="p-4">
                  <h4 className="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                    Sind die Immobilienpreise in München noch gerechtfertigt?
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Diskussion über Preis-Nutzen-Relation in Top-Lagen...
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/community/steueroptimierung-tipps" className="block">
              <Card className="hover:shadow-md transition-shadow border-0">
                <CardContent className="p-4">
                  <h4 className="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                    Steuervorteile bei Immobilien: Was nutzt ihr?
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Erfahrungen mit AfA, Werbungskosten und Optimierung...
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}