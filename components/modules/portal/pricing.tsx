"use client"

import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { loadStripe } from "@stripe/stripe-js"

const PLANS = [
  {
    name: "Free",
    price: "0",
    description: "Ideal für Einsteiger und erste Gehversuche.",
    features: ["3 Bewertungen pro Monat", "Einfacher PDF-Report", "Academy Basis-Zugang", "Marktplatz-Zugang"],
    priceId: null,
    buttonText: "Kostenlos starten"
  },
  {
    name: "Pro",
    price: "29",
    description: "Für ambitionierte Investoren und Profis.",
    features: ["Unbegrenzte Bewertungen", "Vollständige Finanzierungsmappe", "Alle Academy Kurse", "Premium Support", "Erweiterte Risikoanalyse"],
    priceId: "price_pro_id", // In Produktion durch echte ID ersetzen
    buttonText: "Pro wählen",
    highlight: true
  },
  {
    name: "Enterprise",
    price: "99",
    description: "Für Teams und Immobilien-Unternehmen.",
    features: ["Alles aus Pro", "Team-Accounts (bis 5 Nutzer)", "White-Label Reports", "API-Zugang", "Persönlicher Key-Account Manager"],
    priceId: "price_enterprise_id", // In Produktion durch echte ID ersetzen
    buttonText: "Kontakt aufnehmen"
  }
]

export function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string | null, planName: string) => {
    if (!priceId) return
    
    setLoading(planName)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          successUrl: window.location.origin + '/portal?success=true',
          cancelUrl: window.location.origin + '/portal/pricing',
        }),
      })

      const { sessionId, error } = await response.json()
      if (error) throw new Error(error)

      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="py-12 px-6">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Wählen Sie den passenden Plan</h1>
        <p className="text-muted-foreground text-lg">
          Skalieren Sie Ihre Immobilien-Investments mit den richtigen Tools und Expertenwissen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {PLANS.map((plan) => (
          <Card 
            key={plan.name} 
            className={`flex flex-col relative ${plan.highlight ? 'border-primary shadow-xl scale-105 z-10' : 'border-border'}`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Empfohlen
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-bold">{plan.price}€</span>
                <span className="text-muted-foreground text-sm">/ Monat</span>
              </div>
              <CardDescription className="pt-4">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <div className="mt-1 bg-primary/10 rounded-full p-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant={plan.highlight ? "default" : "outline"} 
                className="w-full h-11 font-bold"
                onClick={() => handleSubscribe(plan.priceId, plan.name)}
                disabled={!!loading}
              >
                {loading === plan.name ? <Loader2 className="w-4 h-4 animate-spin" /> : plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
