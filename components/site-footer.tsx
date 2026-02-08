import Link from "next/link"

const links = [
  { href: "/blog", label: "Blog" },
  { href: "/community", label: "Community" },
  { href: "/portal", label: "Portal" },
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between sm:px-6">
        <p className="text-xs text-muted-foreground">
          {"© " + new Date().getFullYear() + " proplytics.de"}
        </p>
        <nav className="flex flex-wrap items-center gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
