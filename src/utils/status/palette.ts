import type { TypeStatusTone } from './types'

/** tone -> the three custom properties a chip needs. */
export const STATUS_PALETTE: Record<TypeStatusTone, { fg: string; bg: string; bd: string }> = {
  neutral: { fg: 'var(--base-550)', bg: 'var(--base-50)', bd: 'var(--base-150)' },
  info: { fg: 'var(--blue-fg)', bg: 'var(--blue-50)', bd: 'var(--blue-150)' },
  pending: { fg: 'var(--yellow-fg)', bg: 'var(--yellow-50)', bd: 'var(--yellow-150)' },
  attention: { fg: 'var(--accent-fg)', bg: 'var(--accent-50)', bd: 'var(--accent-150)' },
  success: { fg: 'var(--green-fg)', bg: 'var(--green-50)', bd: 'var(--green-150)' },
  danger: { fg: 'var(--red-fg)', bg: 'var(--red-50)', bd: 'var(--red-150)' },
  live: { fg: 'var(--green-fg)', bg: 'var(--green-50)', bd: 'var(--green-150)' },
}
