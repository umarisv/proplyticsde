import React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-secondary/30 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
