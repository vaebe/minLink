import { RefObject } from 'react'
import { toast } from 'sonner'

/**
 * Download QR code as PNG image
 * @param containerRef - Ref to the container element that contains the QR code canvas
 * @param filename - Filename for the downloaded image (without extension)
 */
export function downloadQRCode(
  containerRef: RefObject<HTMLDivElement | null>,
  filename: string
): void {
  const canvas = containerRef.current?.querySelector('canvas')

  if (!canvas) {
    toast.error('无法找到二维码')
    return
  }

  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.png`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  toast.success('二维码已下载')
}
