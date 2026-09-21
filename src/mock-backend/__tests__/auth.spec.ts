import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApiSignUpInput } from '@/api/types'

/**
 * The backend's auth and the matching rule, end to end through the real
 * endpoints. Latency is skipped; everything else is exactly what the app calls.
 */
vi.mock('@/lib/latency', async (original) => ({
  ...(await original<typeof import('@/lib/latency')>()),
  mockLatency: () => Promise.resolve(),
}))

async function freshBackend() {
  localStorage.clear()
  vi.resetModules()
  const backend = await import('..')
  const { SEED_PROFILES } = await import('../seed')
  return { ...backend, SEED_PROFILES }
}

function signUpInput(overrides: Partial<ApiSignUpInput> = {}): ApiSignUpInput {
  return {
    first_name: 'Kemi',
    email: 'kemi@example.com',
    password: 'correct horse',
    gender: 'woman',
    birth_date: '1996-02-02',
    city: 'Lagos',
    ...overrides,
  }
}

describe('auth', () => {
  beforeEach(() => localStorage.clear())

  it('signs up, starts a session, and never stores the plain password', async () => {
    const { authApi } = await freshBackend()
    const response = await authApi.signUp(signUpInput())
    expect(response.status).toBe(true)
    expect(response.data).toMatchObject({ first_name: 'Kemi', gender: 'woman' })

    const session = await authApi.getSession()
    expect(session.data?.email).toBe('kemi@example.com')
    expect(localStorage.getItem('meetme:mock-db')).not.toContain('correct horse')
  })

  it('refuses a duplicate email, case-insensitively', async () => {
    const { authApi } = await freshBackend()
    await authApi.signUp(signUpInput())
    const again = await authApi.signUp(signUpInput({ email: 'KEMI@example.com' }))
    expect(again.status).toBe(false)
    expect(again.message).toMatch(/already exists/)
  })

  it('refuses members under 18', async () => {
    const { authApi } = await freshBackend()
    const thisYear = new Date().getUTCFullYear()
    const response = await authApi.signUp(signUpInput({ birth_date: `${thisYear - 17}-01-01` }))
    expect(response.status).toBe(false)
    expect(response.message).toMatch(/at least 18/)
  })

  it('logs in with the right password only, with one message for any failure', async () => {
    const { authApi } = await freshBackend()
    await authApi.signUp(signUpInput())
    await authApi.logOut()

    const wrong = await authApi.logIn({ email: 'kemi@example.com', password: 'nope nope' })
    const unknown = await authApi.logIn({ email: 'nobody@example.com', password: 'whatever1' })
    expect(wrong.status).toBe(false)
    expect(unknown.message).toBe(wrong.message)

    const right = await authApi.logIn({ email: ' Kemi@Example.com ', password: 'correct horse' })
    expect(right.status).toBe(true)
  })

  it('provides the two demo accounts', async () => {
    const { authApi } = await freshBackend()
    expect(
      (await authApi.logIn({ email: 'femi@meetme.demo', password: 'meetme123' })).data?.gender,
    ).toBe('man')
    expect(
      (await authApi.logIn({ email: 'ada@meetme.demo', password: 'meetme123' })).data?.gender,
    ).toBe('woman')
  })

  it('rejects user endpoints once logged out', async () => {
    const { authApi, meApi } = await freshBackend()
    await authApi.signUp(signUpInput())
    await authApi.logOut()
    await expect(meApi.getMe()).rejects.toThrow(/not signed in/i)
  })
})

describe('the matching rule', () => {
  async function deckGendersFor(gender: 'man' | 'woman') {
    const backend = await freshBackend()
    await backend.authApi.signUp(signUpInput({ gender, email: `${gender}@example.com` }))
    const deck = await backend.deckApi.getDeck(50)
    return {
      shown: new Set(deck.data.profiles.map((profile) => profile.gender)),
      count: deck.data.profiles.length,
      SEED_PROFILES: backend.SEED_PROFILES,
    }
  }

  it('shows a man only women', async () => {
    const { shown, count, SEED_PROFILES } = await deckGendersFor('man')
    expect([...shown]).toEqual(['woman'])
    expect(count).toBe(SEED_PROFILES.filter((seed) => seed.profile.gender === 'woman').length)
  })

  it('shows a woman only men', async () => {
    const { shown, count, SEED_PROFILES } = await deckGendersFor('woman')
    expect([...shown]).toEqual(['man'])
    expect(count).toBe(SEED_PROFILES.filter((seed) => seed.profile.gender === 'man').length)
  })

  it('keeps each account’s activity separate', async () => {
    const { authApi, deckApi } = await freshBackend()
    await authApi.signUp(signUpInput({ gender: 'man', email: 'a@example.com' }))
    const first = (await deckApi.getDeck(50)).data.profiles[0]!
    await deckApi.swipe(first.id, 'pass')
    expect((await deckApi.getDeck(50)).data.profiles.some((p) => p.id === first.id)).toBe(false)

    await authApi.signUp(signUpInput({ gender: 'man', email: 'b@example.com' }))
    expect((await deckApi.getDeck(50)).data.profiles.some((p) => p.id === first.id)).toBe(true)
  })
})
