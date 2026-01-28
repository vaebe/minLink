
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { isIP } from 'node:net'

type IpApiResponse =
  | {
      status: 'success'
      country?: string
      countryCode?: string
      region?: string
      regionName?: string
      city?: string
      query?: string
    }
  | {
      status: 'fail'
      message?: string
      query?: string
    }

type UaClassification = {
  deviceType: string
  browserName: string
  osName: string
}

const ipApiCache = globalThis as unknown as {
  __minlink_ip_api_cache__?: Map<string, { value: IpApiResponse; expiresAtMs: number }>
}

function getIpApiCache() {
  if (!ipApiCache.__minlink_ip_api_cache__) {
    ipApiCache.__minlink_ip_api_cache__ = new Map()
  }
  return ipApiCache.__minlink_ip_api_cache__
}

function isPrivateOrReservedIp(ip: string) {
  const normalized = ip.toLowerCase()

  if (normalized === '::1') return true
  if (normalized.startsWith('::ffff:')) {
    const v4 = normalized.slice('::ffff:'.length)
    return isPrivateOrReservedIp(v4)
  }

  if (normalized.includes('.')) {
    const [a, b] = normalized.split('.').map((x) => Number(x))
    if (!Number.isFinite(a) || !Number.isFinite(b)) return true
    if (a === 10) return true
    if (a === 127) return true
    if (a === 0) return true
    if (a === 169 && b === 254) return true
    if (a === 192 && b === 168) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    return false
  }

  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true
  if (normalized.startsWith('fe80:')) return true
  return false
}

function getIpForVisitAndGeo(request: NextRequest) {
  const header = request.headers.get('x-forwarded-for') || ''
  const candidates = header
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => {
      const withoutPort = x.includes(':') && x.includes('.') && x.lastIndexOf(':') > x.lastIndexOf('.') ? x.slice(0, x.lastIndexOf(':')) : x
      return withoutPort.trim()
    })

  const firstValid = candidates.find((cand) => isIP(cand)) || null
  const firstPublic = candidates.find((cand) => isIP(cand) && !isPrivateOrReservedIp(cand)) || null

  const storageIp = firstValid
  const geoQueryIp =
    firstPublic ?? (process.env.NODE_ENV === 'development' ? '' : null)

  return { storageIp, geoQueryIp }
}

function classifyUserAgent(userAgent: string): UaClassification {
  const ua = userAgent.toLowerCase()

  const deviceType = (() => {
    if (!ua) return 'unknown'
    if (ua.includes('bot') || ua.includes('spider') || ua.includes('crawler')) return 'bot'
    if (ua.includes('android') || ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod') || ua.includes('mobile'))
      return 'mobile'
    return 'desktop'
  })()

  const osName = (() => {
    if (!ua) return 'unknown'
    if (ua.includes('windows')) return 'windows'
    if (ua.includes('mac os x') || ua.includes('macintosh')) return 'macos'
    if (ua.includes('android')) return 'android'
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'ios'
    if (ua.includes('linux')) return 'linux'
    return 'other'
  })()

  const browserName = (() => {
    if (!ua) return 'unknown'
    if (ua.includes('edg/')) return 'edge'
    if (ua.includes('chrome/') && !ua.includes('edg/') && !ua.includes('opr/')) return 'chrome'
    if (ua.includes('safari/') && !ua.includes('chrome/') && !ua.includes('chromium/')) return 'safari'
    if (ua.includes('firefox/')) return 'firefox'
    if (ua.includes('opr/') || ua.includes('opera/')) return 'opera'
    return 'other'
  })()

  return { deviceType, browserName, osName }
}

async function fetchGeoByIp(ip: string): Promise<IpApiResponse> {
  const cache = getIpApiCache()
  const cached = cache.get(ip)
  if (cached && cached.expiresAtMs > Date.now()) return cached.value

  const url = new URL(`http://ip-api.com/json/${encodeURIComponent(ip)}`)
  url.searchParams.set(
    'fields',
    [
      'status',
      'message',
      'query',
      'country',
      'countryCode',
      'region',
      'regionName',
      'city',
    ].join(',')
  )
  url.searchParams.set('lang', 'zh-CN')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 1500)

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      signal: controller.signal,
      headers: { 'accept': 'application/json' },
      cache: 'no-store',
    })
    const json = (await res.json()) as IpApiResponse
    const ttlMs = json.status === 'success' ? 24 * 60 * 60 * 1000 : 5 * 60 * 1000
    cache.set(ip, { value: json, expiresAtMs: Date.now() + ttlMs })
    return json
  } catch {
    const fallback: IpApiResponse = { status: 'fail', message: 'fetch_failed', query: ip }
    cache.set(ip, { value: fallback, expiresAtMs: Date.now() + 60 * 1000 })
    return fallback
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const shortCode = (await params).shortCode
  const supabase = await createClient()

  // 1. Get link
  const { data: link, error } = await supabase
    .from('links')
    .select('id, original_url, visits_count')
    .eq('short_code', shortCode)
    .single()

  if (error || !link) {
    // Return 404 or redirect to home with error
    return NextResponse.redirect(new URL('/?error=not_found', request.url))
  }

  const userAgent = request.headers.get('user-agent') || 'unknown'
  const { storageIp, geoQueryIp } = getIpForVisitAndGeo(request)
  const referer = request.headers.get('referer') || 'direct'

  const ua = classifyUserAgent(userAgent)

  const geo = geoQueryIp !== null ? await fetchGeoByIp(geoQueryIp) : null

  const country = geo?.status === 'success' ? geo.country || 'unknown' : 'unknown'
  const countryCode = geo?.status === 'success' ? geo.countryCode || 'unknown' : 'unknown'
  const regionCode = geo?.status === 'success' ? geo.region || 'unknown' : 'unknown'
  const regionName = geo?.status === 'success' ? geo.regionName || 'unknown' : 'unknown'
  const city = geo?.status === 'success' ? geo.city || 'unknown' : 'unknown'

  await Promise.allSettled([
    supabase.from('visits').insert({
      link_id: link.id,
      user_agent: userAgent,
      ip: storageIp,
      country: country,
      country_code: countryCode,
      region_code: regionCode,
      region_name: regionName,
      city: city,
      referrer: referer,
      device_type: ua.deviceType,
      browser_name: ua.browserName,
      os_name: ua.osName,
    }),
    supabase.rpc('increment_visits', { row_id: link.id }),
  ])

  return NextResponse.redirect(link.original_url)
}
