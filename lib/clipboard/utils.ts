import { toast } from 'sonner'

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @param successMessage - Optional success message (default: '已复制')
 */
export async function copyToClipboard(
  text: string,
  successMessage = '已复制'
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(successMessage)
  } catch (error) {
    toast.error('复制失败')
    console.error('Failed to copy:', error)
  }
}
