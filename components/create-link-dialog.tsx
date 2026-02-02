
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { createLink } from '@/app/actions'
import { toast } from 'sonner'
import { Plus, Loader2, Link2, FileText, Calendar, Globe, Lock } from 'lucide-react'

export function CreateLinkDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const res = await createLink({
      url: formData.get('url') as string,
      description: formData.get('description') as string | undefined,
      isPublic,
      expiresAt: formData.get('expiresAt') as string | null,
    })

    setLoading(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('短链创建成功')
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
          <Plus className="mr-2 h-4 w-4" /> 创建短链
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/50 to-primary" />
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            创建新短链
          </DialogTitle>
          <DialogDescription>
            输入原始链接，我们会为您生成一个极简短链。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-medium flex items-center gap-2">
                原始链接 <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="url"
                  name="url"
                  placeholder="https://example.com/very/long/url..."
                  required
                  type="url"
                  className="pl-9 bg-muted/30 focus:bg-background transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                备注 (可选)
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="description"
                  name="description"
                  placeholder="例如：我的个人博客"
                  className="pl-9 bg-muted/30 focus:bg-background transition-colors"
                />
              </div>
            </div>
            
             <div className="space-y-2">
              <Label htmlFor="expiresAt" className="text-sm font-medium flex items-center gap-2">
                有效期 (可选)
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="expiresAt"
                  name="expiresAt"
                  type="datetime-local"
                  className="pl-9 bg-muted/30 focus:bg-background transition-colors"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
              <div className="space-y-0.5">
                <Label htmlFor="isPublic" className="text-base font-medium flex items-center gap-2 cursor-pointer">
                  {isPublic ? <Globe className="w-4 h-4 text-primary" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                  公开显示
                </Label>
                <p className="text-xs text-muted-foreground">
                  允许在“发现”页面展示此短链
                </p>
              </div>
              <Switch 
                id="isPublic" 
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading} className="min-w-20">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              创建
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
