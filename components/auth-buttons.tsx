
'use client'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'

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
    <Button onClick={handleLogin} variant="default" className="font-medium cursor-pointer">
      <Image src='/icon/github.svg' width={16} height={16} className='mr-2 h-4 w-4' alt='github'></Image>
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
