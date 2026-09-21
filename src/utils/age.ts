import { parseToDate } from './date-formatters'

/** Whole years since a bare `YYYY-MM-DD` birth date. */
export function ageFrom(birthDate: string, now = new Date()): number {
  const born = parseToDate(birthDate)
  if (Number.isNaN(born.getTime())) return 0
  let age = now.getUTCFullYear() - born.getUTCFullYear()
  const monthDelta = now.getUTCMonth() - born.getUTCMonth()
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < born.getUTCDate())) age -= 1
  return age
}
