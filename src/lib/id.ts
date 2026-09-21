let counter = 0

/** Collision-free enough for one tab's lifetime; not a UUID and not sent anywhere. */
export function createId(prefix = 'id'): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`
}
