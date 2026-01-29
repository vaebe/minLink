"use client"

import {ComponentProps} from "react"
import {ResponsiveContainer} from "recharts"
import { cn } from "@/lib/utils"
import type { ChartConfig } from "./context"
import { ChartContext } from "./context"
import { ChartStyle } from "./style"
import { nanoid } from 'nanoid'

export function ChartContainer({
  className,
  children,
  config,
}: ComponentProps<"div"> & {
  config: ChartConfig
  children: ComponentProps<  typeof ResponsiveContainer>["children"]
}) {
  const chartId = `chart-${nanoid(6)}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
      >
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer>
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

