import { createClient } from '@/utils/supabase/server'
import { SiteHeader } from '@/components/site-header'

export async function SiteHeaderWrapper() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <SiteHeader initialUser={user} />
}
