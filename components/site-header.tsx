
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link as LinkIcon, LogOut, LayoutDashboard, User as UserIcon, BarChart3 } from 'lucide-react'
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
        "fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300",
        scrolled 
          ? "bg-background/90 backdrop-blur-xl border-border/30 shadow-lg shadow-primary/5" 
          : "bg-background/60 backdrop-blur-md border-border/20"
      )}
    >
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center space-x-3 group">
          <motion.div 
            className="relative"
            whileHover={reduceMotion ? undefined : { scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-linear-to-br from-primary/30 via-orange-400/20 to-amber-400/30 rounded-xl blur-sm opacity-60 group-hover:opacity-80 transition-opacity" />
            <div className="relative bg-linear-to-br from-primary/10 to-orange-400/10 p-2.5 rounded-xl border border-primary/20 group-hover:border-primary/30 transition-colors">
              <LinkIcon className="h-5 w-5 text-primary" />
            </div>
          </motion.div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">MinLink</span>
            <span className="text-xs text-muted-foreground/60 -mt-0.5">极简短链</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="主导航">
             <Link 
                href="/explore" 
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg hover:bg-primary/5 group"
             >
                <span className="relative z-10">发现</span>
                <span className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/10 to-primary/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
             </Link>
             <Link 
                href="/analytics" 
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg hover:bg-primary/5 group"
             >
                <span className="relative z-10">统计</span>
                <span className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/10 to-primary/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
             </Link>
             {user && (
                 <Link 
                    href="/dashboard" 
                    className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg hover:bg-primary/5 group"
                 >
                    <span className="relative z-10">控制台</span>
                    <span className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/10 to-primary/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
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
                  className="relative h-10 w-10 rounded-full ring-offset-background transition-all duration-200 hover:bg-primary/10 hover:ring-2 hover:ring-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarImage src={user.user_metadata.avatar_url} alt={user.email || ''} />
                    <AvatarFallback className="bg-linear-to-br from-primary/20 to-orange-400/20 text-primary font-medium">
                      {user.email?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.user_metadata.full_name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => router.push('/analytics')}
                  className="cursor-pointer hover:bg-primary/5 transition-colors"
                >
                    <BarChart3 className="mr-2 h-4 w-4 text-primary" />
                    <span className="font-medium">统计中心</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => router.push('/dashboard')}
                  className="cursor-pointer hover:bg-primary/5 transition-colors"
                >
                    <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                    <span className="font-medium">控制台</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-primary/5 transition-colors">
                    <UserIcon className="mr-2 h-4 w-4 text-primary" />
                    <span className="font-medium">个人资料</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/5 transition-colors"
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
