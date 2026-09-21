/**
 * Interest (0–100) → how the coach describes it. Pure, so the thresholds live
 * in one place and the meter, the label and any test agree.
 */
export interface TypeVibe {
  label: string
  tone: 'cold' | 'cool' | 'warm' | 'hot' | 'fire'
  hint: string
}

const VIBES: { min: number; vibe: TypeVibe }[] = [
  {
    min: 85,
    vibe: { label: 'On fire', tone: 'fire', hint: 'They are very into this. Ask them out!' },
  },
  {
    min: 65,
    vibe: { label: 'Hot', tone: 'hot', hint: 'Great chemistry. Keep the questions coming.' },
  },
  {
    min: 45,
    vibe: {
      label: 'Warm',
      tone: 'warm',
      hint: 'Going well. Reference their profile to go deeper.',
    },
  },
  {
    min: 15,
    vibe: { label: 'Lukewarm', tone: 'cool', hint: 'Try a question about something they love.' },
  },
  {
    min: 0,
    vibe: {
      label: 'Gone quiet',
      tone: 'cold',
      hint: 'They stopped replying. A thoughtful question might help.',
    },
  },
]

export function vibeFor(interest: number): TypeVibe {
  return (VIBES.find((entry) => interest >= entry.min) ?? VIBES[VIBES.length - 1]!).vibe
}
