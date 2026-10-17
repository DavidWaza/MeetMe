/**
 * Raw wire types. snake_case, mirroring what the backend sends.
 *
 * Nothing in a component reads these. Each slice's `transformers/` maps them to
 * the camelCase shape it actually wants, and a slice needing a different
 * projection owns its own read model rather than widening a shared one.
 *
 * Status fields are deliberately `string`, not a union: the backend is free to
 * invent spellings, and `utils/status/resolver.ts` is what absorbs them.
 */

export type ApiGender = 'woman' | 'man' | 'nonbinary'
/**
 * A member's gender. Matching is man ↔ woman: each sees only the other, so
 * this also decides whose profiles fill their deck.
 */
export type ApiUserGender = 'man' | 'woman'
export type ApiSwipeAction = 'like' | 'pass' | 'superlike'

export interface ApiPrompt {
  question: string
  answer: string
}

export interface ApiProfile {
  id: string
  first_name: string
  /** A bare calendar date — `parseToDate` anchors it in the display zone. */
  birth_date: string
  gender: ApiGender
  pronouns: string | null
  bio: string
  job_title: string | null
  company: string | null
  school: string | null
  city: string
  distance_km: number
  height_cm: number | null
  interests: string[]
  prompts: ApiPrompt[]
  /** At least one photo. The app has no placeholder art to fall back to. */
  photo_urls: string[]
  presence: string
  verification: string
  /** No offset — UTC with the `Z` dropped, as some backends send it. */
  last_active_at: string
}

export interface ApiDeckPage {
  profiles: ApiProfile[]
  remaining: number
}

export interface ApiSwipeResult {
  swipe_id: string
  matched: boolean
  match_id: string | null
}

export interface ApiMessage {
  id: string
  match_id: string
  sender: 'me' | 'them'
  body: string
  sent_at: string
  delivery: string
  /** Set when the other party was voiced by the user, not the simulator. */
  authored_manually?: boolean
}

export interface ApiMatch {
  id: string
  profile: ApiProfile
  matched_at: string
  via_super_like: boolean
  connection_state: string
  unread_count: number
  last_message: ApiMessage | null
  interest: number
}

export interface ApiInboxSummary {
  unread_total: number
  new_matches: number
}

export interface ApiPreferences {
  age_min: number
  age_max: number
  max_distance_km: number
}

export interface ApiMe {
  id: string
  first_name: string
  birth_date: string
  gender: ApiUserGender
  bio: string
  job_title: string | null
  city: string
  interests: string[]
  preferences: ApiPreferences
}

export interface ApiMePatch {
  first_name?: string
  bio?: string
  job_title?: string | null
  city?: string
  interests?: string[]
  preferences?: Partial<ApiPreferences>
}

export interface ApiReplyRule {
  id: string
  /** Case-insensitive substrings; a value wrapped in slashes is a regex. */
  triggers: string[]
  responses: string[]
  /** `null` means every conversation. */
  match_id: string | null
  created_at: string
}

export interface ApiConversation {
  match: ApiMatch
  messages: ApiMessage[]
  auto_reply: boolean
}

export interface ApiReplyFeedback {
  delta: number
  reason: string
  interest: number
}

export interface ApiSendResult {
  message: ApiMessage
  /** Coaching on how the message landed. `null` when voicing the other party. */
  feedback: ApiReplyFeedback | null
}

export interface ApiSession {
  user_id: string
  email: string
  first_name: string
  gender: ApiUserGender
}

export interface ApiSignUpInput {
  first_name: string
  email: string
  password: string
  gender: ApiUserGender
  /** `YYYY-MM-DD`. Members must be 18 or older. */
  birth_date: string
  city: string
}

export interface ApiLogInInput {
  email: string
  password: string
}
