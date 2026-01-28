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
import { Link as LinkIcon, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LoginButton } from '@/components/auth-buttons'
import { motion, useReducedMotion, useScroll, useMotionValueEvent } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const CreateLinkDialog = dynamic(() => import('@/components/create-link-dialog').then((mod) => mod.CreateLinkDialog), {
  ssr: false,
})

export function SiteHeader({ initialUser = null }: { initialUser?: SupabaseUser | null }) {
  const [scrolled, setScrolled] = React.useState(false)
  const { scrollY } = useScroll()
  const [user, setUser] = React.useState<SupabaseUser | null>(initialUser)
  const reduceMotion = useReducedMotion()
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20)
  })

  React.useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
       setUser(session?.user ?? null)
       if (event === 'SIGNED_OUT') {
           router.refresh()
       }
    })

    return () => {
        authListener.subscription.unsubscribe()
    }
  }, [router, supabase])

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
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-background/80 backdrop-blur-xl border-b border-border/40" 
          : "bg-background/0 border-b border-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center space-x-3 group">
          <motion.div 
            className="relative"
            whileHover={reduceMotion ? undefined : { scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-foreground text-background p-2 rounded-lg group-hover:bg-orange-apple transition-colors duration-300">
              <LinkIcon className="h-5 w-5" />
            </div>
          </motion.div>
          <span className="font-bold text-lg tracking-tight text-foreground">MinLink</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="主导航">
             <Link 
                href="/explore" 
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
             >
                发现
             </Link>
             <Link 
                href="/analytics" 
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
             >
                统计
             </Link>
             {user && (
                 <Link 
                    href="/dashboard" 
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                 >
                    控制台
                 </Link>
             )}
        </nav>

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
                  className="relative h-10 w-10 rounded-full transition-all duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-apple focus-visible:ring-offset-2"
                >
                  <Avatar className="h-9 w-9 border border-border/50">
                    <AvatarImage src={user.user_metadata.avatar_url} alt={user.email || ''} />
                    <AvatarFallback className="bg-secondary text-foreground font-medium">
                      {user.email?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 p-2 rounded-xl shadow-xl border-border/40 bg-background/95 backdrop-blur-sm" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-0 mb-1">
                  <div className="flex flex-col space-y-1 bg-secondary/50 p-2.5 rounded-lg">
                    <p className="text-sm font-medium leading-none text-foreground">{user.user_metadata.full_name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground break-all">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="cursor-pointer h-9 rounded-md text-muted-foreground hover:text-destructive focus:text-destructive focus:bg-destructive/5 mt-1"
                >
                   <LogOut className="mr-2 h-4 w-4" />
                   <span className="font-medium">登出</span>
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
      </div>
    </motion.header>
  )
}
