export type TypeClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | TypeClassValue[]
  | Record<string, boolean | null | undefined>

/**
 * Joins class values, last-wins by source order.
 *
 * The blueprint's `cn` is `twMerge(clsx(...))`. There is no Tailwind here — the
 * design system is component-scoped CSS over the tokens — so there are no
 * utility collisions to resolve and the `clsx` half is the whole job. Keep the
 * call shape `cn(defaults, props.class)` regardless: it is what lets every part
 * accept a `class` prop without each one hand-rolling a template expression.
 */
export function cn(...values: TypeClassValue[]): string {
  const out: string[] = []

  for (const value of values) {
    if (!value) continue

    if (typeof value === 'string' || typeof value === 'number') {
      out.push(String(value))
      continue
    }

    if (Array.isArray(value)) {
      const nested = cn(...value)
      if (nested) out.push(nested)
      continue
    }

    for (const [key, enabled] of Object.entries(value)) {
      if (enabled) out.push(key)
    }
  }

  return out.join(' ')
}
