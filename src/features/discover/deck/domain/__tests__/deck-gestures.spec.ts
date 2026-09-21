import { describe, expect, it } from 'vitest'
import {
  dragIntent,
  releaseAction,
  SUPERLIKE_COMMIT_PX,
  SWIPE_COMMIT_RATIO,
} from '../deck-gestures'

const WIDTH = 360
const commitX = WIDTH * SWIPE_COMMIT_RATIO
const drag = (dx: number, dy = 0, velocityX = 0, velocityY = 0) => ({
  dx,
  dy,
  width: WIDTH,
  velocityX,
  velocityY,
})

describe('releaseAction', () => {
  it('springs back when the drag is short and slow', () => {
    expect(releaseAction(drag(commitX - 10))).toBeNull()
  })

  it('commits like / pass past the threshold', () => {
    expect(releaseAction(drag(commitX + 1))).toBe('like')
    expect(releaseAction(drag(-commitX - 1))).toBe('pass')
  })

  it('commits a short but fast flick', () => {
    expect(releaseAction(drag(60, 0, 1.2))).toBe('like')
    expect(releaseAction(drag(-60, 0, -1.2))).toBe('pass')
  })

  it('commits a super like on a mostly-upward drag', () => {
    expect(releaseAction(drag(10, -SUPERLIKE_COMMIT_PX - 1))).toBe('superlike')
  })

  it('prefers the horizontal reading when the drag is mostly sideways', () => {
    expect(releaseAction(drag(commitX + 40, -SUPERLIKE_COMMIT_PX - 1))).toBe('like')
  })
})

describe('dragIntent', () => {
  it('reports no intent for a tiny wobble', () => {
    expect(dragIntent(drag(5, 3)).action).toBeNull()
  })

  it('reports strength proportional to travel, capped at 1', () => {
    expect(dragIntent(drag(commitX / 2)).strength).toBeCloseTo(0.5)
    expect(dragIntent(drag(commitX * 3)).strength).toBe(1)
  })
})
