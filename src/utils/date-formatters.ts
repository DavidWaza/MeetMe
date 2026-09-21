import { ref } from 'vue'

/**
 * Dates, with two invariants.
 *
 * 1. **One display zone.** Every formatter shifts into `APP_TIME_ZONE`, so two
 *    users never read the same timestamp differently.
 * 2. **One time pattern, resolved at call time** by `appTimePattern()`. A
 *    pattern pinned at a call site is a screen the preference cannot reach.
 *
 * The rule that follows: never write a bare `toLocaleTimeString` in a
 * component, and **pass raw timestamps down to the component that prints
 * them**. A label built inside a transformer is frozen in whichever format was
 * active when it ran, and the query cache holds it for five minutes.
 */
export const APP_TIME_ZONE = 'Africa/Lagos'

export type TypeTimePattern = '12h' | '24h'

const timePattern = ref<TypeTimePattern>('12h')

export function appTimePattern(): TypeTimePattern {
  return timePattern.value
}

export function setAppTimePattern(pattern: TypeTimePattern): void {
  timePattern.value = pattern
}

/**
 * Reconciles the shapes a backend sends:
 * - a date-time with no offset is UTC with the `Z` dropped;
 * - a bare `YYYY-MM-DD` is a calendar date anchored in the display zone;
 * - anything carrying an offset is honoured as sent.
 */
export function parseToDate(value: string | number | Date): Date {
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)

  const trimmed = value.trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return new Date(`${trimmed}T12:00:00Z`)
  if (/^\d{4}-\d{2}-\d{2}[T ][\d:.]+$/.test(trimmed))
    return new Date(`${trimmed.replace(' ', 'T')}Z`)

  return new Date(trimmed)
}

function zoned(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat('en-GB', { timeZone: APP_TIME_ZONE, ...options })
}

export function formatTime(value: string | number | Date): string {
  return zoned({
    hour: appTimePattern() === '12h' ? 'numeric' : '2-digit',
    minute: '2-digit',
    hour12: appTimePattern() === '12h',
  })
    .format(parseToDate(value))
    .toLowerCase()
}

export function formatDay(value: string | number | Date): string {
  return zoned({ day: 'numeric', month: 'short' }).format(parseToDate(value))
}

export function formatDateTime(value: string | number | Date): string {
  return `${formatDay(value)} · ${formatTime(value)}`
}

function startOfZonedDay(date: Date): number {
  // `en-CA` yields `YYYY-MM-DD`, which is the cheapest way to get a day key in
  // a fixed zone without pulling in a date library.
  const key = new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIME_ZONE }).format(date)
  return new Date(`${key}T00:00:00Z`).getTime()
}

/** "now", "4m", "2h", "Yesterday", "12 Mar" — the list/preview format. */
export function formatRelative(value: string | number | Date): string {
  const date = parseToDate(value)
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60_000)

  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`

  const dayDelta = Math.round((startOfZonedDay(new Date()) - startOfZonedDay(date)) / 86_400_000)

  if (dayDelta === 0) return `${Math.floor(minutes / 60)}h`
  if (dayDelta === 1) return 'Yesterday'
  if (dayDelta < 7) return `${dayDelta}d`

  return formatDay(date)
}

/** The sticky separator between days in a conversation. */
export function formatDayDivider(value: string | number | Date): string {
  const date = parseToDate(value)
  const dayDelta = Math.round((startOfZonedDay(new Date()) - startOfZonedDay(date)) / 86_400_000)

  if (dayDelta === 0) return 'Today'
  if (dayDelta === 1) return 'Yesterday'
  if (dayDelta < 7) return zoned({ weekday: 'long' }).format(date)

  return zoned({ day: 'numeric', month: 'long' }).format(date)
}

/** Two timestamps land in the same day bucket in the display zone. */
export function isSameZonedDay(a: string | number | Date, b: string | number | Date): boolean {
  return startOfZonedDay(parseToDate(a)) === startOfZonedDay(parseToDate(b))
}
