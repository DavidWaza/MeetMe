/** Slice-owned keys, hanging off one root so another slice can invalidate by prefix. */
export const DECK_QUERY_ROOT = 'discover/deck'

export const deckQueryKeys = {
  root: DECK_QUERY_ROOT,
  page: (limit: number) => `${DECK_QUERY_ROOT}/page?limit=${limit}`,
}
