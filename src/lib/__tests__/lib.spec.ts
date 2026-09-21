import { describe, expect, it } from 'vitest'
import { unwrapApiResponse } from '../api-envelope'
import { cn } from '../cn'
import { cva } from '../cva'

describe('cva', () => {
  const variants = cva('base', {
    variants: {
      color: { primary: '', neutral: '' },
      variant: { solid: 'is-solid', ghost: 'is-ghost' },
    },
    defaultVariants: { color: 'primary', variant: 'solid' },
    compoundVariants: [{ color: 'primary', variant: 'solid', class: 'primary-solid' }],
  })

  it('applies defaults and compound classes', () => {
    expect(variants()).toBe('base is-solid primary-solid')
  })

  // Regression: a component forwarding an unset prop passes `undefined`
  // explicitly, which must not erase the default.
  it('keeps defaults when a prop is explicitly undefined', () => {
    expect(variants({ color: undefined, variant: undefined })).toBe('base is-solid primary-solid')
  })

  it('only applies a compound when every condition matches', () => {
    expect(variants({ variant: 'ghost' })).toBe('base is-ghost')
  })
})

describe('cn', () => {
  it('joins strings, arrays and truthy object keys in order', () => {
    expect(cn('a', false, ['b', null, ['c']], { d: true, e: false }, undefined)).toBe('a b c d')
  })
})

describe('unwrapApiResponse', () => {
  it('returns a successful envelope', () => {
    const response = { status: true, data: 1 }
    expect(unwrapApiResponse(response, 'fallback')).toBe(response)
  })

  it('throws the backend message for a refusal on a "200"', () => {
    expect(() =>
      unwrapApiResponse({ status: false, data: null, message: 'No.' }, 'fallback'),
    ).toThrow('No.')
  })

  it('throws the fallback when the request never completed', () => {
    expect(() => unwrapApiResponse(undefined, 'Network down')).toThrow('Network down')
  })
})
