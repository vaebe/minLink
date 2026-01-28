import type { DateType, DeviceDim, RegionDim } from '@/lib/analytics/types'

export function normalizeDateType(value: string | undefined): DateType {
  if (value === '24h' || value === '7d' || value === '30d' || value === '90d') return value
  return '30d'
}

export function normalizeRegionDim(value: string | undefined): RegionDim {
  if (value === 'country' || value === 'region' || value === 'city') return value
  return 'country'
}

export function normalizeDeviceDim(value: string | undefined): DeviceDim {
  if (value === 'device' || value === 'browser' || value === 'os') return value
  return 'device'
}

export function getDateWindow(dateType: DateType) {
  const endAt = new Date()
  const startAt = new Date(endAt)
  let bucket: 'hour' | 'day' = 'day'

  if (dateType === '24h') {
    bucket = 'hour'
    startAt.setHours(endAt.getHours() - 23, 0, 0, 0)
  } else {
    bucket = 'day'
    const days = dateType === '7d' ? 7 : dateType === '30d' ? 30 : 90
    startAt.setHours(0, 0, 0, 0)
    startAt.setDate(startAt.getDate() - (days - 1))
  }

  return { startAt, endAt, bucket }
}

export function buildAnalyticsUrl(params: {
  dateType: DateType
  region: RegionDim
  device: DeviceDim
  linkId?: string
}) {
  const sp = new URLSearchParams()
  sp.set('dateType', params.dateType)
  sp.set('region', params.region)
  sp.set('device', params.device)
  const linkId = (params.linkId || '').trim()
  if (linkId) sp.set('linkId', linkId)
  return `/analytics?${sp.toString()}`
}

