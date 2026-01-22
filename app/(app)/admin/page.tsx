"use client"

import { StatsOverview } from "@/components/modules/admin/StatsOverview"
import { UserTable } from "@/components/modules/admin/UserTable"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Plus, Filter, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo size="md" href="/" />
          <div className="h-6 w-px bg-border" />
          <h1 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Admin-Panel</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Zum Portal
            </Link>
          </Button>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">System-Übersicht</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Bericht exportieren
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nutzer hinzufügen
            </Button>
          </div>
        </div>

        <StatsOverview />

        <div className="space-y-6">
          <Tabs defaultValue="users" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="users">Nutzer-Verwaltung</TabsTrigger>
                <TabsTrigger value="partners">Partner-Management</TabsTrigger>
                <TabsTrigger value="courses">Kurs-Verwaltung</TabsTrigger>
                <TabsTrigger value="revenue">Umsatz-Details</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2 h-9">
                  <Filter className="w-3 h-3" />
                  Filtern
                </Button>
              </div>
            </div>
            
            <TabsContent value="users" className="m-0">
              <UserTable />
            </TabsContent>
            
            <TabsContent value="partners" className="m-0">
              <div className="p-12 text-center bg-white border rounded-md">
                <p className="text-muted-foreground">Partner-Modul wird geladen...</p>
              </div>
            </TabsContent>

            <TabsContent value="courses" className="m-0">
              <div className="p-12 text-center bg-white border rounded-md">
                <p className="text-muted-foreground">Kurs-Modul wird geladen...</p>
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="m-0">
              <div className="p-12 text-center bg-white border rounded-md">
                <p className="text-muted-foreground">Umsatz-Analyse wird geladen...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
