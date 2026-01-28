export type DateType = '24h' | '7d' | '30d' | '90d'
export type RegionDim = 'country' | 'region' | 'city'
export type DeviceDim = 'device' | 'browser' | 'os'

export type AnalyticsTimeRow = {
  bucket_start: string
  pv: number
  uv: number
}

export type VisitsChartPoint = {
  date: string
  pv: number
  uv: number
}

export type AnalyticsTopRow = {
  name: string
  clicks: number
}
