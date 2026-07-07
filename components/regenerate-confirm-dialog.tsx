'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RotateCw } from 'lucide-react'

interface RegenerateConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

// Every generation costs a real credit, so Regenerate must never fire on a
// stray click — it asks for explicit confirmation that another credit will be
// spent before re-submitting.
export function RegenerateConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: RegenerateConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCw className="h-4 w-4" />
            Generate again?
          </DialogTitle>
          <DialogDescription>
            This starts a new generation and spends{' '}
            <span className="font-medium">1 credit</span>. Your current preview
            stays until the new one is ready.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              onConfirm()
            }}
          >
            Spend 1 credit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
