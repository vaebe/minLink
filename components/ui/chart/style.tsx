"use client"

import * as React from "react"

import type { ChartConfig } from "./context"
import { THEMES } from "./constants"

export function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const cssText = React.useMemo(() => {
    const colorConfig = Object.entries(config).filter(
      ([, itemConfig]) => itemConfig.theme || itemConfig.color
    )

    if (!colorConfig.length) {
      return ""
    }

    return Object.entries(THEMES)
      .map(
        ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
      )
      .join("\n")
  }, [config, id])

  if (!cssText) {
    return null
  }

  return <style dangerouslySetInnerHTML={{ __html: cssText }} />
}

