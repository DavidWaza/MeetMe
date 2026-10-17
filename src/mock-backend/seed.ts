import type { ApiMe, ApiProfile } from '@/api/types'
import amaraPhoto from '@/assets/profiles/amara.jpg'
import chineduPhoto from '@/assets/profiles/chinedu.jpg'
import chiomaPhoto from '@/assets/profiles/chioma.jpg'
import davidPhoto from '@/assets/profiles/david.jpg'
import emekaPhoto from '@/assets/profiles/emeka.jpg'
import kofiPhoto from '@/assets/profiles/kofi.jpg'
import lolaPhoto from '@/assets/profiles/lola.jpg'
import ngoziPhoto from '@/assets/profiles/ngozi.jpg'
import tundePhoto from '@/assets/profiles/tunde.jpg'
import zaraPhoto from '@/assets/profiles/zara.jpg'

/**
 * Seed data for the mock backend.
 *
 * `TypeSeedPersona` is server-private: it drives who likes you back and how
 * they talk, and is never sent over the "wire". The profile transformer could
 * not leak it if it tried — it is not on `ApiProfile`.
 */

export type TypePersonaTone = 'playful' | 'warm' | 'dry' | 'curious'

export interface TypeSeedPersona {
  tone: TypePersonaTone
  /** Multiplier on typing delay. <1 is quick, >1 takes their time. */
  pace: number
  /** 0–1. Deterministic per profile, so a rewind and re-like agrees with itself. */
  likeChance: number
  opensFirst: boolean
  baseInterest: number
  openers: string[]
  followUps: string[]
}

export interface TypeSeedProfile {
  profile: ApiProfile
  persona: TypeSeedPersona
}

function minutesAgo(minutes: number): string {
  // Deliberately offset-free: the transformer's `parseToDate` must treat it as UTC.
  return new Date(Date.now() - minutes * 60_000).toISOString().replace('Z', '')
}

/** Starting preferences for every new account. */
export const DEFAULT_PREFERENCES = { age_min: 21, age_max: 40, max_distance_km: 50 }

export interface TypeDemoAccount {
  email: string
  password: string
  me: Omit<ApiMe, 'id'>
}

/**
 * Two ready-made accounts, one per side, so the app can be tried from either
 * without signing up. Created on first use; the login screen lists them.
 */
export const DEMO_ACCOUNTS: TypeDemoAccount[] = [
  {
    email: 'femi@meetme.demo',
    password: 'meetme123',
    me: {
      first_name: 'Femi',
      birth_date: '1995-03-10',
      gender: 'man',
      bio: 'Product designer by day, amateur baker by night. Looking for someone to split dessert with.',
      job_title: 'Product Designer',
      city: 'Lagos',
      interests: ['Afrobeats', 'Photography', 'Travel', 'Board games', 'Cooking'],
      preferences: { ...DEFAULT_PREFERENCES },
    },
  },
  {
    email: 'ada@meetme.demo',
    password: 'meetme123',
    me: {
      first_name: 'Ada',
      birth_date: '1997-06-14',
      gender: 'woman',
      bio: 'Pharmacist with a soft spot for live music and very strong opinions about suya.',
      job_title: 'Pharmacist',
      city: 'Lagos',
      interests: ['Afrobeats', 'Football', 'Coffee', 'Chess', 'Travel'],
      preferences: { ...DEFAULT_PREFERENCES },
    },
  },
]

export const SEED_PROFILES: TypeSeedProfile[] = [
  {
    profile: {
      id: 'p_amara',
      first_name: 'Amara',
      birth_date: '1998-03-22',
      gender: 'woman',
      pronouns: 'she/her',
      bio: 'Architect who sketches strangers on the BRT. Will judge your jollof, lovingly.',
      job_title: 'Architect',
      company: 'Studio Ode',
      school: 'University of Lagos',
      city: 'Yaba',
      distance_km: 4,
      height_cm: 170,
      interests: ['Sketching', 'Jollof', 'Architecture', 'Afrobeats', 'Museums'],
      prompts: [
        { question: 'A perfect Sunday', answer: 'Nike Art Gallery, then suya by the water.' },
        { question: 'I geek out on', answer: 'Brutalist buildings. Yes, really.' },
      ],
      photo_urls: [amaraPhoto],
      presence: 'active_now',
      verification: 'photo_verified',
      last_active_at: minutesAgo(2),
    },
    persona: {
      tone: 'playful',
      pace: 0.8,
      likeChance: 0.9,
      opensFirst: true,
      baseInterest: 62,
      openers: ['Okay, important question first: party jollof or home jollof? 👀'],
      followUps: [
        'What building in Lagos would you save if you could only save one?',
        'Be honest, how good is your jollof?',
        'Do you draw at all, or am I the only one?',
      ],
    },
  },
  {
    profile: {
      id: 'p_tunde',
      first_name: 'Tunde',
      birth_date: '1994-11-02',
      gender: 'man',
      pronouns: 'he/him',
      bio: 'Software engineer. Weekend footballer, weekday coffee snob.',
      job_title: 'Software Engineer',
      company: 'Paystack',
      school: 'Obafemi Awolowo University',
      city: 'Lekki',
      distance_km: 12,
      height_cm: 183,
      interests: ['Football', 'Coffee', 'Sci-fi', 'Cooking', 'Afrobeats'],
      prompts: [
        { question: 'Green flag I look for', answer: 'You text back like a human, not a robot.' },
        { question: 'My most irrational fear', answer: 'Running out of data mid-match.' },
      ],
      photo_urls: [tundePhoto],
      presence: 'recently_online',
      verification: 'id_verified',
      last_active_at: minutesAgo(45),
    },
    persona: {
      tone: 'warm',
      pace: 1.1,
      likeChance: 0.75,
      opensFirst: false,
      baseInterest: 55,
      openers: [],
      followUps: [
        'What does your ideal weekend look like?',
        'Pour-over or espresso? This matters.',
        'Which team do you support, or are you a neutral?',
      ],
    },
  },
  {
    profile: {
      id: 'p_zara',
      first_name: 'Zara',
      birth_date: '2000-07-09',
      gender: 'woman',
      pronouns: 'she/her',
      bio: 'Medical student. Running on caffeine and Burna Boy. Swipe right if you can make me laugh.',
      job_title: 'Medical Student',
      company: null,
      school: 'LASUCOM',
      city: 'Ikeja',
      distance_km: 18,
      height_cm: 165,
      interests: ['Medicine', 'Stand-up comedy', 'Afrobeats', 'Gym', 'Travel'],
      prompts: [
        {
          question: 'Two truths and a lie',
          answer: 'I have been to 9 countries, I hate chocolate, I can do a backflip.',
        },
      ],
      photo_urls: [zaraPhoto],
      presence: 'online',
      verification: 'under_review',
      last_active_at: minutesAgo(1),
    },
    persona: {
      tone: 'playful',
      pace: 0.7,
      likeChance: 0.55,
      opensFirst: false,
      baseInterest: 48,
      openers: [],
      followUps: [
        'Okay guess the lie in my prompt 😏',
        'What is the funniest thing that happened to you this week?',
        'Where is the next place you want to travel?',
      ],
    },
  },
  {
    profile: {
      id: 'p_kofi',
      first_name: 'Kofi',
      birth_date: '1992-01-30',
      gender: 'man',
      pronouns: 'he/him',
      bio: 'Chef. I will feed you, then ask for honest feedback. Brutally honest.',
      job_title: 'Head Chef',
      company: 'Nok by Alara',
      school: null,
      city: 'Victoria Island',
      distance_km: 9,
      height_cm: 178,
      interests: ['Cooking', 'Wine', 'Markets', 'Jazz', 'Travel'],
      prompts: [
        {
          question: 'The way to win me over',
          answer: 'Tell me what you ate for breakfast in detail.',
        },
      ],
      photo_urls: [kofiPhoto],
      presence: 'away',
      verification: 'verified',
      last_active_at: minutesAgo(180),
    },
    persona: {
      tone: 'warm',
      pace: 1.4,
      likeChance: 0.85,
      opensFirst: true,
      baseInterest: 58,
      openers: ['Hello there! My prompt was not a joke. What did you have for breakfast? 🍳'],
      followUps: [
        'What is the one dish you could eat every day?',
        'Do you cook, or are you a professional eater?',
        'Jazz or Afrobeats for a dinner party?',
      ],
    },
  },
  {
    profile: {
      id: 'p_ngozi',
      first_name: 'Ngozi',
      birth_date: '1996-09-15',
      gender: 'woman',
      pronouns: 'she/her',
      bio: 'Lawyer. Reads contracts for work and romance novels for fun. No, I will not review your tenancy agreement.',
      job_title: 'Corporate Lawyer',
      company: 'Aluko & Oyebode',
      school: 'Nigerian Law School',
      city: 'Ikoyi',
      distance_km: 7,
      height_cm: 168,
      interests: ['Reading', 'Pilates', 'Wine', 'Debate', 'Nollywood'],
      prompts: [
        { question: 'Unpopular opinion', answer: 'Brunch is overrated. Breakfast is where it is.' },
      ],
      photo_urls: [ngoziPhoto],
      presence: 'offline',
      verification: 'verified',
      last_active_at: minutesAgo(600),
    },
    persona: {
      tone: 'dry',
      pace: 1.3,
      likeChance: 0.4,
      opensFirst: false,
      baseInterest: 42,
      openers: [],
      followUps: [
        'Defend your favourite book. You have one sentence.',
        'Brunch: overrated or not? Choose carefully.',
        'Best Nollywood film of all time. Go.',
      ],
    },
  },
  {
    profile: {
      id: 'p_david',
      first_name: 'David',
      birth_date: '1995-12-19',
      gender: 'man',
      pronouns: 'he/him',
      bio: 'Musician. Keys, bass, whatever the gig needs. I talk too much about synthesizers.',
      job_title: 'Session Musician',
      company: null,
      school: 'MUSON School of Music',
      city: 'Yaba',
      distance_km: 3,
      height_cm: 180,
      interests: ['Music', 'Synths', 'Live gigs', 'Afrobeats', 'Gaming'],
      prompts: [{ question: 'My simple pleasures', answer: 'A good bassline and cold zobo.' }],
      photo_urls: [davidPhoto],
      presence: 'last_seen_recently',
      verification: 'not_verified',
      last_active_at: minutesAgo(30),
    },
    persona: {
      tone: 'playful',
      pace: 0.8,
      likeChance: 0.7,
      opensFirst: false,
      baseInterest: 57,
      openers: [],
      followUps: [
        'What song have you had on repeat this week?',
        'Do you play anything? Kazoo counts.',
        'Best live show you have ever been to?',
      ],
    },
  },
  {
    profile: {
      id: 'p_emeka',
      first_name: 'Emeka',
      birth_date: '1991-08-27',
      gender: 'man',
      pronouns: 'he/him',
      bio: 'Doctor. Night shifts, early gym, strong opinions about pepper soup.',
      job_title: 'Resident Doctor',
      company: 'LUTH',
      school: 'University of Nigeria',
      city: 'Surulere',
      distance_km: 8,
      height_cm: 186,
      interests: ['Gym', 'Pepper soup', 'Chess', 'Football', 'Travel'],
      prompts: [{ question: 'Change my mind about', answer: 'Chess is a contact sport.' }],
      photo_urls: [emekaPhoto],
      presence: 'idle',
      verification: 'id_verified',
      last_active_at: minutesAgo(90),
    },
    persona: {
      tone: 'dry',
      pace: 1.5,
      likeChance: 0.5,
      opensFirst: false,
      baseInterest: 45,
      openers: [],
      followUps: [
        'Do you play chess? I promise to be merciful.',
        'Pepper soup: goat or catfish?',
        'Morning person or night person?',
      ],
    },
  },
  {
    profile: {
      id: 'p_lola',
      first_name: 'Lola',
      birth_date: '1999-10-05',
      gender: 'woman',
      pronouns: 'she/her',
      bio: 'Fashion designer. I will notice your shoes before your face. Sorry, not sorry.',
      job_title: 'Fashion Designer',
      company: 'Atelier Lola',
      school: null,
      city: 'Victoria Island',
      distance_km: 10,
      height_cm: 172,
      interests: ['Fashion', 'Thrifting', 'Dance', 'Afrobeats', 'Art'],
      prompts: [{ question: 'My love language', answer: 'Matching outfits for no reason.' }],
      photo_urls: [lolaPhoto],
      presence: 'offline',
      verification: 'photo_verified',
      last_active_at: minutesAgo(1440),
    },
    persona: {
      tone: 'playful',
      pace: 1.2,
      likeChance: 0.35,
      opensFirst: false,
      baseInterest: 44,
      openers: [],
      followUps: [
        'What are you wearing right now? Style-wise, relax 😂',
        'Best thrift find ever?',
        'Can you dance or do you just nod along?',
      ],
    },
  },
  {
    profile: {
      id: 'p_chinedu',
      first_name: 'Chinedu',
      birth_date: '1995-08-03',
      gender: 'man',
      pronouns: 'he/him',
      bio: 'Content creator from Enugu, now in Lagos traffic full time. My laugh is loud. Consider this your warning.',
      job_title: 'Content Creator',
      company: null,
      school: 'University of Nigeria',
      city: 'Surulere',
      distance_km: 5,
      height_cm: 177,
      interests: ['Stand-up comedy', 'Afrobeats', 'Film', 'Cooking', 'Travel'],
      prompts: [
        {
          question: 'I will fall for you if',
          answer: 'You laugh at my jokes before the punchline.',
        },
        {
          question: 'Best travel story',
          answer: 'Missed a flight in Accra and made three friends for life.',
        },
      ],
      photo_urls: [chineduPhoto],
      presence: 'active_now',
      verification: 'photo_verified',
      last_active_at: minutesAgo(1),
    },
    persona: {
      tone: 'playful',
      pace: 0.7,
      likeChance: 0.9,
      opensFirst: true,
      baseInterest: 64,
      openers: [
        'Omo, we matched! Quick one: what is the funniest thing you have seen in Lagos traffic? 😂',
      ],
      followUps: [
        'Tell me your worst joke. I promise to laugh.',
        'Enugu or Lagos food: pick a side.',
        'Where would you travel tomorrow if it was free?',
      ],
    },
  },
  {
    profile: {
      id: 'p_chioma',
      first_name: 'Chioma',
      birth_date: '1993-06-01',
      gender: 'woman',
      pronouns: 'she/her',
      bio: 'Founder of a tiny skincare brand. I ask a lot of questions. Consider yourself warned.',
      job_title: 'Founder',
      company: 'Glow Theory',
      school: 'Pan-Atlantic University',
      city: 'Ikoyi',
      distance_km: 11,
      height_cm: 167,
      interests: ['Entrepreneurship', 'Skincare', 'Travel', 'Yoga', 'Afrobeats'],
      prompts: [
        { question: 'I am looking for', answer: 'Someone curious and kind, in that order.' },
      ],
      photo_urls: [chiomaPhoto],
      presence: 'online',
      verification: 'verified',
      last_active_at: minutesAgo(3),
    },
    persona: {
      tone: 'warm',
      pace: 0.9,
      likeChance: 0.65,
      opensFirst: false,
      baseInterest: 58,
      openers: [],
      followUps: [
        'What is something you are building right now, big or small?',
        'Where do you feel most like yourself?',
        'What made you smile today?',
      ],
    },
  },
]
