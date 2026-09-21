import type { ApiMe, ApiProfile } from '@/api/types'

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
      photo_count: 1,
      photo_urls: ['https://images.unsplash.com/photo-1644152993066-9b9ee687930d'],
      photo_credit: 'Oluwaferanmi Caleb',
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
      photo_count: 2,
      photo_urls: [
        'https://images.unsplash.com/photo-1723221890385-6949a72be9da',
        'https://images.unsplash.com/photo-1723221907187-3e88c1d74b99',
      ],
      photo_credit: 'Blessing Olarewaju',
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
      photo_count: 2,
      photo_urls: [
        'https://images.unsplash.com/photo-1602058746409-a4adc6d68270',
        'https://images.unsplash.com/photo-1602058746304-2aeebbef0462',
      ],
      photo_credit: 'Abraham Eli',
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
      photo_count: 2,
      photo_urls: [
        'https://images.unsplash.com/photo-1645395375692-502558949baa',
        'https://images.unsplash.com/photo-1645395375722-e0a2a672ba6f',
      ],
      photo_credit: 'lanre tobi',
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
      photo_count: 1,
      photo_urls: ['https://images.unsplash.com/photo-1641932481849-9ac1cacf360c'],
      photo_credit: 'Clout Africa',
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
      id: 'p_sam',
      first_name: 'Sam',
      birth_date: '1999-04-04',
      gender: 'nonbinary',
      pronouns: 'they/them',
      bio: 'Photographer and plant parent (14 and counting). Looking for a golden-hour walking buddy.',
      job_title: 'Photographer',
      company: 'Freelance',
      school: 'Yaba College of Technology',
      city: 'Surulere',
      distance_km: 6,
      height_cm: 174,
      interests: ['Photography', 'Plants', 'Film', 'Hiking', 'Vinyl'],
      prompts: [
        { question: 'I am weirdly attracted to', answer: 'People who name their plants.' },
        { question: 'Let us go to', answer: 'Lekki Conservation Centre at 5pm for the light.' },
      ],
      photo_count: 6,
      presence: 'active',
      verification: 'photo_verified',
      last_active_at: minutesAgo(5),
    },
    persona: {
      tone: 'curious',
      pace: 0.9,
      likeChance: 0.95,
      opensFirst: true,
      baseInterest: 66,
      openers: ['Hi! Saw you are into photography too. Film or digital? 📷'],
      followUps: [
        'What is the best photo you have ever taken?',
        'Do you name your plants? Be honest.',
        'Golden hour or blue hour?',
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
      photo_count: 2,
      photo_urls: [
        'https://images.unsplash.com/photo-1684337273666-1ec3215c76e8',
        'https://images.unsplash.com/photo-1684916929613-2a93a0173e8e',
      ],
      photo_credit: 'Micheal Ogungbe',
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
      id: 'p_ife',
      first_name: 'Ife',
      birth_date: '1997-02-11',
      gender: 'woman',
      pronouns: 'she/her',
      bio: 'Product manager. I plan everything except my love life, apparently.',
      job_title: 'Product Manager',
      company: 'Flutterwave',
      school: 'Covenant University',
      city: 'Lekki',
      distance_km: 14,
      height_cm: 163,
      interests: ['Travel', 'Board games', 'Brunch', 'Yoga', 'Podcasts'],
      prompts: [
        {
          question: 'We will get along if',
          answer: 'You are competitive at board games but a gracious loser.',
        },
      ],
      photo_count: 1,
      photo_urls: ['https://images.unsplash.com/photo-1723221907119-397c26c8f580'],
      photo_credit: 'Blessing Olarewaju',
      presence: 'online_now',
      verification: 'verified',
      last_active_at: minutesAgo(0),
    },
    persona: {
      tone: 'curious',
      pace: 1,
      likeChance: 0.8,
      opensFirst: false,
      baseInterest: 60,
      openers: [],
      followUps: [
        'What board game do you always win at?',
        'Favourite podcast right now?',
        'Where is the best trip you have taken?',
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
      photo_count: 3,
      photo_urls: [
        'https://images.unsplash.com/photo-1672675224932-00552a3ed77a',
        'https://images.unsplash.com/photo-1672675225389-4d7b6f231f5b',
        'https://images.unsplash.com/photo-1673114091701-47b186e25265',
      ],
      photo_credit: 'Micheal Ogungbe',
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
      photo_count: 1,
      photo_urls: ['https://images.unsplash.com/photo-1613876215075-276fd62c89a4'],
      photo_credit: 'Gideon Hezekiah',
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
      id: 'p_jordan',
      first_name: 'Jordan',
      birth_date: '1996-05-18',
      gender: 'nonbinary',
      pronouns: 'they/them',
      bio: 'Climate researcher. I will absolutely make you watch a documentary about fungi.',
      job_title: 'Climate Researcher',
      company: 'Nigerian Conservation Foundation',
      school: 'University of Ibadan',
      city: 'Lekki',
      distance_km: 16,
      height_cm: 176,
      interests: ['Nature', 'Documentaries', 'Hiking', 'Cycling', 'Plants'],
      prompts: [
        { question: 'A fact I love', answer: 'Mycelium networks let trees share nutrients.' },
      ],
      photo_count: 3,
      presence: 'recently_active',
      verification: 'verified',
      last_active_at: minutesAgo(20),
    },
    persona: {
      tone: 'curious',
      pace: 1,
      likeChance: 0.88,
      opensFirst: true,
      baseInterest: 61,
      openers: ['Hey! Quick poll: do you think trees gossip? (They kind of do 🌳)'],
      followUps: [
        'What is a random fact you love?',
        'Hiking or cycling for a first adventure?',
        'What documentary changed how you see things?',
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
      photo_count: 1,
      photo_urls: ['https://images.unsplash.com/photo-1631346543932-ce110c10dbec'],
      photo_credit: 'Arnold Obizzy',
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
  {
    profile: {
      id: 'p_seun',
      first_name: 'Seun',
      birth_date: '1996-04-12',
      gender: 'man',
      pronouns: 'he/him',
      bio: 'Brand strategist. I will critique your favourite logo, then buy you small chops to make up for it.',
      job_title: 'Brand Strategist',
      company: 'Ember Studio',
      school: 'University of Lagos',
      city: 'Victoria Island',
      distance_km: 8,
      height_cm: 188,
      interests: ['Design', 'Afrobeats', 'Football', 'Photography', 'Brunch'],
      prompts: [
        {
          question: 'My most controversial opinion',
          answer: 'Small chops are better than the main meal.',
        },
        { question: 'Typical Sunday', answer: 'Church, a long lunch, then Premier League.' },
      ],
      photo_count: 2,
      photo_urls: [
        'https://images.unsplash.com/photo-1620932934088-fbdb2920e484',
        'https://images.unsplash.com/photo-1620932934121-64b011924f08',
      ],
      photo_credit: 'Shedrack Salami',
      presence: 'online',
      verification: 'verified',
      last_active_at: minutesAgo(4),
    },
    persona: {
      tone: 'warm',
      pace: 1,
      likeChance: 0.8,
      opensFirst: false,
      baseInterest: 57,
      openers: [],
      followUps: [
        'What is your go-to small chop? Puff-puff is the correct answer.',
        'Which logo do you secretly think is ugly?',
        'Arsenal, Chelsea, or you do not watch football at all?',
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
      photo_count: 1,
      photo_urls: ['https://images.unsplash.com/photo-1633379335896-c2a6813cb9e5'],
      photo_credit: 'Chuxie Daniels',
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
      id: 'p_ibrahim',
      first_name: 'Ibrahim',
      birth_date: '1993-11-21',
      gender: 'man',
      pronouns: 'he/him',
      bio: 'Data analyst by day, suya critic by night. Quietly competitive at chess and board games.',
      job_title: 'Data Analyst',
      company: 'Access Bank',
      school: 'Ahmadu Bello University',
      city: 'Ikeja',
      distance_km: 15,
      height_cm: 181,
      interests: ['Chess', 'Board games', 'Travel', 'Reading', 'Coffee'],
      prompts: [
        { question: 'The key to my heart', answer: 'Good suya and a better conversation.' },
      ],
      photo_count: 1,
      photo_urls: ['https://images.unsplash.com/photo-1617440431587-138ca5c563ec'],
      photo_credit: 'Richard Momodu',
      presence: 'recently_active',
      verification: 'id_verified',
      last_active_at: minutesAgo(25),
    },
    persona: {
      tone: 'curious',
      pace: 1.2,
      likeChance: 0.6,
      opensFirst: false,
      baseInterest: 52,
      openers: [],
      followUps: [
        'Where is the best suya spot you know?',
        'Chess or board games: which one are you better at?',
        'What is the last book that kept you up at night?',
      ],
    },
  },
]
