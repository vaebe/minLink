import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { BarChart3, Lock, ChevronDown } from 'lucide-react'
import type { DateType, DeviceDim, RegionDim } from '@/lib/analytics/types'
import { buildAnalyticsUrl } from '@/lib/analytics/utils'
import type { User as SupabaseUser } from '@supabase/supabase-js'

type LinkItem = {
  id: string
  short_code: string
  description: string | null
}

export function AnalyticsHeader({
  user,
  links,
  dateType,
  region,
  device,
  linkId,
  scopeLabel,
}: {
  user: SupabaseUser | null
  links: LinkItem[]
  dateType: DateType
  region: RegionDim
  device: DeviceDim
  linkId: string
  scopeLabel: string
}) {
  return (
    <div className="flex flex-col gap-8 pb-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">统计中心</h1>
          <p className="text-muted-foreground">实时监控访问趋势、地理分布与设备来源。</p>
        </div>

        <div className="bg-muted/50 p-1 rounded-xl inline-flex self-start md:self-auto backdrop-blur-md border border-border/50">
          {(['24h', '7d', '30d', '90d'] as const).map((t) => (
            <Button
              key={t}
              asChild
              variant="ghost"
              size="sm"
              className={`rounded-lg h-8 px-4 font-medium transition-all ${
                t === dateType ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Link href={buildAnalyticsUrl({ dateType: t, region, device, linkId })}>
                {t === '24h' ? '24小时' : t.replace('d', '天')}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto pl-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {user ? <BarChart3 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">当前范围</span>
            <span className="font-semibold text-sm">{scopeLabel}</span>
          </div>
        </div>

        {user ? (
          <form action="/analytics" method="get" className="flex items-center gap-3 w-full md:w-auto bg-background/50 rounded-xl p-1.5 border border-border/50">
            <input type="hidden" name="dateType" value={dateType} />
            <input type="hidden" name="region" value={region} />
            <input type="hidden" name="device" value={device} />

            <div className="relative w-full md:w-64 group px-2">
              <Label htmlFor="analytics-link-select" className="sr-only">
                选择短链
              </Label>
              <select
                id="analytics-link-select"
                name="linkId"
                defaultValue={linkId}
                className="w-full h-8 appearance-none bg-transparent pr-8 text-sm font-medium outline-none cursor-pointer text-foreground"
              >
                <option value="">所有短链数据</option>
                {links.map((l) => (
                  <option key={l.id} value={l.id}>
                    /{l.short_code}{l.description ? ` · ${l.description}` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none group-hover:text-foreground transition-colors" />
            </div>
            <Button type="submit" size="sm" className="rounded-lg h-8 px-4 shadow-none">
              筛选
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground pr-2">仅展示公开汇总数据</p>
        )}
      </div>
    </div>
  )
}
