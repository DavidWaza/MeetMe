import { portraitFor } from '@/lib/portrait'

interface TypePhotoSource {
  id: string
  photo_count: number
  photo_urls?: string[]
}

/** Card size: portrait crop centred on faces, sized for a 2x phone screen. */
const CARD_PARAMS = 'w=720&h=960&fit=crop&crop=faces&q=75&auto=format'

/**
 * A profile's photos: real URLs when it has them, generated art otherwise.
 * Unsplash URLs get a face-centred portrait crop from their CDN.
 */
export function photosFor(profile: TypePhotoSource): string[] {
  if (profile.photo_urls?.length) {
    return profile.photo_urls.map((url) =>
      url.startsWith('https://images.unsplash.com/') && !url.includes('?')
        ? `${url}?${CARD_PARAMS}`
        : url,
    )
  }
  return Array.from({ length: Math.max(1, profile.photo_count) }, (_, index) =>
    portraitFor(profile.id, index),
  )
}

/**
 * `@error` handler for a remote photo: swap in the generated portrait, so an
 * offline device or a removed image shows art instead of a broken icon.
 * Generated portraits are data URIs, which also stops a fallback looping.
 */
export function fallbackToPortrait(event: Event, seed: string, index = 0): void {
  const img = event.target as HTMLImageElement
  if (img.src.startsWith('data:')) return
  img.src = portraitFor(seed, index)
}
