'use client'

import * as React from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LoginButton } from '@/components/auth-buttons'
import { motion, useReducedMotion, useScroll, useMotionValueEvent } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import Image from 'next/image'

const CreateLinkDialog = dynamic(() => import('@/components/create-link-dialog').then((mod) => mod.CreateLinkDialog), {
  ssr: false,
})

function CreateLink(config: { href: string; text: string }) {
  return (
    <Link
      href={config.href}
      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {config.text}
    </Link>
  )
}

function UserInfo({ user }: { user?: SupabaseUser }) {
  const reduceMotion = useReducedMotion()

  const supabase = React.useMemo(() => createClient(), [])
  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('登出失败')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          >
            <CreateLinkDialog />
          </motion.div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="cursor-pointer h-10 w-10 rounded-full transition-all duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
              >
                <Avatar className="h-9 w-9 border border-border/50">
                  <AvatarImage src={user.user_metadata.avatar_url} alt={user.email || ''} />
                  <AvatarFallback className="bg-secondary text-foreground font-medium">
                    {user.email?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-2 rounded-md shadow-xl border-border/40 bg-background/95 backdrop-blur-sm" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-0 mb-1">
                <div className="flex flex-col space-y-1 bg-secondary/50 p-2.5 rounded-md">
                  <p className="text-sm font-medium leading-none text-foreground">{user.user_metadata.full_name || 'User'}</p>
                  <p className="text-xs leading-none break-all">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer h-9 rounded-md mt-1"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="font-medium text-red-500">登出</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <motion.div
          className="flex items-center gap-2"
          whileHover={reduceMotion ? undefined : { scale: 1.02 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        >
          <LoginButton />
        </motion.div>
      )}
    </div>
  )
}

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false)
  const { scrollY } = useScroll()
  const [user, setUser] = React.useState<SupabaseUser>()
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20)
  })

  React.useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user)
      if (event === 'SIGNED_OUT') {
        router.refresh()
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router, supabase])



  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/40"
          : "bg-background/0 border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center space-x-3 group">
          <Image
            src='/logo/dark.png'
            alt="min link Logo"
            width={32}
            height={32}
            className="w-8 h-8 rounded"
          />
          <span className="font-bold text-lg tracking-tight text-foreground">MinLink</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="主导航">
          <CreateLink href="/explore" text="发现" />
          <CreateLink href="/analytics" text="统计" />
          {user && <CreateLink href="/dashboard" text="控制台" />}
        </nav>

        <UserInfo user={user}></UserInfo>
      </div>
    </motion.header>
  )
}
