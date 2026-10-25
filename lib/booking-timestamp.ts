// MySQL dateStrings are India-local; explicit offsets must retain their meaning.
export function formatBookingTimestamp(value?: string | null): { date: string; time: string } {
  if (!value) return { date: 'Not available', time: '—' }
  const raw = value.trim()
  const localTimestamp = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(raw)
  const date = new Date(localTimestamp ? `${raw.replace(' ', 'T')}+05:30` : raw)
  if (Number.isNaN(date.getTime())) return { date: 'Not available', time: '—' }
  return {
    date: date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }),
    time: date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase(),
  }
}
