import useDeck, { type TypeUseDeckOptions } from '../application/use-deck'
import useDcDeckDeps from './use-dc-deck-deps'

/** The root the UI mounts. */
export default function useDcDeck(options: Omit<TypeUseDeckOptions, 'deps'> = {}) {
  return useDeck({ deps: useDcDeckDeps(), ...options })
}
