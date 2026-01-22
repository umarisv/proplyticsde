"use client"

import { CourseCard } from "./CourseCard"

const COURSES = [
  {
    id: "1",
    title: "Immobilien-Investment Masterclass",
    description: "Lernen Sie von Grund auf, wie Sie profitable Immobilien identifizieren, bewerten und finanzieren.",
    thumbnail: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60",
    duration: "12h 30m",
    lessons: 24,
    rating: 4.9,
    price: 299,
    category: "Investment",
    isEnrolled: true,
    progress: 45
  },
  {
    id: "2",
    title: "Steuerstrategien für Vermieter",
    description: "Sparen Sie tausende Euro Steuern mit den richtigen Gestaltungsmodellen (VV-GmbH, Holding, etc.).",
    thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=60",
    duration: "5h 15m",
    lessons: 12,
    rating: 4.8,
    price: 149,
    category: "Steuern",
    isEnrolled: false
  },
  {
    id: "3",
    title: "Sanierung & Modernisierung",
    description: "Vom Rohbau bis zur Schlüsselübergabe. So steigern Sie den Wert Ihrer Immobilie effizient.",
    thumbnail: "https://images.unsplash.com/photo-1503387762-592dea58ef21?w=800&auto=format&fit=crop&q=60",
    duration: "8h 45m",
    lessons: 18,
    rating: 4.7,
    price: 199,
    category: "Bauwesen",
    isEnrolled: true,
    progress: 10
  }
]

export function CourseList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {COURSES.map(course => (
        <CourseCard key={course.id} {...course} />
      ))}
    </div>
  )
}
