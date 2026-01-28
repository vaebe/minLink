
'use client'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      toast.error('登录失败: ' + error.message)
    }
  }

  return (
    <Button onClick={handleLogin} variant="default" className="font-medium">
      <Github className="mr-2 h-4 w-4" />
      使用 GitHub 登录
    </Button>
  )
}

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error('登出失败')
    } else {
      router.refresh()
      router.push('/')
    }
  }

  return (
    <Button onClick={handleLogout} variant="ghost" size="sm">
      登出
    </Button>
  )
}
