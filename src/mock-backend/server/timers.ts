/**
 * Pending simulated events (read receipts, typing, replies) per match.
 *
 * Tracked so unmatching or resetting cancels them — otherwise a reply lands in
 * a conversation that no longer exists.
 */
const pending = new Map<string, Set<ReturnType<typeof setTimeout>>>()

export function schedule(matchId: string, ms: number, run: () => void): void {
  const bucket = pending.get(matchId) ?? new Set()
  const timer = setTimeout(() => {
    bucket.delete(timer)
    run()
  }, ms)
  bucket.add(timer)
  pending.set(matchId, bucket)
}

export function cancelTimers(matchId?: string): void {
  const ids = matchId ? [matchId] : [...pending.keys()]
  for (const id of ids) {
    for (const timer of pending.get(id) ?? []) clearTimeout(timer)
    pending.delete(id)
  }
}
