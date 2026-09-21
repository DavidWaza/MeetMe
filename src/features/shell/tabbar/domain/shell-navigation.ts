import { ROUTE_NAMES, type TypeRouteName } from '@/router/route-names'
import type { TypeIconName } from '@/utils/icons'

/**
 * The navigation registry. Adding a tab is a data change here, not a template
 * change in the tab bar.
 */
export type TypeNavBadge = 'inbox' | null

export interface TypeNavItem {
  name: TypeRouteName
  label: string
  icon: TypeIconName
  badge: TypeNavBadge
  /** Other routes that should light this tab up (a chat lives under Matches). */
  alsoActiveOn: TypeRouteName[]
}

export const SHELL_NAVIGATION: TypeNavItem[] = [
  {
    name: ROUTE_NAMES.discover,
    label: 'Discover',
    icon: 'discover',
    badge: null,
    alsoActiveOn: [],
  },
  {
    name: ROUTE_NAMES.matches,
    label: 'Matches',
    icon: 'messages',
    badge: 'inbox',
    alsoActiveOn: [ROUTE_NAMES.chat],
  },
  { name: ROUTE_NAMES.profile, label: 'Profile', icon: 'profile', badge: null, alsoActiveOn: [] },
]

export interface TypeInboxSummary {
  unreadTotal: number
  newMatches: number
}

export interface TypeIncomingMessage {
  matchId: string
  senderName: string
  preview: string
}
