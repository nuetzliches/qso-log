export function nowUtcIso(): string {
  return new Date().toISOString()
}

export function formatUtcDate(isoString: string): string {
  const d = new Date(isoString)
  return d.toISOString().slice(0, 10)
}

export function formatUtcTime(isoString: string): string {
  const d = new Date(isoString)
  return d.toISOString().slice(11, 16)
}

export function formatUtcDateTime(isoString: string): string {
  return `${formatUtcDate(isoString)} ${formatUtcTime(isoString)}`
}

export function toIsoString(date: string, time: string): string {
  return `${date}T${time}:00.000Z`
}

export function formatDateForAdif(isoString: string): string {
  const d = new Date(isoString)
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

export function formatTimeForAdif(isoString: string): string {
  const d = new Date(isoString)
  const hours = String(d.getUTCHours()).padStart(2, '0')
  const minutes = String(d.getUTCMinutes()).padStart(2, '0')
  return `${hours}${minutes}`
}
