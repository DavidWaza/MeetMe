/**
 * Everything the mock backend "persists" goes through here.
 *
 * Every read and write is wrapped: `localStorage` throws in private windows and
 * with site data blocked, and a dating app that white-screens because storage
 * is disabled is worse than one that forgets your swipes.
 */
const NAMESPACE = 'meetme'

export function storageKey(name: string): string {
  return `${NAMESPACE}:${name}`
}

export function readStored<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(storageKey(name))
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeStored(name: string, value: unknown): void {
  try {
    localStorage.setItem(storageKey(name), JSON.stringify(value))
  } catch {
    /* storage unavailable — the session simply doesn't survive reload */
  }
}

export function clearStored(name: string): void {
  try {
    localStorage.removeItem(storageKey(name))
  } catch {
    /* no-op */
  }
}
