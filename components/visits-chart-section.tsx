'use client'

import dynamic from 'next/dynamic'

import type { VisitsChartPoint } from '@/lib/analytics/types'

const VisitsChart = dynamic(
  () => import('@/components/visits-chart').then((mod) => mod.VisitsChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        图表加载中…
      </div>
    ),
  }
)

export function VisitsChartSection({ data }: { data: VisitsChartPoint[] }) {
  return <VisitsChart data={data} />
}