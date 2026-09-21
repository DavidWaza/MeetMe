/**
 * The mock backend's public surface.
 *
 * Treat this directory as if it were a separate server. The only files in the
 * app allowed to import it are `features/*\/*\/infrastructure/services/*-mock.ts`
 * (the mock service adapters) and the realtime mock adapters. A real HTTP
 * transport would sit beside those adapters and be swapped in, one line, in
 * each slice's `composition/` deps file.
 */
import type { ApiResponse } from './server/envelope'
import { apiOk } from './server/envelope'
import { MOCK_MUTATION_LATENCY_MS, mockLatency } from '@/lib/latency'
import { emit } from './channel'
import { resetUserActivity } from './db'
import { cancelTimers } from './server/timers'

export * as authApi from './server/auth'
export * as meApi from './server/me'
export * as deckApi from './server/deck'
export * as matchesApi from './server/matches'
export * as chatApi from './server/chat'
export * as rulesApi from './server/rules'
export { subscribe as subscribeToChannel, type TypeChannelEvent } from './channel'

/**
 * Wipe the signed-in user's activity: swipes, matches, messages and rules.
 * Their account and profile stay.
 */
export async function resetActivity(): Promise<ApiResponse<null>> {
  await mockLatency(MOCK_MUTATION_LATENCY_MS)
  cancelTimers()
  resetUserActivity()
  emit({ type: 'inbox' })
  return apiOk(null)
}
