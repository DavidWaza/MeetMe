import { describe, expect, it } from 'vitest'
import {
  emptySignUpDraft,
  hasErrors,
  latestAllowedBirthDate,
  validateLogIn,
  validateSignUp,
  type TypeSignUpDraft,
} from '../auth-entities'

const NOW = new Date('2026-09-21T12:00:00Z')

function valid(overrides: Partial<TypeSignUpDraft> = {}): TypeSignUpDraft {
  return {
    firstName: 'Tobi',
    email: 'tobi@example.com',
    password: 'longenough',
    gender: 'man',
    birthDate: '1998-01-01',
    city: 'Lagos',
    ...overrides,
  }
}

describe('validateSignUp', () => {
  it('accepts a complete draft', () => {
    expect(hasErrors(validateSignUp(valid(), NOW))).toBe(false)
  })

  it('flags every missing field on an empty draft, including gender', () => {
    const errors = validateSignUp(emptySignUpDraft(), NOW)
    expect(Object.keys(errors).sort()).toEqual(
      ['birthDate', 'city', 'email', 'firstName', 'gender', 'password'].sort(),
    )
  })

  it('requires a gender, because it decides who you are shown', () => {
    expect(validateSignUp(valid({ gender: null }), NOW).gender).toMatch(/who you are shown/)
  })

  it('draws the 18+ line at exactly eighteen years', () => {
    expect(latestAllowedBirthDate(NOW)).toBe('2008-09-21')
    expect(validateSignUp(valid({ birthDate: '2008-09-21' }), NOW).birthDate).toBeUndefined()
    expect(validateSignUp(valid({ birthDate: '2008-09-22' }), NOW).birthDate).toMatch(/18/)
  })

  it('needs an 8+ character password and a real-looking email', () => {
    expect(validateSignUp(valid({ password: 'short' }), NOW).password).toBeDefined()
    expect(validateSignUp(valid({ email: 'not-an-email' }), NOW).email).toBeDefined()
  })
})

describe('validateLogIn', () => {
  it('needs an email and a password', () => {
    expect(Object.keys(validateLogIn({ email: '', password: '' })).sort()).toEqual([
      'email',
      'password',
    ])
    expect(hasErrors(validateLogIn({ email: 'a@b.co', password: 'x' }))).toBe(false)
  })
})
