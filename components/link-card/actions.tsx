'use client'

import { Button } from '@/components/ui/button'
import { ExternalLink, Globe, Lock, MoreHorizontal, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface LinkCardActionsProps {
  isPublic: boolean
  shortUrl: string
  onTogglePublic: () => void
  onDelete: () => void
}


export function LinkCardActions({
  isPublic,
  shortUrl,
  onTogglePublic,
  onDelete,
}: LinkCardActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl">
        <DropdownMenuItem onClick={onTogglePublic}>
          {isPublic ? (
            <Lock className="mr-2 h-4 w-4" />
          ) : (
            <Globe className="mr-2 h-4 w-4" />
          )}
          {isPublic ? '设为私有' : '设为公开'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(shortUrl, '_blank')}>
          <ExternalLink className="mr-2 h-4 w-4" />
          访问链接
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive focus:bg-destructive/5"
          onClick={onDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          删除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
