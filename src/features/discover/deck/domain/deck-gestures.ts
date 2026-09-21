import type { TypeSwipeAction } from './deck-entities'

/**
 * Gesture physics, as pure functions over a drag delta. Kept out of the card
 * component so the thresholds are testable and tunable in one place.
 */

/** Horizontal travel, as a fraction of card width, that commits a like/pass. */
export const SWIPE_COMMIT_RATIO = 0.3
/** Vertical travel (upwards) in px that commits a super like. */
export const SUPERLIKE_COMMIT_PX = 120
/** A flick commits early if it's fast enough, however short. px/ms. */
export const FLICK_VELOCITY = 0.55
/** Below this much movement a pointer-up is a tap, not a drag. */
export const TAP_SLOP_PX = 6
/** Degrees of rotation at full commit distance. */
export const MAX_ROTATION_DEG = 14

export interface TypeDragState {
  dx: number
  dy: number
  width: number
  velocityX: number
  velocityY: number
}

/** Which action the drag is leaning towards, and how strongly (0–1). */
export function dragIntent(drag: TypeDragState): {
  action: TypeSwipeAction | null
  strength: number
} {
  const commitX = drag.width * SWIPE_COMMIT_RATIO
  const up = -drag.dy

  if (up > Math.abs(drag.dx) && up > 20) {
    return { action: 'superlike', strength: Math.min(1, up / SUPERLIKE_COMMIT_PX) }
  }
  if (Math.abs(drag.dx) > 12) {
    return {
      action: drag.dx > 0 ? 'like' : 'pass',
      strength: Math.min(1, Math.abs(drag.dx) / commitX),
    }
  }
  return { action: null, strength: 0 }
}

/** The action a released drag commits to, or `null` to spring back. */
export function releaseAction(drag: TypeDragState): TypeSwipeAction | null {
  const commitX = drag.width * SWIPE_COMMIT_RATIO

  if (-drag.dy > SUPERLIKE_COMMIT_PX && -drag.dy > Math.abs(drag.dx)) return 'superlike'
  if (drag.velocityY < -FLICK_VELOCITY && Math.abs(drag.velocityY) > Math.abs(drag.velocityX)) {
    return 'superlike'
  }
  if (Math.abs(drag.dx) > commitX) return drag.dx > 0 ? 'like' : 'pass'
  if (Math.abs(drag.velocityX) > FLICK_VELOCITY && Math.abs(drag.dx) > 40) {
    return drag.velocityX > 0 ? 'like' : 'pass'
  }
  return null
}

export function dragRotation(dx: number, width: number): number {
  const ratio = Math.max(-1, Math.min(1, dx / (width * SWIPE_COMMIT_RATIO * 2)))
  return ratio * MAX_ROTATION_DEG
}

/** Where a committed card flies to, well off-screen. */
export function flyOutTarget(
  action: TypeSwipeAction,
  width: number,
  dy = 0,
): { x: number; y: number; rotate: number } {
  if (action === 'superlike') return { x: 0, y: -window.innerHeight * 1.1, rotate: 0 }
  const direction = action === 'like' ? 1 : -1
  return { x: direction * width * 1.6, y: dy + 60, rotate: direction * MAX_ROTATION_DEG * 1.6 }
}
