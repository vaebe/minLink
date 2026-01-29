import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption } from '@/components/ui/table'
import { ArrowLeft, Search } from 'lucide-react'

function maskIp(ip: string | null) {
  if (!ip) return '—'
  if (ip.includes('.')) {
    const parts = ip.split('.')
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.***`
    return ip
  }
  if (ip.includes(':')) {
    const parts = ip.split(':').filter(Boolean)
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}:****`
    return ip
  }
  return ip
}

function normalizeReferrer(referrer: string | null) {
  const raw = (referrer || '').trim()
  if (!raw) return 'direct'
  if (raw === 'direct') return 'direct'
  try {
    return new URL(raw).hostname || 'direct'
  } catch {
    return raw
  }
}

export default async function LinkVisitsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ range?: string; page?: string; country?: string; ref?: string }>
}) {
  const { id } = await params
  const { range, page, country, ref } = await searchParams
  const supabase = await createClient()

  const { data: link, error } = await supabase
    .from('links')
    .select('id, short_code, user_id, is_public')
    .eq('id', id)
    .single()

  if (error || !link) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwner = user?.id === link.user_id

  if (!link.is_public && !isOwner) {
    notFound()
  }

  const rangeDays = (() => {
    const raw = Number(range)
    if (raw === 7 || raw === 30 || raw === 90) return raw
    return 30
  })()

  const rangeStartAt = (() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (rangeDays - 1))
    return d
  })()

  const pageSize = 25
  const currentPage = Math.max(1, Number(page) || 1)
  const from = (currentPage - 1) * pageSize
  const to = from + pageSize - 1

  const buildHref = (next: { range?: number; page?: number; country?: string; ref?: string }) => {
    const sp = new URLSearchParams()
    const nextRange = next.range ?? rangeDays
    sp.set('range', String(nextRange))
    const nextPage = next.page ?? 1
    sp.set('page', String(nextPage))
    const nextCountry = (next.country ?? country ?? '').trim()
    const nextRef = (next.ref ?? ref ?? '').trim()
    if (nextCountry) sp.set('country', nextCountry)
    if (nextRef) sp.set('ref', nextRef)
    return `/links/${id}/visits?${sp.toString()}`
  }

  let query = supabase
    .from('visits')
    .select('id, created_at, country, city, referrer, user_agent, ip', { count: 'exact' })
    .eq('link_id', id)
    .gte('created_at', rangeStartAt.toISOString())

  const countryFilter = (country || '').trim()
  if (countryFilter) {
    query = query.eq('country', countryFilter)
  }

  const refFilter = (ref || '').trim()
  if (refFilter) {
    if (refFilter === 'direct') {
      query = query.or('referrer.eq.direct,referrer.is.null')
    } else {
      query = query.ilike('referrer', `%${refFilter}%`)
    }
  }

  const { data: visits, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  const total = count || 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="min-h-screen bg-background relative pb-20">
      <div className="mx-auto max-w-7xl py-8 space-y-6 relative z-10">
        <Link href={`/links/${id}?range=${rangeDays}`} className="text-muted-foreground hover:text-foreground flex items-center text-sm w-fit transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" /> 返回统计
        </Link>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <CardTitle>访问明细</CardTitle>
                <CardDescription>
                  /{link.short_code} · 过去 {rangeDays} 天 · 共 {total} 条
                </CardDescription>
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
                    <Link href={buildHref({ range: d, page: 1 })}>
                      {d} 天
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            <form action={`/links/${id}/visits`} method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input type="hidden" name="range" value={String(rangeDays)} />
              <input type="hidden" name="page" value="1" />
              <div className="flex-1">
                <Label htmlFor="visits-country" className="sr-only">
                  国家筛选
                </Label>
                <Input
                  id="visits-country"
                  name="country"
                  defaultValue={countryFilter}
                  placeholder="国家筛选（例如 CN / 中国 / United States）"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="visits-ref" className="sr-only">
                  Referrer 筛选
                </Label>
                <Input id="visits-ref" name="ref" defaultValue={refFilter} placeholder="Referrer 关键词（例如 google / direct）" />
              </div>
              <Button type="submit" className="h-9">
                <Search className="mr-2 h-4 w-4" /> 筛选
              </Button>
            </form>
          </CardHeader>
          <CardContent className="space-y-4">
            {!visits || visits.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">暂无访问记录</div>
            ) : (
              <Table>
                <TableCaption className="sr-only">访问明细表</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>地区</TableHead>
                    <TableHead>Referrer</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>User-Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((v) => {
                    const time = new Date(v.created_at).toLocaleString('zh-CN')
                    const region = `${(v.country || '未知').toString()} ${(v.city || '').toString()}`.trim()
                    const refHost = normalizeReferrer(v.referrer)
                    const ua = (v.user_agent || '').toString()
                    const uaShort = ua.length > 64 ? `${ua.slice(0, 64)}…` : ua
                    return (
                      <TableRow key={v.id}>
                        <TableCell className="font-mono text-xs">{time}</TableCell>
                        <TableCell>{region || '未知'}</TableCell>
                        <TableCell>
                          <span className="truncate inline-block max-w-55" title={v.referrer || ''}>
                            {refHost}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{maskIp(v.ip ? String(v.ip) : null)}</TableCell>
                        <TableCell>
                          <span className="truncate inline-block max-w-105" title={ua}>
                            {uaShort || '—'}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                第 {currentPage} / {totalPages} 页
              </div>
              <div className="flex items-center gap-2">
                {currentPage <= 1 ? (
                  <Button size="sm" variant="outline" className="h-8" disabled>
                    上一页
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline" className="h-8">
                    <Link href={buildHref({ page: Math.max(1, currentPage - 1) })}>上一页</Link>
                  </Button>
                )}
                {currentPage >= totalPages ? (
                  <Button size="sm" variant="outline" className="h-8" disabled>
                    下一页
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline" className="h-8">
                    <Link href={buildHref({ page: Math.min(totalPages, currentPage + 1) })}>下一页</Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
