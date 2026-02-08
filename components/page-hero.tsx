interface PageHeroProps {
  badge: string
  badgeIcon: React.ReactNode
  title: string
  titleAccent?: string
  description: string
  children?: React.ReactNode
}

export function PageHero({ badge, badgeIcon, title, titleAccent, description, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/50 py-16 md:py-20">
      {/* Subtle gradient orb */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[300px] w-[600px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5">
          {badgeIcon}
          <span className="text-xs font-medium text-muted-foreground">{badge}</span>
        </div>
        <h1 className="mx-auto mb-4 max-w-3xl text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          {title}
          {titleAccent && (
            <>
              {" "}
              <span className="text-gradient">{titleAccent}</span>
            </>
          )}
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  )
}
