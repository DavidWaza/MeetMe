import { computed, ref, shallowRef, watch, type Ref } from 'vue'

/**
 * A ~60-line stand-in for TanStack Query, shaped the same way.
 *
 * The slices depend on the *shape* (`data` / `isLoading` / `isFetching` /
 * `error` / `refetch`, a reactive key, `enabled` as a thunk), not on TanStack
 * itself. Swapping this for the real library later is a change to the query
 * adapters and nothing above them.
 *
 * Two behaviours here are load-bearing and match the blueprint:
 *
 * - `keepPreviousData` — without it a list empties on every filter change, the
 *   card collapses to its loading height and the viewport jumps.
 * - A stale window — remounting a component does not refetch inside it, so a
 *   mutation must invalidate explicitly.
 */
export const DEFAULT_STALE_TIME_MS = 5 * 60 * 1000

interface TypeCacheEntry {
  data: unknown
  storedAt: number
}

const cache = new Map<string, TypeCacheEntry>()

/** Drops every cache entry whose key starts with `prefix`. Keys hang off a root
 *  so a sibling slice can invalidate by prefix. */
export function invalidateQueries(prefix: string): void {
  // Deleting the current entry mid-iteration is well-defined for a Map.
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}

export interface TypeQueryOptions<T> {
  key: () => string
  fn: () => Promise<T>
  enabled?: () => boolean
  keepPreviousData?: boolean
  staleTime?: number
}

export interface TypeQueryResult<T> {
  data: Ref<T | undefined>
  error: Ref<Error | undefined>
  isLoading: Ref<boolean>
  isFetching: Ref<boolean>
  refetch: () => Promise<void>
}

export function useQuery<T>(options: TypeQueryOptions<T>): TypeQueryResult<T> {
  const staleTime = options.staleTime ?? DEFAULT_STALE_TIME_MS
  const data = shallowRef<T | undefined>(undefined)
  const error = shallowRef<Error | undefined>(undefined)
  const isFetching = ref(false)
  const key = computed(() => options.key())
  const enabled = computed(() => options.enabled?.() ?? true)

  // A query that has never resolved is "loading"; one refetching behind
  // previous data is only "fetching". Screens spin on the first and show a
  // quiet indicator on the second.
  const isLoading = computed(() => isFetching.value && data.value === undefined)

  let runId = 0

  async function run(force = false): Promise<void> {
    if (!enabled.value) return

    const currentKey = key.value
    const cached = cache.get(currentKey)

    if (!force && cached && Date.now() - cached.storedAt < staleTime) {
      data.value = cached.data as T
      error.value = undefined
      return
    }

    if (!options.keepPreviousData) data.value = undefined

    const id = ++runId
    isFetching.value = true

    try {
      const result = await options.fn()
      if (id !== runId) return // a newer run superseded this one
      cache.set(currentKey, { data: result, storedAt: Date.now() })
      data.value = result
      error.value = undefined
    } catch (caught) {
      if (id !== runId) return
      error.value = caught instanceof Error ? caught : new Error(String(caught))
    } finally {
      if (id === runId) isFetching.value = false
    }
  }

  watch([key, enabled], () => void run(), { immediate: true })

  return { data, error, isLoading, isFetching, refetch: () => run(true) }
}

export interface TypeMutationResult<TArgs extends unknown[], TResult> {
  mutate: (...args: TArgs) => Promise<TResult>
  isPending: Ref<boolean>
  error: Ref<Error | undefined>
}

export function useMutation<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): TypeMutationResult<TArgs, TResult> {
  const isPending = ref(false)
  const error = shallowRef<Error | undefined>(undefined)

  async function mutate(...args: TArgs): Promise<TResult> {
    isPending.value = true
    error.value = undefined
    try {
      return await fn(...args)
    } catch (caught) {
      error.value = caught instanceof Error ? caught : new Error(String(caught))
      throw caught
    } finally {
      isPending.value = false
    }
  }

  return { mutate, isPending, error }
}
