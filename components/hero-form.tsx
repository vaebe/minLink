'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createLink } from '@/app/actions'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Link2, Loader2 } from 'lucide-react'

interface HeroFormProps {
  isAuthenticated: boolean
}

export function HeroForm({ isAuthenticated }: HeroFormProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)

  const handleLogin = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) toast.error(error.message)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    if (!isAuthenticated) {
      toast('请先登录以创建短链', {
        action: {
          label: '去登录',
          onClick: handleLogin
        }
      })
      handleLogin()
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('url', url)

    // 默认创建私有链接
    const res = await createLink(formData)

    setLoading(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('短链创建成功！正在前往控制台...')
      setUrl('')
      // 稍微延迟跳转，让用户看到成功提示
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto relative group">
      <div
        className={`
            relative flex items-center p-1 rounded-full transition-all duration-300 ease-out
            ${focused ? 'ring-4 ring-orange-300 bg-background shadow-xl scale-[1.02]' : 'bg-secondary/50 shadow-sm hover:shadow-md'}
          `}
      >
        <div className={`absolute left-5 transition-colors duration-300 ${focused ? 'text-orange-300' : 'text-muted-foreground'}`}>
          <Link2 className="w-5 h-5" />
        </div>
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="粘贴长链接，即刻简化"
          className="h-16 pl-14 pr-36 rounded-full border-none bg-transparent text-lg shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
          required
        />
        <div className="absolute right-2">
          <Button
            size="lg"
            type="submit"
            disabled={loading}
            className="rounded-full h-12 px-8 font-medium shadow-sm transition-all text-white"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="text-base tracking-wide">生成</span>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
