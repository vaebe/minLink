"use client"

import { ChartTooltipContent, type ChartTooltipContentProps } from "@/components/chart"

export function VisitsChartTooltipContent(props: ChartTooltipContentProps) {
  return (
    <ChartTooltipContent
      {...props}
      className="bg-background/95 border-primary/20 p-2 text-sm shadow-lg backdrop-blur-sm"
    />
  )
}
