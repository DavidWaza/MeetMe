import type { ApiMessage } from '@/api/types'

/**
 * The mock backend's push channel.
 *
 * A real deployment would put a WebSocket, SSE stream or a poll loop here. The
 * app never knows which: each slice reads this through its own realtime *port*,
 * and only the mock adapter behind that port imports this file. Replacing the
 * transport is a new adapter and a one-line change in `composition/`.
 */
export type TypeChannelEvent =
  | { type: 'typing'; match_id: string; is_typing: boolean }
  | { type: 'message'; match_id: string; profile_name: string; message: ApiMessage }
  | { type: 'delivery'; match_id: string; message_ids: string[]; delivery: string }
  | { type: 'match'; match_id: string; profile_name: string }
  | { type: 'inbox' }

type TypeListener = (event: TypeChannelEvent) => void

const listeners = new Set<TypeListener>()

export function subscribe(listener: TypeListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emit(event: TypeChannelEvent): void {
  // Snapshot: a listener added while this event is being delivered should not
  // receive it (a Set would visit it).
  for (const listener of Array.from(listeners)) listener(event)
}
