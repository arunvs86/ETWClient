export function formatPrice(amountMinor: number, currency: string, isFree?: boolean) {
    if (isFree || amountMinor === 0) return 'Free'
    const amount = (amountMinor ?? 0) / 100
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'GBP', maximumFractionDigits: 2 }).format(amount)
  }
  
  export function formatDuration(totalSec = 0) {
    const h = Math.floor(totalSec / 3600)
    const m = Math.round((totalSec % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }
  
  export function titleCase(s = '') {
    return s.replace(/\b\w/g, (c) => c.toUpperCase())
  }
  