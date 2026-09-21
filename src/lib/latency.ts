/**
 * Mock transports fake latency deliberately.
 *
 * A fixture that resolves in the same tick never renders the loading branch, so
 * you ship a skeleton nobody has ever seen. These are the blueprint's numbers.
 */
export const MOCK_LIST_LATENCY_MS = 400
export const MOCK_MUTATION_LATENCY_MS = 650

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Latency with a little jitter, so repeated calls don't land in lockstep. */
export function mockLatency(base: number): Promise<void> {
  return sleep(base + Math.round(Math.random() * base * 0.35))
}
