"use client"

import { PartnerCard } from "./PartnerCard"

const PARTNERS = [
  {
    id: "p1",
    name: "Maler-Meister Düsseldorf",
    category: "Handwerker",
    subcategory: "Maler & Lackierer",
    rating: 4.9,
    reviews: 124,
    regions: ["Düsseldorf", "Neuss", "Ratingen"],
    logo: "https://cdn-icons-png.flaticon.com/512/3062/3062456.png",
    isVerified: true,
    description: "Spezialisiert auf hochwertige Innenraumgestaltung und Fassadensanierung für Mehrfamilienhäuser."
  },
  {
    id: "p2",
    name: "ImmoCare Verwaltung",
    category: "Hausverwaltung",
    subcategory: "A-Z Verwaltung",
    rating: 4.7,
    reviews: 89,
    regions: ["Köln", "Bonn", "Leverkusen"],
    logo: "https://cdn-icons-png.flaticon.com/512/6122/6122045.png",
    isVerified: true,
    description: "Digitale Hausverwaltung mit Fokus auf Kosteneffizienz und Werterhalt Ihres Portfolios."
  },
  {
    id: "p3",
    name: "Elektro-Blitz GmbH",
    category: "Handwerker",
    subcategory: "Elektrotechnik",
    rating: 4.8,
    reviews: 156,
    regions: ["Essen", "Duisburg", "Bochum"],
    logo: "https://cdn-icons-png.flaticon.com/512/3259/3259362.png",
    isVerified: false,
    description: "Ihr Partner für Smart Home Integration und moderne Elektroinstallationen bei Sanierungen."
  }
]

export function PartnerList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {PARTNERS.map(partner => (
        <PartnerCard key={partner.id} {...partner} />
      ))}
    </div>
  )
}
