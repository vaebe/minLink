'use client'

import { Button } from '@/components/ui/button'
import { Copy, BarChart2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteLink, updateLinkState } from '@/app/actions'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { copyToClipboard } from '@/lib/clipboard/utils'
import { LinkCardActions } from './actions'
import { LinkCardQRCode } from './qrcode'
import { LinkCardDeleteDialog } from './delete-dialog'

interface LinkItem {
  id: string
  short_code: string
  original_url: string
  visits_count: number
  created_at: string
  is_public: boolean
  description?: string | null
}

export function LinkCard({ link, readOnly = false }: { link: LinkItem, readOnly?: boolean }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const shortUrl = useMemo(() => {
    const envBase = (process.env.NEXT_PUBLIC_BASE_URL || '').trim()
    if (envBase) return `${envBase.replace(/\/+$/, '')}/${link.short_code}`
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}/${link.short_code}`
    }
    return `/${link.short_code}`
  }, [link.short_code])

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    copyToClipboard(shortUrl, '链接已复制')
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const res = await deleteLink(link.id)
    setIsDeleting(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      setDeleteOpen(false)
      toast.success('短链已删除')
    }
  }

  const handleTogglePublic = async () => {
    const newState = !link.is_public
    const res = await updateLinkState(link.id, newState)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success(newState ? '已设置为公开' : '已设置为私有')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      layout
      className="group"
    >
      <div className="relative p-5 rounded-2xl bg-card border border-border/40 transition-all duration-300 hover:shadow-lg hover:border-border/60 hover:-translate-y-0.5">
        {/* Top Row: Short Code & Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 group/link cursor-pointer"
              onClick={handleCopy}
            >
              <span className="font-bold text-2xl tracking-tight text-foreground group-hover/link:text-orange-300 transition-colors">
                /{link.short_code}
              </span>
              <Copy className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
            </div>
            {link.is_public && (
              <div
                className="w-1.5 h-1.5 rounded-full bg-green-500 mb-3 ml-0.5"
                title="公开"
              />
            )}
          </div>

          {!readOnly && (
            <div className="flex items-center -mr-2">
              <LinkCardActions
                isPublic={link.is_public}
                shortUrl={shortUrl}
                onTogglePublic={handleTogglePublic}
                onDelete={() => setDeleteOpen(true)}
              />
            </div>
          )}
        </div>

        {/* Middle: Original URL */}
        <div className="mb-6 space-y-1">
          <p
            className="text-sm text-muted-foreground truncate max-w-full font-mono bg-secondary/30 px-2 py-1 rounded-md inline-block"
            title={link.original_url}
          >
            {link.original_url}
          </p>
          {link.description && (
            <p className="text-sm text-foreground/80 pl-1 line-clamp-1">
              {link.description}
            </p>
          )}
        </div>

        {/* Bottom: Stats & Quick Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5" title="总访问量">
              <BarChart2 className="w-3.5 h-3.5" />
              {link.visits_count}
            </div>
            <div className="flex items-center gap-1.5" title="创建时间">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              {new Date(link.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <LinkCardQRCode shortUrl={shortUrl} shortCode={link.short_code} />

            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <Link href={`/links/${link.id}`}>
                <BarChart2 className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <LinkCardDeleteDialog
        open={deleteOpen}
        isDeleting={isDeleting}
        shortCode={link.short_code}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
      />
    </motion.div>
  )
}
