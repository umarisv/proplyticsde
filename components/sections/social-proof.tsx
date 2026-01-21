"use client"

const stats = [
  { value: "15.000+", label: "Bewertungen" },
  { value: "4.8/5", label: "Kundenzufriedenheit" },
  { value: "60s", label: "Durchschnittliche Analyse" },
]

export function SocialProof() {
  return (
    <section className="py-16 md:py-20 bg-white border-t border-black/5">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-semibold text-black mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-black/50">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
