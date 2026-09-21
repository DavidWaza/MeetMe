import { describe, expect, it } from 'vitest'
import { resolveStatus, STATUS_REGISTRY } from '..'

describe('resolveStatus', () => {
  it('passes canonical values through', () => {
    expect(resolveStatus('read', 'delivery')).toBe('read')
    expect(resolveStatus('your_turn', 'connection')).toBe('your_turn')
  })

  it('absorbs the backend spellings through the alias table', () => {
    expect(resolveStatus('seen', 'delivery')).toBe('read')
    expect(resolveStatus('active_now', 'presence')).toBe('online')
    expect(resolveStatus('waiting_on_you', 'connection')).toBe('your_turn')
    expect(resolveStatus('photo_verified', 'verification')).toBe('verified')
  })

  it('normalises case, spaces and hyphens', () => {
    expect(resolveStatus('  Active-Now ', 'presence')).toBe('online')
  })

  it('falls back per kind rather than reading "Unknown"', () => {
    expect(resolveStatus('who-knows', 'presence')).toBe('offline')
    expect(resolveStatus(undefined, 'delivery')).toBe('sent')
  })

  it('never resolves an alias into another kind', () => {
    // `seen` is a delivery state; asked for as presence it must not become `read`.
    expect(resolveStatus('seen', 'presence')).toBe('offline')
  })

  it('has a registry entry for every state it can return', () => {
    for (const raw of ['seen', 'idle', 'closed', 'under_review', 'error']) {
      for (const kind of ['connection', 'delivery', 'presence', 'verification'] as const) {
        expect(STATUS_REGISTRY[resolveStatus(raw, kind)]).toBeDefined()
      }
    }
  })
})
