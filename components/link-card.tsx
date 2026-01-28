'use client'

import { Button } from '@/components/ui/button'
import { Copy, Trash2, Globe, Lock, BarChart2, QrCode, Download, MoreHorizontal, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { deleteLink, updateLinkState } from '@/app/actions'
import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from 'framer-motion'

const QRCodeCanvas = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeCanvas), { ssr: false })

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
  const [isQrOpen, setIsQrOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const shortUrl = useMemo(() => {
    const envBase = (process.env.NEXT_PUBLIC_BASE_URL || '').trim()
    if (envBase) return `${envBase.replace(/\/+$/, '')}/${link.short_code}`
    if (typeof window !== 'undefined' && window.location?.origin) return `${window.location.origin}/${link.short_code}`
    return `/${link.short_code}`
  }, [link.short_code])
  const qrRef = useRef<HTMLDivElement>(null)

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(shortUrl)
    toast.success('链接已复制')
  }

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (canvas) {
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `qrcode-${link.short_code}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast.success('二维码已下载')
    }
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
             <div className="flex items-center gap-1.5 group/link cursor-pointer" onClick={copyToClipboard}>
                <span className="font-bold text-2xl tracking-tight text-foreground group-hover/link:text-orange-apple transition-colors">
                  /{link.short_code}
                </span>
                <Copy className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
             </div>
             {link.is_public && (
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 mb-3 ml-0.5" title="公开" />
             )}
          </div>
          
          <div className="flex items-center -mr-2">
             {!readOnly && (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                     <MoreHorizontal className="w-4 h-4" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-40 rounded-xl">
                   <DropdownMenuItem onClick={handleTogglePublic}>
                     {link.is_public ? <Lock className="mr-2 h-4 w-4" /> : <Globe className="mr-2 h-4 w-4" />}
                     {link.is_public ? '设为私有' : '设为公开'}
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => window.open(shortUrl, '_blank')}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      访问链接
                   </DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/5" onClick={() => setDeleteOpen(true)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             )}
          </div>
        </div>

        {/* Middle: Original URL */}
        <div className="mb-6 space-y-1">
          <p className="text-sm text-muted-foreground truncate max-w-full font-mono bg-secondary/30 px-2 py-1 rounded-md inline-block" title={link.original_url}>
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
              <Popover open={isQrOpen} onOpenChange={setIsQrOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-secondary">
                    <QrCode className="w-3.5 h-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 rounded-xl" align="end">
                  <div className="flex flex-col items-center gap-3" ref={qrRef}>
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-border/20">
                      {isQrOpen ? (
                        <QRCodeCanvas 
                          value={shortUrl} 
                          size={140}
                          level="H"
                          includeMargin
                          imageSettings={{
                            src: "/favicon.ico",
                            x: undefined,
                            y: undefined,
                            height: 24,
                            width: 24,
                            excavate: true,
                          }}
                        />
                      ) : null}
                    </div>
                    <Button size="sm" variant="outline" className="w-full text-xs h-8" onClick={downloadQRCode}>
                      <Download className="w-3 h-3 mr-2" />
                      下载
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-secondary">
                 <Link href={`/links/${link.id}`}>
                   <BarChart2 className="w-3.5 h-3.5" />
                 </Link>
              </Button>
           </div>
        </div>
      </div>
      
      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              此操作将永久删除短链 /{link.short_code} 及其所有访问数据，无法恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-xl">取消</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="rounded-xl">
              {isDeleting ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </motion.div>
  )
}
