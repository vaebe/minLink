
'use client'

import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/chart'
import type { VisitsChartPoint } from '@/lib/analytics/types'
import { VisitsChartTooltipContent } from '@/components/visits-chart-tooltip'

const chartConfig = {
  pv: {
    label: 'PV',
    color: 'var(--primary)',
  },
  uv: {
    label: 'UV',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

function RoundedAreaChart(props: React.ComponentProps<typeof AreaChart>) {
  const { width, height, ...rest } = props

  return (
    <AreaChart
      width={typeof width === 'number' ? Math.round(width) : width}
      height={typeof height === 'number' ? Math.round(height) : height}
      {...rest}
    />
  )
}

export function VisitsChart({ data }: { data: VisitsChartPoint[] }) {
  const uniqueId = React.useId()
  const defsId = uniqueId.replace(/:/g, '')
  const pvGradientId = `${defsId}-pv`
  const uvGradientId = `${defsId}-uv`

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        暂无访问数据
      </div>
    )
  }

  return (
    <ChartContainer className="h-full w-full aspect-auto" config={chartConfig}>
      <RoundedAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={pvGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-pv)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-pv)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={uvGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-uv)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-uv)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
        <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
        />
        <YAxis 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}`} 
            width={30}
        />
        <ChartTooltip content={<VisitsChartTooltipContent />} />
        <Area 
            type="monotone" 
            dataKey="pv" 
            stroke="var(--color-pv)" 
            fillOpacity={1} 
            fill={`url(#${pvGradientId})`} 
            strokeWidth={3}
            isAnimationActive={false}
            shapeRendering="geometricPrecision"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
        />
        <Area
          type="monotone"
          dataKey="uv"
          stroke="var(--color-uv)"
          fillOpacity={1}
          fill={`url(#${uvGradientId})`}
          strokeWidth={2}
          isAnimationActive={false}
          shapeRendering="geometricPrecision"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </RoundedAreaChart>
    </ChartContainer>
  )
}
