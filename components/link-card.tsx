
'use client'

import { Card, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Trash2, Globe, Lock, BarChart2, QrCode, Download } from 'lucide-react'
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
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl)
    toast.success('链接已复制到剪贴板')
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
    >
      <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/20 border-border/60 bg-card/50 backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-primary/5 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500" />
        
        <CardHeader className="p-5 pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 max-w-[80%] z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
                  /{link.short_code}
                </span>
                <Badge variant={link.is_public ? "secondary" : "outline"} className="text-[10px] h-5 px-2 font-normal">
                  {link.is_public ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                  {link.is_public ? '公开' : '私有'}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground truncate font-mono bg-muted/30 p-1 px-2 rounded w-fit max-w-full" title={link.original_url}>
                  {link.original_url}
                </p>
                {link.description && (
                  <p className="text-xs text-muted-foreground/80 pl-1 border-l-2 border-primary/20 line-clamp-1">
                    {link.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex gap-1 z-10">
              <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors" title="复制链接" aria-label="复制链接">
                <Copy className="h-4 w-4" />
              </Button>
              <Popover open={isQrOpen} onOpenChange={setIsQrOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors" title="二维码" aria-label="显示二维码">
                    <QrCode className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="end">
                  <div className="flex flex-col items-center gap-3" ref={qrRef}>
                    <div className="p-2 bg-white rounded-lg shadow-sm border">
                      {isQrOpen ? (
                        <QRCodeCanvas 
                          value={shortUrl} 
                          size={160}
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
                    <Button size="sm" variant="outline" className="w-full text-xs" onClick={downloadQRCode}>
                      <Download className="w-3 h-3 mr-2" />
                      下载二维码
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        
        <CardFooter className="p-4 pt-3 bg-muted/30 flex items-center justify-between border-t border-border/40 mt-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5" title="总访问量">
              <BarChart2 className="h-3.5 w-3.5 text-primary/70" />
              {link.visits_count}
            </div>
            <div title="创建时间">
              {new Date(link.created_at).toLocaleDateString()}
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
             <Button
               asChild
               variant="ghost"
               size="icon"
               className="h-7 w-7 hover:text-primary hover:bg-primary/10"
               title="查看详情"
               aria-label="查看详情"
             >
               <Link href={`/links/${link.id}`}>
                 <BarChart2 className="h-3.5 w-3.5" />
               </Link>
             </Button>
             {!readOnly && (
               <>
                 <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary hover:bg-primary/10" onClick={handleTogglePublic} title={link.is_public ? "设为私有" : "设为公开"} aria-label={link.is_public ? "设为私有" : "设为公开"}>
                  {link.is_public ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                </Button>
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                      disabled={isDeleting}
                      title="删除"
                      aria-label="删除短链"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>删除短链</DialogTitle>
                      <DialogDescription>该操作不可撤销。</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">取消</Button>
                      </DialogClose>
                      <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        删除
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
               </>
             )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
