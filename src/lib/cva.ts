import { cn } from './cn'

type TypeVariantShape = Record<string, Record<string, string>>

type TypeVariantProps<V extends TypeVariantShape> = {
  [K in keyof V]?: keyof V[K]
}

interface TypeConfig<V extends TypeVariantShape> {
  variants: V
  defaultVariants?: TypeVariantProps<V>
  compoundVariants?: (TypeVariantProps<V> & { class: string })[]
}

/**
 * A ~30-line `cva`.
 *
 * The shape matters more than the implementation: axes declared with empty
 * strings and the real classes living in `compoundVariants` is what keeps
 * `color` and `variant` genuinely orthogonal, instead of naming every one of
 * their products.
 *
 * Variants live in a sibling `*-variants.ts`, never inline in a template, so a
 * plain `.ts` file can import them too.
 */
export function cva<V extends TypeVariantShape>(base: string, config: TypeConfig<V>) {
  return (props: TypeVariantProps<V> = {}): string => {
    // An explicit `undefined` (a component forwarding an unset prop) must not
    // erase the default, which a plain object spread would do.
    const resolved = { ...config.defaultVariants } as TypeVariantProps<V>
    for (const [axis, value] of Object.entries(props)) {
      if (value !== undefined) resolved[axis as keyof V] = value as TypeVariantProps<V>[keyof V]
    }
    const classes: string[] = [base]

    for (const axis of Object.keys(config.variants) as (keyof V)[]) {
      const value = resolved[axis]
      if (value === undefined) continue
      const found = config.variants[axis]?.[value as string]
      if (found) classes.push(found)
    }

    for (const compound of config.compoundVariants ?? []) {
      const { class: compoundClass, ...conditions } = compound
      const matches = Object.entries(conditions).every(
        ([axis, value]) => resolved[axis as keyof V] === value,
      )
      if (matches) classes.push(compoundClass)
    }

    return cn(...classes)
  }
}
