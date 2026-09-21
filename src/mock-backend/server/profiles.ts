import type { ApiGender, ApiUserGender } from './envelope'

export function ageFrom(birthDate: string, now = new Date()): number {
  const [year, month, day] = birthDate.split('-').map(Number)
  if (!year || !month || !day) return 0
  let age = now.getUTCFullYear() - year
  const beforeBirthday =
    now.getUTCMonth() + 1 < month || (now.getUTCMonth() + 1 === month && now.getUTCDate() < day)
  if (beforeBirthday) age -= 1
  return age
}

/**
 * The matching rule: a man sees women, a woman sees men. Fixed by the member's
 * gender rather than a preference, so it is enforced here on the server and
 * never left to the client.
 */
export function isShownTo(viewer: ApiUserGender, profile: ApiGender): boolean {
  return viewer === 'man' ? profile === 'woman' : profile === 'man'
}

/** A stable 0–1 roll per profile, so "do they like you back" never flip-flops. */
export function stableRoll(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return (h % 1000) / 1000
}
