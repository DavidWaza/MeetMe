/**
 * Deterministic portrait art, as an inline SVG data URI.
 *
 * There is no backend and no CDN in this build, so photos are generated rather
 * than fetched: the same seed always produces the same image, it works offline
 * and in a screenshot test, and nothing in the deck waits on a network round
 * trip. Swapping in real `photoUrl` strings later is a change to the profile
 * transformer, not to any component.
 */

function hash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** A cheap deterministic PRNG, so one seed drives a whole composition. */
function sequence(seed: string): () => number {
  let state = hash(seed) || 1
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

export function portraitFor(seed: string, index = 0): string {
  const next = sequence(`${seed}#${index}`)
  const hue = Math.round(next() * 360)
  const hueShift = 28 + Math.round(next() * 70)
  const skin = 18 + Math.round(next() * 22)
  const headX = 100 + Math.round((next() - 0.5) * 22)
  const headR = 40 + Math.round(next() * 8)
  const blobs = Array.from({ length: 3 }, () => ({
    cx: Math.round(next() * 200),
    cy: Math.round(next() * 260),
    r: 30 + Math.round(next() * 70),
    o: 0.08 + next() * 0.14,
  }))

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hue} 72% 62%)"/>
<stop offset="1" stop-color="hsl(${(hue + hueShift) % 360} 76% 44%)"/>
</linearGradient>
<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
<stop offset="0.45" stop-color="hsl(${hue} 40% 8%)" stop-opacity="0"/>
<stop offset="1" stop-color="hsl(${hue} 40% 8%)" stop-opacity="0.5"/>
</linearGradient>
</defs>
<rect width="200" height="280" fill="url(#bg)"/>
${blobs
  .map(
    (b) => `<circle cx="${b.cx}" cy="${b.cy}" r="${b.r}" fill="#fff" opacity="${b.o.toFixed(2)}"/>`,
  )
  .join('')}
<g fill="hsl(${hue + 12} 45% ${skin}%)" opacity="0.92">
<circle cx="${headX}" cy="118" r="${headR}"/>
<path d="M${headX - headR - 26} 280 C ${headX - headR - 20} ${208 - headR / 2}, ${headX - 26} 172, ${headX} 172 C ${headX + 26} 172, ${headX + headR + 20} ${208 - headR / 2}, ${headX + headR + 26} 280 Z"/>
</g>
<rect width="200" height="280" fill="url(#fade)"/>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\n/g, ''))}`
}

/** A flat tile for small avatars — cheaper than the full portrait at 40px. */
export function avatarFor(seed: string): string {
  const hue = hash(seed) % 360
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 70% 64%)"/><stop offset="1" stop-color="hsl(${(hue + 46) % 360} 72% 46%)"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><circle cx="32" cy="26" r="12" fill="#fff" opacity="0.82"/><path d="M8 64 C 12 44, 22 38, 32 38 C 42 38, 52 44, 56 64 Z" fill="#fff" opacity="0.82"/></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
