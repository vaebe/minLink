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

interface LinkCardDeleteDialogProps {
  open: boolean
  isDeleting: boolean
  shortCode: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function LinkCardDeleteDialog({
  open,
  isDeleting,
  shortCode,
  onOpenChange,
  onConfirm,
}: LinkCardDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25 rounded-2xl">
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            此操作将永久删除短链 /{shortCode} 及其所有访问数据，无法恢复。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl"
          >
            {isDeleting ? '删除中...' : '确认删除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
