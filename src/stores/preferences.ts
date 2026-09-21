import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { readStored, writeStored } from '@/lib/storage'
import { setAppTimePattern, type TypeTimePattern } from '@/utils/date-formatters'

export type TypeThemePreference = 'system' | 'light' | 'dark'

interface TypeStoredPreferences {
  theme: TypeThemePreference
  timePattern: TypeTimePattern
  showCoach: boolean
}

const DEFAULTS: TypeStoredPreferences = { theme: 'system', timePattern: '12h', showCoach: true }

/**
 * Per-device conveniences — survive reload, never leave the browser. Profile
 * data (bio, discovery preferences) is server state and lives behind the
 * account slice's query port instead.
 */
export const usePreferencesStore = defineStore('preferences', () => {
  const stored = { ...DEFAULTS, ...readStored<Partial<TypeStoredPreferences>>('preferences', {}) }

  const theme = ref<TypeThemePreference>(stored.theme)
  const timePattern = ref<TypeTimePattern>(stored.timePattern)
  const showCoach = ref(stored.showCoach)

  watch(
    [theme, timePattern, showCoach],
    () => {
      writeStored('preferences', {
        theme: theme.value,
        timePattern: timePattern.value,
        showCoach: showCoach.value,
      })

      // The date formatters resolve the pattern at call time, so every screen
      // that re-renders picks this up without being told.
      setAppTimePattern(timePattern.value)

      const root = document.documentElement
      if (theme.value === 'system') root.removeAttribute('data-theme')
      else root.setAttribute('data-theme', theme.value)
    },
    { immediate: true },
  )

  return { theme, timePattern, showCoach }
})
