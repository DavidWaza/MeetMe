import type {
  ApiLogInInput,
  ApiResponse,
  ApiSession,
  ApiSignUpInput,
  ApiUserGender,
} from './envelope'
import { apiFail, apiOk, fromWire } from './envelope'
import { createId } from '@/lib/id'
import { MOCK_MUTATION_LATENCY_MS, MOCK_LIST_LATENCY_MS, mockLatency } from '@/lib/latency'
import { commit, freshUserState, root, type TypeDbAccount } from '../db'
import { DEFAULT_PREFERENCES, DEMO_ACCOUNTS } from '../seed'
import { ageFrom } from './profiles'
import { cancelTimers } from './timers'

/**
 * Sign-up, log-in, log-out and session restore.
 *
 * This is a mock: passwords are salted and hashed so they never sit in
 * localStorage as plain text, but anything running in the browser can read and
 * rewrite this "database". Real authentication belongs on a real server.
 */

const MIN_AGE = 18
const PASSWORD_MIN = 8
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const GENDERS: ApiUserGender[] = ['man', 'woman']

async function hashPassword(password: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

function findAccount(email: string): TypeDbAccount | undefined {
  const wanted = normaliseEmail(email)
  return Object.values(root().accounts).find((account) => account.email === wanted)
}

function toSession(account: TypeDbAccount): ApiSession {
  const user = root().users[account.id]
  return {
    user_id: account.id,
    email: account.email,
    first_name: user?.me.first_name ?? '',
    gender: account.gender,
  }
}

function startSession(account: TypeDbAccount): ApiSession {
  // A different person is now using the app: nothing simulated for the last
  // one may land in this one's conversations.
  cancelTimers()
  root().session = { user_id: account.id, token: createId('session') }
  commit()
  return toSession(account)
}

async function createAccount(input: ApiSignUpInput): Promise<TypeDbAccount> {
  const salt = createId('salt')
  const id = createId('user')
  const account: TypeDbAccount = {
    id,
    email: normaliseEmail(input.email),
    password_hash: await hashPassword(input.password, salt),
    salt,
    gender: input.gender,
    created_at: new Date().toISOString(),
  }
  root().accounts[id] = account
  root().users[id] = freshUserState({
    id,
    first_name: input.first_name.trim(),
    birth_date: input.birth_date,
    gender: input.gender,
    bio: '',
    job_title: null,
    city: input.city.trim(),
    interests: [],
    preferences: { ...DEFAULT_PREFERENCES },
  })
  return account
}

/** The demo accounts exist from the first auth call onwards. */
async function ensureDemoAccounts(): Promise<void> {
  let created = false
  for (const demo of DEMO_ACCOUNTS) {
    if (findAccount(demo.email)) continue
    const account = await createAccount({
      first_name: demo.me.first_name,
      email: demo.email,
      password: demo.password,
      gender: demo.me.gender,
      birth_date: demo.me.birth_date,
      city: demo.me.city,
    })
    Object.assign(root().users[account.id]!.me, structuredClone(demo.me))
    created = true
  }
  if (created) commit()
}

/** First failing rule, or `null`. The client runs the same checks first. */
function validateSignUp(input: ApiSignUpInput): string | null {
  if (!input.first_name?.trim()) return 'Tell us your first name.'
  if (input.first_name.trim().length > 40) return 'Your first name can be at most 40 characters.'
  if (!EMAIL_PATTERN.test(input.email?.trim() ?? '')) return 'Enter a valid email address.'
  if ((input.password ?? '').length < PASSWORD_MIN) {
    return `Your password needs at least ${PASSWORD_MIN} characters.`
  }
  if (!GENDERS.includes(input.gender)) return 'Choose whether you are a man or a woman.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birth_date ?? '')) return 'Enter your date of birth.'
  const age = ageFrom(input.birth_date)
  if (age < MIN_AGE) return `You need to be at least ${MIN_AGE} to join.`
  if (age > 100) return 'Check your date of birth.'
  if (!input.city?.trim()) return 'Tell us which city you live in.'
  return null
}

export async function signUp(payload: ApiSignUpInput): Promise<ApiResponse<ApiSession | null>> {
  await mockLatency(MOCK_MUTATION_LATENCY_MS)
  const input = fromWire(payload)
  await ensureDemoAccounts()

  const problem = validateSignUp(input)
  if (problem) return apiFail(problem, null)
  if (findAccount(input.email)) {
    return apiFail('An account with that email already exists. Log in instead.', null)
  }

  const account = await createAccount(input)
  return apiOk(startSession(account))
}

export async function logIn(payload: ApiLogInInput): Promise<ApiResponse<ApiSession | null>> {
  await mockLatency(MOCK_MUTATION_LATENCY_MS)
  const input = fromWire(payload)
  await ensureDemoAccounts()

  const account = findAccount(input.email ?? '')
  // One message for both cases, so the form doesn't reveal which emails exist.
  const invalid = 'That email and password do not match.'
  if (!account) return apiFail(invalid, null)
  if ((await hashPassword(input.password ?? '', account.salt)) !== account.password_hash) {
    return apiFail(invalid, null)
  }
  return apiOk(startSession(account))
}

export async function logOut(): Promise<ApiResponse<null>> {
  await mockLatency(MOCK_LIST_LATENCY_MS / 2)
  cancelTimers()
  root().session = null
  commit()
  return apiOk(null)
}

/** Who is signed in, if anyone. `data: null` is a normal answer, not a refusal. */
export async function getSession(): Promise<ApiResponse<ApiSession | null>> {
  await mockLatency(MOCK_LIST_LATENCY_MS / 4)
  await ensureDemoAccounts()
  const session = root().session
  const account = session && root().accounts[session.user_id]
  return apiOk(account ? toSession(account) : null)
}
