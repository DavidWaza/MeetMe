import type { ApiMe, ApiMessage, ApiReplyRule, ApiSwipeAction, ApiUserGender } from '@/api/types'
import { readStored, writeStored } from '@/lib/storage'
import { SEED_PROFILES, type TypeSeedProfile } from './seed'

/**
 * The mock backend's "database": one JSON document in localStorage.
 *
 * Accounts and sessions live at the root; everything a person does (swipes,
 * matches, messages, reply rules) lives in their own `users[id]` record, so
 * two accounts on one browser never see each other's activity.
 *
 * Bump `SCHEMA_VERSION` whenever this shape changes. A stored document from an
 * older version is discarded rather than migrated — it is demo data, and a
 * half-migrated state is harder to debug than a fresh one.
 */
const SCHEMA_VERSION = 4
const STORAGE_NAME = 'mock-db'

export interface TypeDbSwipe {
  id: string
  profile_id: string
  action: ApiSwipeAction
  at: string
  match_id: string | null
}

export interface TypeDbMatch {
  id: string
  profile_id: string
  matched_at: string
  via_super_like: boolean
  interest: number
  auto_reply: boolean
  /** Compliments already paid — the first couple land, the rest are noise. */
  compliments: number
}

export interface TypeDbAccount {
  id: string
  email: string
  /** Salted SHA-256. A mock: it keeps plain passwords out of storage, nothing more. */
  password_hash: string
  salt: string
  gender: ApiUserGender
  created_at: string
}

/** One signed-in person's world. */
export interface TypeUserState {
  me: ApiMe
  swipes: TypeDbSwipe[]
  matches: Record<string, TypeDbMatch>
  messages: Record<string, ApiMessage[]>
  rules: ApiReplyRule[]
  used_responses: Record<string, string[]>
}

interface TypeDbRoot {
  version: number
  accounts: Record<string, TypeDbAccount>
  users: Record<string, TypeUserState>
  session: { user_id: string; token: string } | null
}

function freshRoot(): TypeDbRoot {
  return { version: SCHEMA_VERSION, accounts: {}, users: {}, session: null }
}

export function freshUserState(me: ApiMe): TypeUserState {
  return { me, swipes: [], matches: {}, messages: {}, rules: [], used_responses: {} }
}

let rootState: TypeDbRoot | undefined

/** The whole document. Only the auth endpoints need this. */
export function root(): TypeDbRoot {
  if (!rootState) {
    const stored = readStored<TypeDbRoot | null>(STORAGE_NAME, null)
    rootState = stored && stored.version === SCHEMA_VERSION ? stored : freshRoot()
  }
  return rootState
}

export class NotSignedInError extends Error {
  constructor() {
    super('You are not signed in.')
    this.name = 'NotSignedInError'
  }
}

/**
 * The signed-in user's state. Every non-auth endpoint reads through this, so
 * an endpoint cannot touch another account's data by construction. The app's
 * route guard keeps signed-out screens from calling these at all.
 */
export function db(): TypeUserState {
  const state = root()
  const user = state.session && state.users[state.session.user_id]
  if (!user) throw new NotSignedInError()
  return user
}

export function commit(): void {
  if (rootState) writeStored(STORAGE_NAME, rootState)
}

/** Clears the signed-in user's activity; keeps their account and profile. */
export function resetUserActivity(): void {
  const user = db()
  Object.assign(user, freshUserState(user.me))
  commit()
}

const PROFILE_INDEX = new Map(SEED_PROFILES.map((seed) => [seed.profile.id, seed]))

export function seedProfile(profileId: string): TypeSeedProfile | undefined {
  return PROFILE_INDEX.get(profileId)
}

export function allSeedProfiles(): TypeSeedProfile[] {
  return SEED_PROFILES
}
