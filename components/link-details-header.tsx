'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Globe, Lock, Copy, QrCode, Download, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { QRCodeCanvas } from 'qrcode.react'
import { useRef, useState } from 'react'
import { copyToClipboard } from '@/lib/clipboard/utils'
import { downloadQRCode } from '@/lib/qrcode/utils'

interface LinkDetailsHeaderProps {
  link: {
    id: string
    short_code: string
    original_url: string
    is_public: boolean
    created_at: string
  }
  shortUrl: string
}

export function LinkDetailsHeader({ link, shortUrl }: LinkDetailsHeaderProps) {
  const [isQrOpen, setIsQrOpen] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const handleCopy = () => {
    copyToClipboard(shortUrl, '链接已复制到剪贴板')
  }

  const handleDownload = () => {
    downloadQRCode(qrRef, `qrcode-${link.short_code}`)
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-muted-foreground hover:text-foreground flex items-center text-sm w-fit transition-colors">
        <ArrowLeft className="mr-1 h-4 w-4" /> 返回控制台
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
              /{link.short_code}
            </h1>
            {link.is_public ? (
              <div className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50/50 px-2 py-0.5 rounded-full border border-emerald-100">
                <Globe className="w-3 h-3 mr-1" /> 公开
              </div>
            ) : (
              <div className="flex items-center text-xs font-medium text-amber-600 bg-amber-50/50 px-2 py-0.5 rounded-full border border-amber-100">
                <Lock className="w-3 h-3 mr-1" /> 私有
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <span className="opacity-70">指向:</span>
             <a href={link.original_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline truncate max-w-[300px] md:max-w-[500px] flex items-center gap-1">
                {link.original_url}
                <ExternalLink className="w-3 h-3" />
             </a>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            复制链接
          </Button>

          <Popover open={isQrOpen} onOpenChange={setIsQrOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <QrCode className="mr-2 h-4 w-4" />
                二维码
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <div className="flex flex-col items-center gap-3" ref={qrRef}>
                <div className="p-2 bg-white rounded-lg shadow-sm border">
                  {isQrOpen ? (
                    <QRCodeCanvas
                      value={shortUrl}
                      size={180}
                      level="H"
                      includeMargin
                      imageSettings={{
                        src: '/favicon.ico',
                        x: undefined,
                        y: undefined,
                        height: 24,
                        width: 24,
                        excavate: true,
                      }}
                    />
                  ) : null}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={handleDownload}
                >
                  <Download className="w-3 h-3 mr-2" />
                  下载二维码
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <a href={shortUrl} target="_blank" rel="noopener noreferrer">
             <Button size="sm" className="h-9">
               <ExternalLink className="mr-2 h-4 w-4" />
               访问
             </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
