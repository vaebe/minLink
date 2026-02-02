"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { BarChart3, Lock } from 'lucide-react'
import type { DateType, DeviceDim, RegionDim } from '@/lib/analytics/types'
import { buildAnalyticsUrl } from '@/lib/analytics/utils'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

type LinkItem = {
  id: string
  short_code: string
  description: string | null
}

interface AnalyticsHeaderProps {
  user: SupabaseUser | null
  links: LinkItem[]
  dateType: DateType
  region: RegionDim
  device: DeviceDim
  linkId: string
  scopeLabel: string
}

const TimeTypeList: DateType[] = ['24h', '7d', '30d', '90d']

export function AnalyticsHeader(props: AnalyticsHeaderProps) {

  const { user, links, dateType, region, device, linkId, scopeLabel, } = props

  const router = useRouter()
  const [selectedLinkId, setSelectedLinkId] = useState(linkId || 'all')

  const handleLinkChange = (value: string) => {
    setSelectedLinkId(value)
    router.push(buildAnalyticsUrl({ dateType, region, device, linkId: value === 'all' ? '' : value }))
  }

  return (
    <div className="flex flex-col gap-8 pb-2">
      <PageHeader
        title="统计中心"
        description="实时监控访问趋势、地理分布与设备来源。"
      >
        <div className="bg-muted/50 p-1 rounded-xl inline-flex self-start md:self-auto backdrop-blur-md border border-border/50">
          {TimeTypeList.map((t) => (
            <Button
              key={t}
              asChild
              variant="ghost"
              size="sm"
              className={`rounded-lg h-8 px-4 font-medium transition-all 
                ${t === dateType ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`
              }
            >
              <Link href={buildAnalyticsUrl({ dateType: t, region, device, linkId })}>
                {t === '24h' ? '24小时' : t.replace('d', '天')}
              </Link>
            </Button>
          ))}
        </div>
      </PageHeader>

      <Card className="flex flex-col md:flex-row items-center justify-between gap-4 px-4">
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
          <Select value={selectedLinkId} onValueChange={handleLinkChange}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="选择短链" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有短链数据</SelectItem>
              {links.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  /{l.short_code}{l.description ? ` · ${l.description}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-sm text-muted-foreground pr-2">仅展示公开汇总数据</p>
        )}
      </Card>
    </div>
  )
}
