/**
 * Device type mapping for display
 */
export const DEVICE_TYPE_MAP: Record<string, string> = {
  mobile: 'Mobile',
  desktop: 'Desktop',
  bot: 'Bot',
  unknown: 'Unknown',
  other: 'Other',
}

/**
 * Browser name mapping for display
 */
export const BROWSER_MAP: Record<string, string> = {
  chrome: 'Chrome',
  safari: 'Safari',
  firefox: 'Firefox',
  edge: 'Edge',
  opera: 'Opera',
  other: 'Other',
  unknown: 'Unknown',
}

/**
 * Operating system mapping for display
 */
export const OS_MAP: Record<string, string> = {
  windows: 'Windows',
  macos: 'macOS',
  ios: 'iOS',
  android: 'Android',
  linux: 'Linux',
  other: 'Other',
  unknown: 'Unknown',
}

/**
 * Normalize a label by replacing 'unknown' with '未知'
 * @param value - The label value to normalize
 * @returns The normalized label
 */
export function normalizeLabel(value: string): string {
  return value === 'unknown' ? '未知' : value
}

/**
 * Format device/browser/OS name for display
 * @param name - Raw name from analytics
 * @param type - Type of the name (device, browser, or os)
 * @returns Formatted name
 */
export function formatDeviceName(
  name: string,
  type: 'device' | 'browser' | 'os'
): string {
  const raw = (name || '').trim()

  if (!raw || raw === 'unknown') {
    return type === 'device'
      ? DEVICE_TYPE_MAP.unknown
      : type === 'browser'
        ? BROWSER_MAP.unknown
        : OS_MAP.unknown
  }

  const map = type === 'device'
    ? DEVICE_TYPE_MAP
    : type === 'browser'
      ? BROWSER_MAP
      : OS_MAP

  return map[raw] || raw
}

/**
 * Format region name for display
 * @param name - Raw region name
 * @returns Formatted region name ('未知' for unknown)
 */
export function formatRegionName(name: string): string {
  const raw = (name || '').trim()
  return !raw || raw === 'unknown' ? '未知' : raw
}
