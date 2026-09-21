import type { ApiMe, ApiMessage, ApiProfile, ApiReplyFeedback, ApiReplyRule } from '@/api/types'
import type { TypePersonaTone, TypeSeedPersona } from './seed'

/**
 * The conversation simulator.
 *
 * Two pure steps, run by `server/chat.ts`:
 *
 * 1. `scoreMessage` — how did what you just sent land? Returns an interest
 *    delta and the one-line reason the coach shows. This is the "feedback".
 * 2. `composeReply` — what does the other person say back, given their persona,
 *    their current interest and any reply rules the user has taught the system?
 *
 * Priority for a reply: user-taught rules → intent script → fallbacks. Rules
 * the user wrote always fire, even when the persona would otherwise have gone
 * quiet — they are an explicit instruction, not a suggestion.
 */

export const INTEREST_MIN = 0
export const INTEREST_MAX = 100
/** Below this they stop replying ("left on read") until you win them back. */
export const GHOST_THRESHOLD = 15
/** How many exchanged messages before asking for a date or a number is fair game. */
const EARLY_CONVERSATION = 8

export function clampInterest(value: number): number {
  return Math.min(INTEREST_MAX, Math.max(INTEREST_MIN, Math.round(value)))
}

// ————————————————————————————————————————————————————————————— detection

const PATTERNS = {
  rude: /\b(stupid|idiot|ugly|shut up|dumb|loser|boring|fat|trash|hate you)\b/i,
  numberAsk: /\b(number|whatsapp|digits|phone|instagram|insta|\big\b|snap(chat)?|socials?)\b/i,
  dateAsk:
    /\b(drink|drinks|coffee|dinner|lunch|meet( up)?|hang ?out|date|grab|link up|see you|free (this|on|tomorrow))\b/i,
  howAreYou:
    /\b(how are (you|u)|how('?s| is| was) (it going|your (day|week|weekend|morning|evening|night)|life|everything)|wyd|what'?s up|how you dey)\b/i,
  greeting: /^\s*(hi+|hey+|hello+|hiya|yo|sup|good (morning|afternoon|evening)|howdy|heyy+)\b/i,
  compliment:
    /\b(cute|beautiful|gorgeous|handsome|pretty|stunning|lovely|love your (smile|photos?|pics?|style|profile|vibe)|nice (smile|photos?|pics?))\b/i,
  work: /\b(what do (you|u) do|your (job|work)|for (a )?living|where do you work|what'?s your job)\b/i,
  food: /\b(food|eat|eating|restaurant|cook(ing)?|jollof|suya|pizza|rice|dinner|brunch|breakfast|hungry|chef)\b/i,
  music:
    /\b(music|song|songs|playlist|concert|artist|album|afrobeats|burna|wizkid|davido|tems|rema|listen(ing)?)\b/i,
  travel: /\b(travel(l?ing)?|trip|vacation|holiday|country|countries|abroad|flight|visit(ed)?)\b/i,
  weekend: /\b(weekend|free time|hobby|hobbies|for fun|saturday|sunday|day off)\b/i,
  laugh: /(\bha(ha)+\b|\blo+l\b|\blmao\b|\blmfao\b|😂|🤣|😅)/i,
  bye: /\b(bye|goodnight|good night|gn|talk (to you )?later|ttyl|see ya|gotta go|g2g)\b/i,
}

const LOW_EFFORT = /^\s*(k|ok|okay|kk|cool|nice|lol|ya|yeah|yes|no|hm+|mhm|sure|fine)\s*[.!]*\s*$/i

type TypeIntent =
  | 'rude'
  | 'numberAsk'
  | 'dateAsk'
  | 'howAreYou'
  | 'greeting'
  | 'compliment'
  | 'work'
  | 'theirInterest'
  | 'food'
  | 'music'
  | 'travel'
  | 'weekend'
  | 'laugh'
  | 'bye'
  | 'question'
  | 'statement'

function findInterest(text: string, interests: string[]): string | undefined {
  const lower = text.toLowerCase()
  return interests.find((interest) => {
    const needle = interest.toLowerCase()
    // "Stand-up comedy" should match "comedy"; a one-word interest must match whole.
    return needle
      .split(/[\s-]+/)
      .filter((word) => word.length > 3)
      .some((word) => new RegExp(`\\b${escapeRegex(word)}`, 'i').test(lower))
  })
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

interface TypeDetectedIntent {
  intent: TypeIntent
  topic?: string
  /** The message opened with a greeting before saying something real. */
  greeted?: boolean
}

function detectIntent(text: string, profile: ApiProfile): TypeDetectedIntent {
  if (PATTERNS.rude.test(text)) return { intent: 'rude' }

  // "Hey! What do you do on weekends?" deserves an answer, not just "hi" back:
  // strip the greeting and read what follows, if there is enough of it.
  const greeting = PATTERNS.greeting.exec(text)
  if (greeting) {
    const rest = text.slice(greeting[0].length).replace(/^[\s,!.]+/, '')
    if (rest.length < 12) return { intent: 'greeting' }
    return { ...detectIntent(rest, profile), greeted: true }
  }

  const ordered: Exclude<TypeIntent, 'theirInterest' | 'question' | 'statement'>[] = [
    'numberAsk',
    'dateAsk',
    'howAreYou',
    'compliment',
    'work',
  ]

  for (const intent of ordered) {
    if (PATTERNS[intent].test(text)) return { intent }
  }

  const interest = findInterest(text, profile.interests)
  if (interest) return { intent: 'theirInterest', topic: interest }

  for (const intent of ['food', 'music', 'travel', 'weekend', 'laugh', 'bye'] as const) {
    if (PATTERNS[intent].test(text)) return { intent }
  }

  return { intent: text.includes('?') ? 'question' : 'statement' }
}

// ——————————————————————————————————————————————————————————————— scoring

export interface TypeScoreContext {
  text: string
  profile: ApiProfile
  me: ApiMe
  history: ApiMessage[]
  interest: number
  complimentsSoFar: number
}

interface TypeFactor {
  delta: number
  reason: string
}

/** How did it land? Sums every factor; the coach shows the heaviest one. */
export function scoreMessage(ctx: TypeScoreContext): ApiReplyFeedback & { isCompliment: boolean } {
  const factors: TypeFactor[] = []
  const text = ctx.text.trim()
  const exchanged = ctx.history.length
  const lastMine = [...ctx.history].reverse().find((message) => message.sender === 'me')
  const isCompliment = PATTERNS.compliment.test(text)

  if (PATTERNS.rude.test(text)) {
    factors.push({ delta: -25, reason: 'That came across as rude. Interest dropped sharply.' })
  }

  if (LOW_EFFORT.test(text)) {
    factors.push({ delta: -5, reason: 'One-word replies make it hard for them to keep going.' })
  }

  if (lastMine && lastMine.body.trim().toLowerCase() === text.toLowerCase()) {
    factors.push({ delta: -6, reason: 'You sent the same message twice.' })
  }

  if (text.includes('?') && !LOW_EFFORT.test(text)) {
    factors.push({ delta: 6, reason: 'Asking a question shows you are curious about them.' })
  }

  const theirInterest = findInterest(text, ctx.profile.interests)
  if (theirInterest) {
    factors.push({ delta: 8, reason: `You picked up on their interest in ${theirInterest}.` })
    if (ctx.me.interests.some((mine) => mine.toLowerCase() === theirInterest.toLowerCase())) {
      factors.push({ delta: 4, reason: `Shared interest in ${theirInterest}. Common ground!` })
    }
  }

  const promptHit = ctx.profile.prompts.some((prompt) =>
    prompt.answer
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 5)
      .some((word) => text.toLowerCase().includes(word)),
  )
  if (promptHit) {
    factors.push({ delta: 7, reason: 'Referencing their prompt shows you actually read it.' })
  }

  if (isCompliment) {
    factors.push(
      ctx.complimentsSoFar < 2
        ? { delta: 4, reason: 'A genuine compliment lands well.' }
        : { delta: -3, reason: 'Compliments land better in moderation.' },
    )
  }

  if (PATTERNS.numberAsk.test(text)) {
    factors.push(
      exchanged < EARLY_CONVERSATION
        ? { delta: -10, reason: 'Asking for their number this early can feel rushed.' }
        : { delta: 3, reason: 'Good timing to move things off the app.' },
    )
  }

  if (PATTERNS.dateAsk.test(text) && text.includes('?')) {
    factors.push(
      exchanged >= EARLY_CONVERSATION - 2 && ctx.interest >= 55
        ? { delta: 9, reason: 'Great timing: they were hoping you would ask.' }
        : { delta: -4, reason: 'Might be a little early to ask them out.' },
    )
  }

  if (PATTERNS.laugh.test(text)) {
    factors.push({ delta: 2, reason: 'Keeping it light and playful helps.' })
  }

  if (text.length > 280) {
    factors.push({ delta: -2, reason: 'Long messages are harder to reply to. Try shorter bursts.' })
  } else if (text.length >= 25 && factors.every((factor) => factor.delta >= 0)) {
    factors.push({ delta: 2, reason: 'A thoughtful message keeps the momentum going.' })
  }

  if (factors.length === 0) {
    factors.push({ delta: 1, reason: 'Conversation is ticking along.' })
  }

  const delta = factors.reduce((sum, factor) => sum + factor.delta, 0)
  const heaviest = factors.reduce((top, factor) =>
    Math.abs(factor.delta) > Math.abs(top.delta) ? factor : top,
  )

  return {
    delta,
    reason: heaviest.reason,
    interest: clampInterest(ctx.interest + delta),
    isCompliment,
  }
}

// ——————————————————————————————————————————————————————————————— replies

const SCRIPT: Record<Exclude<TypeIntent, 'dateAsk' | 'numberAsk'>, string[]> = {
  rude: ['Wow. Okay.', 'That was not very nice.', 'I do not think this is going to work.'],
  greeting: [
    'Hey {me}! How is your day going?',
    'Hi hi! Glad you said hello.',
    'Hello! I was hoping you would message.',
    'Heyy, good to match with you!',
  ],
  howAreYou: [
    'I am good! Just wrapped up work, finally. You?',
    'Honestly? A bit tired, but this made it better. How about you?',
    'Doing well, thanks for asking! What about your day?',
  ],
  compliment: [
    'Stop it, you are making me blush.',
    'That is sweet of you, thank you!',
    'Thank you! You are not so bad yourself.',
    'Okay, you have good taste. I will give you that.',
  ],
  work: [
    'I am a {job}{atCompany}. Some days I love it, some days I pretend to. What about you?',
    '{job}! It keeps me busy. What do you do?',
    'I work as a {job}. Ask me about it over coffee sometime. What is your thing?',
  ],
  theirInterest: [
    'Wait, you are into {topic} too? Okay, now we have to talk about this.',
    '{topic} is honestly one of my favourite things. How did you get into it?',
    'You read my profile! Yes, {topic} is a big deal for me.',
  ],
  food: [
    'Now you are speaking my language. What is your go-to meal?',
    'I could talk about food all day. Best spot in {city}?',
    'Okay, but have you tried making it at home? Big difference.',
  ],
  music: [
    'Music is non-negotiable for me. What are you listening to right now?',
    'Okay, I need your top three artists. No overthinking.',
    'If you say you do not like Afrobeats we might have a problem.',
  ],
  travel: [
    'I love travelling! Where is the best place you have been?',
    'Yes! Travel is my love language. Where to next?',
    'I have a list of like twenty places. What is top of yours?',
  ],
  weekend: [
    'Weekends are for sleeping in and good food, obviously. Yours?',
    'Honestly it depends on the week. Sometimes out, sometimes a full hermit. You?',
  ],
  laugh: ['Haha okay, you are funny.', 'Lol I was not ready for that.', 'Stop, I am laughing.'],
  bye: ['Talk soon, {me}!', 'Goodnight! This was fun.', 'Okay go, but come back.'],
  question: [
    'Hmm, good question. I would say yes, but ask me again over coffee.',
    'That is a tough one! I will have to think about it. What would you say?',
    'Honestly? It depends. What made you ask?',
  ],
  statement: [
    'Haha I like that.',
    'Okay, tell me more.',
    'Interesting, I did not expect that.',
    'Ha, fair enough.',
    'I feel that.',
  ],
}

const DATE_YES = [
  'I would like that! How is Saturday afternoon?',
  'Yes! Let us do it. You pick the place, I will pick the dessert.',
  'Okay, you have convinced me. This weekend?',
]
const DATE_NOT_YET = [
  'Haha slow down, let us chat a bit more first.',
  'Maybe! Let us get to know each other a little more first.',
  'I like the confidence. Ask me again soon.',
]
const NUMBER_NOT_YET = [
  'Let us keep chatting here a bit first.',
  'Haha maybe later, I like it here for now.',
]
const NUMBER_OK = [
  'Sure, but let us set a date first, then I will share it.',
  'Okay, fair. Let us plan something and swap numbers then.',
]

const EMOJI: Record<TypePersonaTone, string[]> = {
  playful: ['😂', '😏', '✨', '👀', '🙈', '😌'],
  warm: ['😊', '🙂', '💛', '🤗'],
  dry: [],
  curious: ['🤔', '👀', '✨'],
}

export interface TypeReplyContext {
  /** Every unanswered message you sent, joined — they reply to the burst, not each line. */
  text: string
  profile: ApiProfile
  persona: TypeSeedPersona
  me: ApiMe
  history: ApiMessage[]
  interest: number
  rules: ApiReplyRule[]
  used: string[]
}

export interface TypeReplyPlan {
  body: string | null
  typingMs: number
  fromRule: boolean
}

function pick<T>(options: T[], avoid: string[] = []): T | undefined {
  const fresh = options.filter((option) => !avoid.includes(String(option)))
  const pool = fresh.length ? fresh : options
  return pool[Math.floor(Math.random() * pool.length)]
}

function ruleMatches(rule: ApiReplyRule, text: string): boolean {
  return rule.triggers.some((trigger) => {
    const trimmed = trigger.trim()
    if (!trimmed) return false
    const regex = /^\/(.+)\/([a-z]*)$/i.exec(trimmed)
    if (regex) {
      try {
        return new RegExp(
          regex[1] ?? '',
          regex[2]?.includes('i') ? regex[2] : `${regex[2] ?? ''}i`,
        ).test(text)
      } catch {
        return false
      }
    }
    return text.toLowerCase().includes(trimmed.toLowerCase())
  })
}

function fillTemplate(template: string, ctx: TypeReplyContext, topic?: string): string {
  const shared = ctx.profile.interests.find((interest) =>
    ctx.me.interests.some((mine) => mine.toLowerCase() === interest.toLowerCase()),
  )
  const values: Record<string, string> = {
    me: ctx.me.first_name,
    them: ctx.profile.first_name,
    name: ctx.profile.first_name,
    job: ctx.profile.job_title ?? 'bit of everything',
    atCompany: ctx.profile.company ? ` at ${ctx.profile.company}` : '',
    company: ctx.profile.company ?? 'a small team',
    city: ctx.profile.city,
    topic: topic ?? pick(ctx.profile.interests) ?? 'that',
    interest: pick(ctx.profile.interests) ?? 'life',
    shared: shared ?? pick(ctx.profile.interests) ?? 'life',
    message: ctx.text.trim(),
  }
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => values[key] ?? whole)
}

function applyTone(body: string, tone: TypePersonaTone, interest: number): string {
  let out = body

  if (tone === 'dry') {
    out = out.replace(/!/g, '.').replace(/\.{2,}/g, '.')
    out = out.charAt(0).toLowerCase() + out.slice(1)
  }

  if (tone === 'playful' && Math.random() < 0.3 && !/^(haha|lol)/i.test(out)) {
    out = `Haha ${out.charAt(0).toLowerCase()}${out.slice(1)}`
  }

  // Emoji frequency tracks how into it they are.
  const emoji = EMOJI[tone]
  if (emoji.length && Math.random() < 0.15 + interest / 200) {
    out = `${out} ${pick(emoji)}`
  }

  return out
}

function typingDuration(body: string, persona: TypeSeedPersona): number {
  const raw = (650 + body.length * 36) * persona.pace
  return Math.min(6500, Math.max(900, Math.round(raw)))
}

export function composeReply(ctx: TypeReplyContext): TypeReplyPlan {
  const rule = ctx.rules.find((candidate) => ruleMatches(candidate, ctx.text))
  if (rule) {
    const template = pick(rule.responses, ctx.used) ?? rule.responses[0] ?? ''
    const body = fillTemplate(template, ctx)
    return { body, typingMs: typingDuration(body, ctx.persona), fromRule: true }
  }

  if (ctx.interest < GHOST_THRESHOLD) {
    return { body: null, typingMs: 0, fromRule: false }
  }

  const { intent, topic, greeted } = detectIntent(ctx.text, ctx.profile)
  const exchanged = ctx.history.length
  let options: string[]

  if (intent === 'dateAsk') {
    options = exchanged >= EARLY_CONVERSATION - 2 && ctx.interest >= 55 ? DATE_YES : DATE_NOT_YET
  } else if (intent === 'numberAsk') {
    options = exchanged < EARLY_CONVERSATION ? NUMBER_NOT_YET : NUMBER_OK
  } else {
    options = SCRIPT[intent]
  }

  const template = pick(options, ctx.used) ?? 'Haha, okay.'
  const filled = fillTemplate(template, ctx, topic)
  let body = applyTone(
    greeted ? `Hey ${ctx.me.first_name}! ${filled}` : filled,
    ctx.persona.tone,
    ctx.interest,
  )

  // Low interest reads as short, flat replies: first sentence only.
  if (ctx.interest < 35) {
    body = (body.split(/(?<=[.!?])\s/)[0] ?? body).replace(/\s*\p{Extended_Pictographic}/gu, '')
  }

  // Keep it going: interested people ask things back. Curious personas always do.
  // A trailing emoji ("…your day? 😊") still counts as ending on a question.
  const endsWithQuestion = /\?\s*(\p{Extended_Pictographic}\s*)*$/u.test(body)
  const wantsFollowUp =
    intent !== 'rude' &&
    intent !== 'bye' &&
    !endsWithQuestion &&
    (ctx.persona.tone === 'curious'
      ? ctx.interest >= 40
      : ctx.interest >= 60 && Math.random() < 0.55)

  if (wantsFollowUp) {
    const followUp = pick(ctx.persona.followUps, ctx.used)
    if (followUp) body = `${body} ${followUp}`
  }

  return { body, typingMs: typingDuration(body, ctx.persona), fromRule: false }
}

/**
 * Tappable prompts above the composer. Openers before anyone has spoken;
 * afterwards, nudges that keep the conversation moving and that score well.
 */
export function suggestPrompts(profile: ApiProfile, me: ApiMe, history: ApiMessage[]): string[] {
  const shared = profile.interests.find((interest) =>
    me.interests.some((mine) => mine.toLowerCase() === interest.toLowerCase()),
  )
  const prompt = profile.prompts[0]
  const interest = profile.interests[1] ?? profile.interests[0]
  const compact = (values: (string | null)[]) =>
    values.filter((value): value is string => Boolean(value))

  if (!history.some((message) => message.sender === 'me')) {
    return compact([
      shared ? `No way, you like ${shared} too? What got you into it?` : null,
      prompt ? `Okay, "${prompt.answer}" — I need the story behind that.` : null,
      `Hey ${profile.first_name}! How is your week going?`,
      'Two truths and a lie. You go first.',
    ])
  }

  const lastTheirs = [...history].reverse().find((message) => message.sender === 'them')
  const late = history.length >= EARLY_CONVERSATION

  return compact([
    lastTheirs?.body.trim().endsWith('?') ? 'Ha, good question. Honestly? ' : null,
    interest ? `What do you love most about ${interest.toLowerCase()}?` : null,
    'Haha okay, tell me more about that',
    late ? 'Want to grab a coffee this weekend?' : 'What does a perfect weekend look like for you?',
    late ? 'What is your number? Easier to plan there' : null,
  ])
}
