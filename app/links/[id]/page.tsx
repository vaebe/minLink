import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, Lock, Users } from 'lucide-react'
import Link from 'next/link'
import { LinkDetailsHeader, StatsCard, LinkDetailsCard } from '@/components/link-details'
import { VisitsChartSection } from '@/components/visits-chart'
import type { AnalyticsTimeRow, AnalyticsTopRow } from '@/lib/analytics/types'
import { getDateWindow } from '@/lib/analytics/utils'
import { normalizeLabel } from '@/lib/analytics/formatters'

export default async function LinkDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ range?: string }>
}) {
  const id = (await params).id
  const { range } = await searchParams
  const supabase = await createClient()

  const [linkRes, userRes] = await Promise.all([
    supabase
      .from('links')
      .select('id, created_at, original_url, short_code, user_id, is_public, visits_count, description')
      .eq('id', id)
      .single(),
    supabase.auth.getUser(),
  ])

  const link = linkRes.data
  if (linkRes.error || !link) notFound()

  const user = userRes.data.user

  const isOwner = user?.id === link.user_id

  if (!link.is_public && !isOwner) {
    // If private and not owner, deny
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
          <Lock className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">无权访问</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            该短链是私有的，只有创建者可以查看详情。
          </p>
        </div>
        <Button asChild size="lg" className='cursor-pointer'>
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    )
  }

  const rangeDays = (() => {
    const raw = Number(range)
    if (raw === 7 || raw === 30 || raw === 90) return raw
    return 30
  })()

  const dateType: '7d' | '30d' | '90d' = rangeDays === 7 ? '7d' : rangeDays === 90 ? '90d' : '30d'
  const { startAt, endAt, bucket } = getDateWindow(dateType)
  const startAtIso = startAt.toISOString()
  const endAtIso = endAt.toISOString()

  const [timeRes, countryRes, cityRes, deviceRes, referrerRes, lastVisitRes, ipRes] = await Promise.all([
    supabase.rpc('analytics_time', {
      scope: 'link',
      start_at: startAtIso,
      end_at: endAtIso,
      bucket,
      p_link_id: id,
    }),
    supabase.rpc('analytics_region', {
      scope: 'link',
      dimension: 'country',
      start_at: startAtIso,
      end_at: endAtIso,
      p_link_id: id,
      limit_n: 5,
    }),
    supabase.rpc('analytics_region', {
      scope: 'link',
      dimension: 'city',
      start_at: startAtIso,
      end_at: endAtIso,
      p_link_id: id,
      limit_n: 5,
    }),
    supabase.rpc('analytics_device', {
      scope: 'link',
      dimension: 'device',
      start_at: startAtIso,
      end_at: endAtIso,
      p_link_id: id,
      limit_n: 20,
    }),
    supabase.rpc('analytics_referrer', {
      scope: 'link',
      start_at: startAtIso,
      end_at: endAtIso,
      p_link_id: id,
      limit_n: 5,
    }),
    supabase
      .from('visits')
      .select('created_at')
      .eq('link_id', id)
      .gte('created_at', startAtIso)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase.from('visits').select('ip').eq('link_id', id).gte('created_at', startAtIso),
  ])

  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${link.short_code}`

  const rpcErrors = [timeRes.error, countryRes.error, cityRes.error, deviceRes.error, referrerRes.error].filter(Boolean)
  if (rpcErrors.length > 0) {
    const message = (rpcErrors[0]?.message || '').toString()
    return (
      <div className="min-h-screen bg-background relative pb-20">
        <div className="max-w-3xl py-16 space-y-6">
          <div className="text-3xl font-bold">统计暂不可用</div>
          <div className="text-muted-foreground">
            请确认已在 Supabase Dashboard 的 SQL Editor 执行 supabase/schema.sql（包含 analytics_time / analytics_region / analytics_device / analytics_referrer）。
          </div>
          {message ? (
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">错误信息</CardTitle>
                <CardDescription>来自数据库 RPC</CardDescription>
              </CardHeader>
              <CardContent className="font-mono text-sm text-muted-foreground wrap-break-word">{message}</CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    )
  }

  const safeTime = ((timeRes.data || []) as AnalyticsTimeRow[]).map((row) => {
    const d = new Date(row.bucket_start)
    const date = d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    return { date, pv: Number(row.pv), uv: Number(row.uv) }
  })

  const chartData = safeTime
  const rangePv = safeTime.reduce((acc, row) => acc + row.pv, 0)
  const rangeUv = new Set((ipRes.data || []).map((x) => x.ip).filter(Boolean).map((ip) => String(ip))).size
  const lastVisit =
    lastVisitRes.data && lastVisitRes.data.length > 0
      ? new Date(lastVisitRes.data[0].created_at).toLocaleString('zh-CN')
      : '暂无'

  const topCountries: Array<[string, number]> = ((countryRes.data || []) as AnalyticsTopRow[]).map((x) => [
    normalizeLabel(x.name),
    Number(x.clicks),
  ])
  const topCities: Array<[string, number]> = ((cityRes.data || []) as AnalyticsTopRow[]).map((x) => [
    normalizeLabel(x.name),
    Number(x.clicks),
  ])
  const topReferrers: Array<[string, number]> = ((referrerRes.data || []) as AnalyticsTopRow[]).map((x) => [
    normalizeLabel(x.name),
    Number(x.clicks),
  ])
  const topDevices: Array<[string, number]> = ((deviceRes.data || []) as AnalyticsTopRow[]).map((x) => [
    normalizeLabel(x.name),
    Number(x.clicks),
  ])

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl py-8 space-y-8 relative z-10 px-4 sm:px-6 lg:px-8">
        <LinkDetailsHeader link={link} shortUrl={shortUrl} />

        <div className="flex items-center justify-end gap-2">
          <Button asChild variant="outline" className="h-9 cursor-pointer">
            <Link href={`/analytics?dateType=30d&region=country&device=device&linkId=${id}`}>
              在统计中心打开
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-9 cursor-pointer">
            <Link href={`/links/${id}/visits?range=${rangeDays}`}>
              查看访问明细
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <StatsCard
            title="PV"
            value={rangePv}
            description={`过去 ${rangeDays} 天`}
            icon={MapPin}
          />

          <StatsCard
            title="UV"
            value={rangeUv}
            description={`过去 ${rangeDays} 天（按 IP 去重）`}
            icon={Users}
          />

          <StatsCard
            title="最近访问"
            value={lastVisit}
            description={`过去 ${rangeDays} 天内`}
            icon={Clock}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 border-border/60 shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <CardTitle>访问趋势</CardTitle>
                  <CardDescription>过去 {rangeDays} 天的 PV/UV 统计</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {[7, 30, 90].map((d) => (
                    <Button
                      key={d}
                      asChild
                      size="sm"
                      variant={d === rangeDays ? 'default' : 'outline'}
                      className="h-8 cursor-pointer"
                    >
                      <Link href={`/links/${id}?range=${d}`}>
                        {d} 天
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-87.5 px-2">
              <VisitsChartSection data={chartData} />
            </CardContent>
          </Card>

          <LinkDetailsCard
            data={{
              countries: topCountries,
              cities: topCities,
              referrers: topReferrers,
              devices: topDevices,
              description: link.description,
            }}
          />
        </div>
      </div>
    </div>
  )
}
