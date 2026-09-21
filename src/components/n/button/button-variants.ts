import { cva } from '@/lib/cva'

/**
 * `color` and `variant` are declared with empty strings; the real classes live
 * in `compoundVariants`. That is what makes them orthogonal: five colours x
 * four variants without twenty named options.
 */
export const buttonVariants = cva('n-btn', {
  variants: {
    color: {
      primary: '',
      neutral: '',
      destructive: '',
      success: '',
      info: '',
      /** For use on the brand gradient, where every other colour disappears. */
      inverse: '',
    },
    variant: {
      solid: 'n-btn--solid',
      soft: 'n-btn--soft',
      outline: 'n-btn--outline',
      ghost: 'n-btn--ghost',
      link: 'n-btn--link',
    },
    size: {
      sm: 'n-btn--sm',
      md: 'n-btn--md',
      lg: 'n-btn--lg',
      icon: 'n-btn--icon',
      'icon-sm': 'n-btn--icon-sm',
      'icon-lg': 'n-btn--icon-lg',
    },
    block: {
      true: 'n-btn--block',
      false: '',
    },
  },
  defaultVariants: { color: 'primary', variant: 'solid', size: 'md', block: 'false' },
  compoundVariants: [
    { color: 'primary', variant: 'solid', class: 'n-btn--primary-solid' },
    { color: 'primary', variant: 'soft', class: 'n-btn--primary-soft' },
    { color: 'primary', variant: 'outline', class: 'n-btn--primary-outline' },
    { color: 'primary', variant: 'ghost', class: 'n-btn--primary-ghost' },
    { color: 'primary', variant: 'link', class: 'n-btn--primary-link' },

    { color: 'neutral', variant: 'solid', class: 'n-btn--neutral-solid' },
    { color: 'neutral', variant: 'soft', class: 'n-btn--neutral-soft' },
    { color: 'neutral', variant: 'outline', class: 'n-btn--neutral-outline' },
    { color: 'neutral', variant: 'ghost', class: 'n-btn--neutral-ghost' },
    { color: 'neutral', variant: 'link', class: 'n-btn--neutral-link' },

    { color: 'destructive', variant: 'solid', class: 'n-btn--destructive-solid' },
    { color: 'destructive', variant: 'soft', class: 'n-btn--destructive-soft' },
    { color: 'destructive', variant: 'outline', class: 'n-btn--destructive-outline' },
    { color: 'destructive', variant: 'ghost', class: 'n-btn--destructive-ghost' },

    { color: 'success', variant: 'solid', class: 'n-btn--success-solid' },
    { color: 'success', variant: 'soft', class: 'n-btn--success-soft' },

    { color: 'info', variant: 'solid', class: 'n-btn--info-solid' },
    { color: 'info', variant: 'soft', class: 'n-btn--info-soft' },
    { color: 'info', variant: 'outline', class: 'n-btn--info-outline' },

    { color: 'inverse', variant: 'solid', class: 'n-btn--inverse-solid' },
    { color: 'inverse', variant: 'outline', class: 'n-btn--inverse-outline' },
  ],
})

export type TypeButtonColor = 'primary' | 'neutral' | 'destructive' | 'success' | 'info' | 'inverse'
export type TypeButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'link'
export type TypeButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'
