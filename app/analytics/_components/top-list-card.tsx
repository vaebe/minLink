import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { buildAnalyticsUrl } from '@/lib/analytics/utils'
import type { DateType, DeviceDim, RegionDim, AnalyticsTopRow } from '@/lib/analytics/types'

type Tab = {
  key: string
  label: string
}

export function TopListCard({
  icon,
  title,
  description,
  tabs,
  activeKey,
  paramName,
  items,
  dateType,
  region,
  device,
  linkId,
  fillClassName,
}: {
  icon: React.ReactNode
  title: string
  description: string
  tabs: Tab[]
  activeKey: string
  paramName: 'region' | 'device'
  items: AnalyticsTopRow[]
  dateType: DateType
  region: RegionDim
  device: DeviceDim
  linkId: string
  fillClassName: string
}) {
  const maxValue = Math.max(0, ...items.map((x) => x.clicks))

  const formatName = (name: string) => {
    const raw = (name || '').trim()
    if (!raw || raw === 'unknown') return paramName === 'region' ? '未知' : 'Unknown'

    if (paramName !== 'device') return raw

    if (activeKey === 'device') {
      const map: Record<string, string> = { mobile: 'Mobile', desktop: 'Desktop', bot: 'Bot', unknown: 'Unknown', other: 'Other' }
      return map[raw] || raw
    }
    if (activeKey === 'browser') {
      const map: Record<string, string> = {
        chrome: 'Chrome',
        safari: 'Safari',
        firefox: 'Firefox',
        edge: 'Edge',
        opera: 'Opera',
        other: 'Other',
        unknown: 'Unknown',
      }
      return map[raw] || raw
    }
    if (activeKey === 'os') {
      const map: Record<string, string> = {
        windows: 'Windows',
        macos: 'macOS',
        ios: 'iOS',
        android: 'Android',
        linux: 'Linux',
        other: 'Other',
        unknown: 'Unknown',
      }
      return map[raw] || raw
    }
    return raw
  }

  const buildUrl = (key: string) => {
    if (paramName === 'region') {
      return buildAnalyticsUrl({ dateType, region: key as RegionDim, device, linkId })
    }
    return buildAnalyticsUrl({ dateType, region, device: key as DeviceDim, linkId })
  }

  return (
    <Card className="glass-panel border-0 shadow-sm overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/5 text-primary">
                {icon}
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                <CardDescription className="text-xs">{description}</CardDescription>
              </div>
            </div>
          </div>

          <div className="flex bg-muted/50 p-1 rounded-lg w-full">
            {tabs.map((x) => (
              <Button
                key={x.key}
                asChild
                variant="ghost"
                size="sm"
                className={`w-full h-7 text-xs font-medium rounded-md transition-all flex-1 ${
                  x.key === activeKey ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Link href={buildUrl(x.key)}>
                  {x.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-4 flex-1 overflow-auto">
        <div className="space-y-1">
          {items.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">暂无数据</div>
          ) : (
            items.map((item, i) => (
              <div
                key={item.name}
                className="relative group flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-default"
              >
                {/* Progress Bar Background */}
                <div
                  className={`absolute left-0 top-0 bottom-0 rounded-lg opacity-10 transition-all group-hover:opacity-20 ${fillClassName}`}
                  style={{
                    width: `${maxValue === 0 ? 0 : (item.clicks / maxValue) * 100}%`,
                  }}
                />

                <div className="relative z-10 flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-muted-foreground w-4 text-center">{i + 1}</span>
                  <span className="text-sm font-medium truncate">{formatName(item.name)}</span>
                </div>

                <div className="relative z-10 font-mono text-sm font-semibold tabular-nums">
                  {item.clicks.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
