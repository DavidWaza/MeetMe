import { describe, expect, it } from 'vitest'
import type { ApiMe, ApiMessage, ApiReplyRule } from '@/api/types'
import { composeReply, GHOST_THRESHOLD, scoreMessage, suggestPrompts } from '../reply-engine'
import { SEED_PROFILES } from '../seed'

/** The member doing the chatting. Shares "Afrobeats" with Amara on purpose. */
const SEED_ME: ApiMe = {
  id: 'user_test',
  first_name: 'Alex',
  birth_date: '1997-06-14',
  gender: 'man',
  bio: '',
  job_title: 'Product Designer',
  city: 'Lagos',
  interests: ['Baking', 'Afrobeats', 'Photography', 'Hiking', 'Board games'],
  preferences: { age_min: 21, age_max: 40, max_distance_km: 50 },
}

const amara = SEED_PROFILES.find((seed) => seed.profile.id === 'p_amara')!

function history(count: number): ApiMessage[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `m${index}`,
    match_id: 'x',
    sender: index % 2 ? 'them' : 'me',
    body: 'hello there',
    sent_at: '2026-01-01T00:00:00Z',
    delivery: 'read',
  }))
}

function score(text: string, overrides: Partial<Parameters<typeof scoreMessage>[0]> = {}) {
  return scoreMessage({
    text,
    profile: amara.profile,
    me: SEED_ME,
    history: [],
    interest: 50,
    complimentsSoFar: 0,
    ...overrides,
  })
}

function reply(text: string, overrides: Partial<Parameters<typeof composeReply>[0]> = {}) {
  return composeReply({
    text,
    profile: amara.profile,
    persona: { ...amara.persona, followUps: [] },
    me: SEED_ME,
    history: [],
    interest: 50,
    rules: [],
    used: [],
    ...overrides,
  })
}

describe('scoreMessage — the coach', () => {
  it('rewards a question', () => {
    const result = score('What got you into architecture?')
    expect(result.delta).toBeGreaterThan(0)
  })

  it('rewards picking up on their interests, more so when shared', () => {
    // "Afrobeats" is on both Amara's and Alex's profile.
    const shared = score('I have had Afrobeats on repeat all week')
    const theirsOnly = score('I have been sketching all week')
    expect(shared.delta).toBeGreaterThan(theirsOnly.delta)
    expect(theirsOnly.delta).toBeGreaterThan(0)
  })

  it('penalises one-word replies', () => {
    const result = score('ok')
    expect(result.delta).toBeLessThan(0)
    expect(result.reason).toMatch(/one-word/i)
  })

  it('penalises rudeness heavily', () => {
    expect(score('you are boring').delta).toBeLessThanOrEqual(-20)
  })

  it('treats asking for a number early as rushed, and later as fine', () => {
    expect(score('whats your number').delta).toBeLessThan(0)
    expect(score('whats your number', { history: history(10) }).delta).toBeGreaterThan(0)
  })

  it('lands the first compliments but not endless ones', () => {
    expect(score('you have a lovely smile').delta).toBeGreaterThan(0)
    expect(score('you have a lovely smile', { complimentsSoFar: 3 }).delta).toBeLessThan(0)
  })

  it('clamps interest to 0–100', () => {
    expect(score('you are stupid and boring', { interest: 5 }).interest).toBe(0)
  })
})

describe('composeReply — the simulated partner', () => {
  it('answers the substance when a message opens with a greeting', () => {
    const plan = reply('Hey! What do you do for work?')
    // Playful personas sometimes lead with "Haha", so don't anchor to the start.
    expect(plan.body).toMatch(/hey alex!/i)
    expect(plan.body).toMatch(/Architect/)
  })

  it('goes quiet below the ghost threshold', () => {
    expect(reply('hello?', { interest: GHOST_THRESHOLD - 1 }).body).toBeNull()
  })

  it('lets a taught rule win, even when they have gone quiet', () => {
    const rule: ApiReplyRule = {
      id: 'r1',
      triggers: ['pizza'],
      responses: ['Pizza talk with {me} in {city}'],
      match_id: null,
      created_at: '',
    }
    const plan = reply('Do you like PIZZA?', { interest: 0, rules: [rule] })
    expect(plan.fromRule).toBe(true)
    expect(plan.body).toBe('Pizza talk with Alex in Yaba')
  })

  it('supports regex triggers', () => {
    const rule: ApiReplyRule = {
      id: 'r2',
      triggers: ['/\\b(film|movie)s?\\b/'],
      responses: ['Film night!'],
      match_id: null,
      created_at: '',
    }
    expect(reply('seen any good movies?', { rules: [rule] }).body).toBe('Film night!')
    expect(reply('filmmaking is hard', { rules: [rule] }).fromRule).toBe(false)
  })

  it('declines a date early and accepts it later when interest is high', () => {
    const early = reply('want to grab a drink?', { interest: 80 })
    const later = reply('want to grab a drink?', { interest: 80, history: history(10) })
    expect(early.body).not.toMatch(/Saturday|Let us do it|This weekend/)
    expect(later.body).toMatch(/Saturday|Let us do it|This weekend/)
  })

  it('never stacks a follow-up question onto a reply that already asks one', () => {
    // Warm persona, high interest: follow-ups are likely, emoji too.
    const tunde = SEED_PROFILES.find((seed) => seed.profile.id === 'p_tunde')!
    for (let run = 0; run < 40; run++) {
      const plan = composeReply({
        text: 'How is your day going?',
        profile: tunde.profile,
        persona: tunde.persona,
        me: SEED_ME,
        history: [],
        interest: 90,
        rules: [],
        used: [],
      })
      // Every "how are you" reply already ends on a question back.
      const body = plan.body ?? ''
      expect(tunde.persona.followUps.some((followUp) => body.includes(followUp))).toBe(false)
    }
  })

  it('scales typing time with length', () => {
    const plan = reply('hi')
    expect(plan.typingMs).toBeGreaterThanOrEqual(900)
    expect(plan.typingMs).toBeLessThanOrEqual(6500)
  })
})

describe('suggestPrompts', () => {
  it('offers openers built from their profile before anyone has spoken', () => {
    const prompts = suggestPrompts(amara.profile, SEED_ME, [])
    expect(prompts.some((prompt) => prompt.includes('Afrobeats'))).toBe(true)
  })

  it('switches to follow-ups once the conversation has started', () => {
    const prompts = suggestPrompts(amara.profile, SEED_ME, history(2))
    expect(prompts.some((prompt) => /tell me more/i.test(prompt))).toBe(true)
  })
})
