/**
 * Barrel: domain, query keys and port *types* only. Never adapters,
 * application, composition or mocks — so deleting a mock stays a one-line
 * change. Nothing inside this slice imports this file.
 */
export * from './domain/deck-entities'
export * from './domain/deck-gestures'
export { deckQueryKeys, DECK_QUERY_ROOT } from './infrastructure/deck-query-keys'
export type * from './ports/deck-query.port'
export type * from './ports/deck-service.port'
