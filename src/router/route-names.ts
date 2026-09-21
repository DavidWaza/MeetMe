/**
 * Route names, app-level.
 *
 * The blueprint keeps paths in each slice's `domain/*-routes.ts`. That works
 * when links stay inside a slice; here the deck's match screen links into chat
 * and the inbox links into chat, and features may not import each other. So
 * the names live here, beside the router that owns them, and every slice links
 * by name.
 */
export const ROUTE_NAMES = {
  discover: 'discover',
  matches: 'matches',
  chat: 'chat',
  profile: 'profile',
  login: 'login',
  signup: 'signup',
} as const

export type TypeRouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES]
