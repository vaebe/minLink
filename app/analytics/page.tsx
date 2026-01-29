import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VisitsChartSection } from '@/components/visits-chart-section'
import { MapPinned, Monitor } from 'lucide-react'
import { AnalyticsHeader } from '@/app/analytics/_components/analytics-header'
import { TopListCard } from '@/app/analytics/_components/top-list-card'
import type { AnalyticsTimeRow, AnalyticsTopRow } from '@/lib/analytics/types'
import { getDateWindow, normalizeDateType, normalizeDeviceDim, normalizeRegionDim } from '@/lib/analytics/utils'

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{
    dateType?: string
    linkId?: string
    region?: string
    device?: string
  }>
}) {
  const sp = await searchParams
  const dateType = normalizeDateType(sp.dateType)
  const regionDim = normalizeRegionDim(sp.region)
  const deviceDim = normalizeDeviceDim(sp.device)

  const { startAt, endAt, bucket } = getDateWindow(dateType)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

  const linkId = (() => {
    const raw = (sp.linkId || '').trim()
    if (!raw) return ''
    return isUuid(raw) ? raw : ''
  })()

  const scope = user ? (linkId ? 'link' : 'user') : linkId ? 'link' : 'global'

  const startAtIso = startAt.toISOString()
  const endAtIso = endAt.toISOString()
  const pLinkId = scope === 'link' ? linkId : null

  const [linksQuery, timeRes, regionRes, deviceRes] = await Promise.all([
    user ? supabase.from('links').select('id, short_code, description').eq('user_id', user.id) : Promise.resolve(null),
    supabase.rpc('analytics_time', {
      scope,
      start_at: startAtIso,
      end_at: endAtIso,
      bucket,
      p_link_id: pLinkId,
    }),
    supabase.rpc('analytics_region', {
      scope,
      dimension: regionDim,
      start_at: startAtIso,
      end_at: endAtIso,
      p_link_id: pLinkId,
      limit_n: 20,
    }),
    supabase.rpc('analytics_device', {
      scope,
      dimension: deviceDim,
      start_at: startAtIso,
      end_at: endAtIso,
      p_link_id: pLinkId,
      limit_n: 20,
    }),
  ])

  const links = linksQuery?.data || []
  const linksError = linksQuery?.error || null

  const rpcErrors = [linksError, timeRes.error, regionRes.error, deviceRes.error].filter(Boolean)
  if (rpcErrors.length > 0) {
    const message = (rpcErrors[0]?.message || '').toString()
    return (
      <div className="min-h-screen bg-background relative pb-20">
        <div className="max-w-3xl py-16 space-y-6">
          <div className="text-3xl font-bold">统计暂不可用</div>
          <div className="text-muted-foreground">
            请确认已在 Supabase Dashboard 的 SQL Editor 执行 supabase/schema.sql（包含 analytics_time / analytics_region / analytics_device）。
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
  const timeSeries = timeRes.data
  const regionTop = regionRes.data
  const deviceTop = deviceRes.data

  const safeTime = ((timeSeries || []) as AnalyticsTimeRow[]).map((row) => {
    const d = new Date(row.bucket_start)
    const date =
      bucket === 'hour'
        ? d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    return { date, pv: Number(row.pv), uv: Number(row.uv) }
  })

  const totalPv = safeTime.reduce((acc, row) => acc + row.pv, 0)
  const totalUv = safeTime.reduce((acc, row) => acc + row.uv, 0)

  const safeRegion = ((regionTop || []) as AnalyticsTopRow[]).map((x) => ({
    name: x.name,
    clicks: Number(x.clicks),
  }))
  const safeDevice = ((deviceTop || []) as AnalyticsTopRow[]).map((x) => ({
    name: x.name,
    clicks: Number(x.clicks),
  }))

  const scopeLabel = (() => {
    if (!user && !linkId) return '全站匿名汇总'
    if (!user && linkId) return '单个短链（匿名）'
    if (!linkId) return '我的全部短链'
    const found = (links || []).find((l) => l.id === linkId)
    return found ? `/${found.short_code}` : '单个短链'
  })()

  return (
    <div className="min-h-screen pb-20 font-sans text-foreground selection:bg-primary/20">
      <div className="mx-auto max-w-7xl py-8 space-y-8 relative z-10 px-4 sm:px-6 lg:px-8">
        <AnalyticsHeader
          user={user}
          links={links || []}
          dateType={dateType}
          region={regionDim}
          device={deviceDim}
          linkId={linkId}
          scopeLabel={scopeLabel}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          <Card className="col-span-1 md:col-span-8 glass-panel border-0 shadow-sm flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">访问趋势</CardTitle>
              <CardDescription>
                {dateType === '24h' ? '过去 24 小时' : `过去 ${dateType.replace('d', '')} 天`} PV (浏览量) 与 UV (访客数)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-87.5 px-2">
              <VisitsChartSection data={safeTime} />
            </CardContent>
          </Card>

          {/* Key Metrics - Spans 4 cols */}
          <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
             {/* Total PV */}
             <Card className="glass-panel border-0 shadow-sm flex-1 flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2">
                   <CardDescription className="font-medium text-muted-foreground">总浏览量 (PV)</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="text-4xl font-bold tracking-tight text-foreground">{totalPv.toLocaleString()}</div>
                </CardContent>
             </Card>

             {/* Total UV */}
             <Card className="glass-panel border-0 shadow-sm flex-1 flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2">
                   <CardDescription className="font-medium text-muted-foreground">总访客数 (UV)</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="text-4xl font-bold tracking-tight text-foreground">{totalUv.toLocaleString()}</div>
                   <p className="text-xs text-muted-foreground mt-2">基于 IP 去重统计</p>
                </CardContent>
             </Card>
          </div>

          {/* Top Lists - Split 6/6 */}
          <div className="col-span-1 md:col-span-6 h-125">
             <TopListCard
               icon={<MapPinned className="h-4 w-4" />}
               title="地理分布"
               description="访问来源地区排行"
               tabs={[
                 { key: 'country', label: '国家' },
                 { key: 'region', label: '省份' },
                 { key: 'city', label: '城市' },
               ]}
               activeKey={regionDim}
               paramName="region"
               items={safeRegion}
               dateType={dateType}
               region={regionDim}
               device={deviceDim}
               linkId={linkId}
               fillClassName="bg-blue-500"
             />
          </div>

          <div className="col-span-1 md:col-span-6 h-125">
             <TopListCard
               icon={<Monitor className="h-4 w-4" />}
               title="设备环境"
               description="访问设备与系统排行"
               tabs={[
                 { key: 'device', label: '设备' },
                 { key: 'browser', label: '浏览器' },
                 { key: 'os', label: '系统' },
               ]}
               activeKey={deviceDim}
               paramName="device"
               items={safeDevice}
               dateType={dateType}
               region={regionDim}
               device={deviceDim}
               linkId={linkId}
               fillClassName="bg-purple-500"
             />
          </div>
        </div>
      </div>
    </div>
  )
}
