
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, Lock, Users, Compass, Monitor } from 'lucide-react'
import Link from 'next/link'
import { LinkDetailsHeader } from '@/components/link-details-header'
import { VisitsChartSection } from '@/components/visits-chart-section'
import type { AnalyticsTimeRow, AnalyticsTopRow } from '@/lib/analytics/types'
import { getDateWindow } from '@/lib/analytics/utils'

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
      <div className="container flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
          <Lock className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">无权访问</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            该短链是私有的，只有创建者可以查看详情。
          </p>
        </div>
        <Button asChild size="lg">
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
    lastVisitRes.data && lastVisitRes.data.length > 0 ? new Date(lastVisitRes.data[0].created_at).toLocaleString('zh-CN') : '暂无'

  const normalizeLabel = (value: string) => (value === 'unknown' ? '未知' : value)

  const topCountries = ((countryRes.data || []) as AnalyticsTopRow[]).map((x) => [normalizeLabel(x.name), Number(x.clicks)] as const)
  const topCities = ((cityRes.data || []) as AnalyticsTopRow[]).map((x) => [normalizeLabel(x.name), Number(x.clicks)] as const)
  const topReferrers = ((referrerRes.data || []) as AnalyticsTopRow[]).map((x) => [normalizeLabel(x.name), Number(x.clicks)] as const)
  const topDevices = ((deviceRes.data || []) as AnalyticsTopRow[]).map((x) => [normalizeLabel(x.name), Number(x.clicks)] as const)

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl py-8 space-y-8 relative z-10 px-4 sm:px-6 lg:px-8">
        <LinkDetailsHeader link={link} shortUrl={shortUrl} />

        <div className="flex items-center justify-end gap-2">
          <Button asChild variant="outline" className="h-9">
            <Link href={`/analytics?dateType=30d&region=country&device=device&linkId=${id}`}>
              在统计中心打开
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-9">
            <Link href={`/links/${id}/visits?range=${rangeDays}`}>
              查看访问明细
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
           {/* Stats Cards */}
           <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">PV</CardTitle>
               <MapPin className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{rangePv}</div>
               <p className="text-xs text-muted-foreground">
                 过去 {rangeDays} 天
               </p>
             </CardContent>
           </Card>
           
           <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">UV</CardTitle>
               <Users className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{rangeUv}</div>
               <p className="text-xs text-muted-foreground">
                 过去 {rangeDays} 天（按 IP 去重）
               </p>
             </CardContent>
           </Card>

           <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">最近访问</CardTitle>
               <Clock className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold truncate" title={lastVisit}>
                 {lastVisit}
               </div>
               <p className="text-xs text-muted-foreground">
                 过去 {rangeDays} 天内
               </p>
             </CardContent>
           </Card>
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
                      className="h-8"
                    >
                      <Link href={`/links/${id}?range=${d}`}>
                        {d} 天
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[350px] px-2">
              <VisitsChartSection data={chartData} />
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>详情信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {link.description && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">备注</label>
                    <p className="text-sm bg-muted/30 p-2 rounded-md">{link.description}</p>
                  </div>
              )}
              
              <div className="space-y-1">
                 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">来源地区（国家 Top 5）</label>
                 <div className="space-y-2 mt-2">
                    {topCountries.length > 0 ? (
                        topCountries.map(([country, count]) => (
                            <div key={country} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary/60"></span>
                                    {country}
                                </span>
                                <span className="font-mono font-medium">{count}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-muted-foreground">暂无地区数据</div>
                    )}
                 </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">来源地区（城市 Top 5）</label>
                <div className="space-y-2 mt-2">
                  {topCities.length > 0 ? (
                    topCities.map(([city, count]) => (
                      <div key={city} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary/60"></span>
                          {city}
                        </span>
                        <span className="font-mono font-medium">{count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">暂无城市数据</div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">来源分析（Top 5）</label>
                <div className="space-y-2 mt-2">
                  {topReferrers.length > 0 ? (
                    topReferrers.map(([ref, count]) => (
                      <div key={ref} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Compass className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate max-w-[180px]" title={ref}>
                            {ref}
                          </span>
                        </span>
                        <span className="font-mono font-medium">{count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">暂无来源数据</div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">设备概览</label>
                <div className="space-y-2 mt-2">
                  {topDevices.length > 0 ? (
                    topDevices.map(([device, count]) => (
                      <div key={device} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                          {device}
                        </span>
                        <span className="font-mono font-medium">{count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">暂无设备数据</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
