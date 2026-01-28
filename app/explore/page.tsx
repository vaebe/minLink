
import { createClient } from '@/utils/supabase/server'
import { LinkGrid } from '@/components/link-grid'
import { Globe } from 'lucide-react'

export const revalidate = 60 // Revalidate every minute

export default async function ExplorePage() {
  const supabase = await createClient()

  const { data: links } = await supabase
    .from('links')
    .select('id, short_code, original_url, visits_count, created_at, is_public, description')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-[400px] bg-linear-to-b from-primary/5 to-transparent opacity-60" />
        <div className="absolute inset-0 bg-grid-small-black/[0.05] -z-10" />
        {/* 暖色调光晕 */}
        <div className="absolute top-40 left-1/4 h-[280px] w-[280px] rounded-full bg-primary/15 opacity-20 blur-[90px]" />
        <div className="absolute bottom-40 right-1/4 h-[320px] w-[320px] rounded-full bg-amber-400/15 opacity-20 blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-7xl py-8 space-y-8 relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-2 border-b border-border/40 pb-6">
          <div className="space-y-1">
             <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                发现
             </h1>
          </div>
          <p className="text-muted-foreground">
            浏览社区公开的短链，发现有趣的内容。
          </p>
        </div>

        {!links || links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border rounded-3xl border-dashed border-border/60 bg-card/30 backdrop-blur-sm">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium mb-1">暂无公开短链</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              创建短链并设为“公开”，即可在这里展示。
            </p>
          </div>
        ) : (
          <LinkGrid links={links} readOnly={true} />
        )}
      </div>
    </div>
  )
}
