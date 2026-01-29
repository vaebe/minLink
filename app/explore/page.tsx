
import { createClient } from '@/utils/supabase/server'
import { LinkGrid } from '@/components/link-grid'
import { PageHeader } from '@/components/page-header'
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
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl py-8 space-y-8 relative z-10 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="发现"
          description="浏览社区公开的短链，发现有趣的内容。"
        />

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
