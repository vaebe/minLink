
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { createLink } from '@/app/actions'
import { toast } from 'sonner'
import { Plus, Loader2, Link2, FileText, Calendar as CalendarIcon, Globe, Lock } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export function CreateLinkDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const res = await createLink({
      url: formData.get('url') as string,
      description: formData.get('description') as string | undefined,
      isPublic,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
    })

    setLoading(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('短链创建成功')
      setOpen(false)
      setExpiresAt(undefined)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
          <Plus className="h-4 w-4" /> 
          <span className='ml-2'>创建短链</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-160 overflow-hidden">
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
                  placeholder="https://example.com/url"
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
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-muted/30 hover:bg-background transition-colors",
                      !expiresAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiresAt ? format(expiresAt, "yyyy年M月d日 HH:mm", { locale: zhCN }) : "选择日期和时间"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <div className="space-y-3">
                    <CalendarComponent
                      mode="single"
                      selected={expiresAt}
                      onSelect={(date) => {
                        if (date) {
                          setExpiresAt(new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate(),
                            expiresAt?.getHours() ?? 23,
                            expiresAt?.getMinutes() ?? 59
                          ))
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                    <div className="space-y-2">
                      <Label className="text-sm">选择时间</Label>
                      <Input
                        type="time"
                        value={expiresAt ? `${String(expiresAt.getHours()).padStart(2, '0')}:${String(expiresAt.getMinutes()).padStart(2, '0')}` : ''}
                        onChange={(e) => {
                          if (e.target.value && expiresAt) {
                            const [hours, minutes] = e.target.value.split(':').map(Number)
                            setExpiresAt(new Date(
                              expiresAt.getFullYear(),
                              expiresAt.getMonth(),
                              expiresAt.getDate(),
                              hours,
                              minutes
                            ))
                          }
                        }}
                        className="bg-muted/30 focus:bg-background transition-colors"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
