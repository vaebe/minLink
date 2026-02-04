'use client'

import { Button } from '@/components/ui/button'
import { QrCode, Download } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { downloadQRCode } from '@/lib/qrcode/utils'

const QRCodeCanvas = dynamic(
  () => import('qrcode.react').then((mod) => mod.QRCodeCanvas),
  { ssr: false }
)

interface LinkCardQRCodeProps {
  shortUrl: string
  shortCode: string
}

export function LinkCardQRCode({ shortUrl, shortCode }: LinkCardQRCodeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const handleDownload = () => {
    downloadQRCode(qrRef, `qrcode-${shortCode}`)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          <QrCode className="w-3.5 h-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 rounded-xl" align="end">
        <div className="flex flex-col items-center gap-3" ref={qrRef}>
          <div className="p-2 bg-white rounded-lg shadow-sm border border-border/20">
            {isOpen ? (
              <QRCodeCanvas
                value={shortUrl}
                size={140}
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
            className="w-full text-xs h-8"
            onClick={handleDownload}
          >
            <Download className="w-3 h-3 mr-2" />
            下载
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
