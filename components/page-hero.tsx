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
    <section className="border-b border-border/40 bg-secondary/30 py-14 md:py-18">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
          {badgeIcon}
          <span className="text-sm font-medium text-primary">{badge}</span>
        </div>
        <h1 className="mx-auto mb-4 max-w-3xl text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          {title}
          {titleAccent && (
            <>
              {" "}
              <span className="text-primary">{titleAccent}</span>
            </>
          )}
        </h1>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
          {description}
        </p>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  )
}
