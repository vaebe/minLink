import { createClient } from '@/utils/supabase/server'
import { DashboardClient } from '@/components/dashboard-client'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: links } = await supabase
    .from('links')
    .select('id, short_code, original_url, visits_count, created_at, is_public, description')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background relative">
       {/* Background elements - Clean Tech Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-linear-to-b from-primary/5 to-transparent opacity-40" />
        <div className="absolute inset-0 bg-grid-small-black/[0.05] -z-10" />
      </div>

      <div className="container mx-auto max-w-7xl py-8 relative z-10 px-4 sm:px-6 lg:px-8">
        <DashboardClient links={links || []} />
      </div>
    </div>
  )
}
