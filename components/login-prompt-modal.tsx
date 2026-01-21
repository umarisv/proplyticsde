'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Lock, Sparkles } from 'lucide-react'

interface LoginPromptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  feature?: string
}

export function LoginPromptModal({
  open,
  onOpenChange,
  title = 'Konto erforderlich',
  description = 'Um diese Funktion zu nutzen, benötigen Sie ein kostenloses Konto.',
  feature,
}: LoginPromptModalProps) {
  const router = useRouter()

  const handleLogin = () => {
    onOpenChange(false)
    router.push('/login')
  }

  const handleRegister = () => {
    onOpenChange(false)
    router.push('/register')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-left">
          <div className="mx-auto sm:mx-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        {feature && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <Sparkles className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Mit einem Konto können Sie:</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• Unbegrenzt Bewertungen durchführen</li>
                <li>• Bewertungen speichern & verwalten</li>
                <li>• Mit dem KI-Agent diskutieren</li>
                <li>• Objekte vergleichen</li>
              </ul>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleLogin} className="w-full sm:w-auto">
            Anmelden
          </Button>
          <Button onClick={handleRegister} className="w-full sm:w-auto">
            Kostenloses Konto erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
