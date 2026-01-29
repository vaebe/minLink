'use client'

import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import type { VisitsChartPoint } from '@/lib/analytics/types'

let chartInstanceCount = 0

export function VisitsChart({ data }: { data: VisitsChartPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        暂无访问数据
      </div>
    )
  }

  const instanceId = ++chartInstanceCount
  const pvGradientId = `pv-gradient-${instanceId}`
  const uvGradientId = `uv-gradient-${instanceId}`

  return (
    <div className="h-full w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={pvGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={uvGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
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
            width={50}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="bg-background/95 border-primary/20 p-2 text-sm shadow-lg backdrop-blur-sm rounded-lg border border-border/50">
                  <div className="font-medium mb-1">{payload[0].payload.date}</div>
                  {payload.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div
                        className="w-2 h-2 rounded-[2px]"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">
                        {item.dataKey === 'pv' ? 'PV' : 'UV'}
                      </span>
                      <span className="font-mono font-medium tabular-nums">
                        {typeof item.value === 'number'
                          ? item.value.toLocaleString()
                          : `${item.value}`}
                      </span>
                    </div>
                  ))}
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="pv"
            stroke="var(--primary)"
            fill={`url(#${pvGradientId})`}
            strokeWidth={2}
            isAnimationActive={false}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Area
            type="monotone"
            dataKey="uv"
            stroke="var(--chart-2)"
            fill={`url(#${uvGradientId})`}
            strokeWidth={2}
            isAnimationActive={false}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}