import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataList } from './data-list'
import { Compass, MapPin, Monitor } from 'lucide-react'

interface GeographicData {
  countries: Array<[string, number]>
  cities: Array<[string, number]>
  referrers: Array<[string, number]>
  devices: Array<[string, number]>
  description?: string | null
}

interface LinkDetailsCardProps {
  data: GeographicData
}

export function LinkDetailsCard({ data }: LinkDetailsCardProps) {
  const { countries, cities, referrers, devices, description } = data

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>详情信息</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {description && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              备注
            </label>
            <p className="text-sm bg-muted/30 p-2 rounded-md">{description}</p>
          </div>
        )}

        <DataList
          items={countries.map(([name, count]) => ({ name, count }))}
          icon={MapPin}
          label="来源地区（国家 Top 5）"
          emptyMessage="暂无地区数据"
        />

        <DataList
          items={cities.map(([name, count]) => ({ name, count }))}
          icon={MapPin}
          label="来源地区（城市 Top 5）"
          emptyMessage="暂无城市数据"
        />

        <DataList
          items={referrers.map(([name, count]) => ({ name, count }))}
          icon={Compass}
          label="来源分析（Top 5）"
          emptyMessage="暂无来源数据"
        />

        <DataList
          items={devices.map(([name, count]) => ({ name, count }))}
          icon={Monitor}
          label="设备概览"
          emptyMessage="暂无设备数据"
        />
      </CardContent>
    </Card>
  )
}
