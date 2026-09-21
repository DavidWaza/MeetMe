import { computed, ref, watch } from 'vue'
import {
  BIO_MAX_LENGTH,
  INTERESTS_MAX,
  type TypeAccountProfile,
  type TypeProfileDraft,
} from '../domain/profile-entities'
import type { TypeProfileNotifierPort, TypeProfileQueryPort } from '../ports/profile-query.port'

export interface TypeProfileDeps {
  queryPort: TypeProfileQueryPort
  notifier: TypeProfileNotifierPort
}

function toDraft(profile: TypeAccountProfile): TypeProfileDraft {
  return {
    name: profile.name,
    bio: profile.bio,
    jobTitle: profile.jobTitle,
    city: profile.city,
    interests: [...profile.interests],
    preferences: { ...profile.preferences },
  }
}

/**
 * Edit-in-place against a local draft. The server copy stays untouched until
 * "Save", so "Discard" is just re-copying it.
 */
export default function useProfile(options: { deps: TypeProfileDeps }) {
  const { queryPort, notifier } = options.deps

  const meQuery = queryPort.useMeQuery()
  const updateMutation = queryPort.useUpdateMutation()
  const resetMutation = queryPort.useResetMutation()

  const profile = computed<TypeAccountProfile | null>(() => {
    const response = meQuery.data.value
    return response?.status ? response.data : null
  })

  const draft = ref<TypeProfileDraft | null>(null)

  watch(
    profile,
    (value) => {
      if (value) draft.value = toDraft(value)
    },
    { immediate: true },
  )

  const isDirty = computed(() => {
    if (!profile.value || !draft.value) return false
    return JSON.stringify(toDraft(profile.value)) !== JSON.stringify(draft.value)
  })

  /** Client-side checks mirror the backend's, so the common mistakes never make a round trip. */
  const errors = computed(() => {
    const value = draft.value
    if (!value) return {}
    return {
      name: value.name.trim() ? undefined : 'Your name cannot be empty.',
      bio: value.bio.length > BIO_MAX_LENGTH ? `At most ${BIO_MAX_LENGTH} characters.` : undefined,
      ageRange:
        value.preferences.ageMax < value.preferences.ageMin
          ? 'Maximum age must be at least the minimum.'
          : undefined,
    }
  })

  const isValid = computed(() => Object.values(errors.value).every((error) => !error))

  function toggleInterest(interest: string): void {
    if (!draft.value) return
    const current = draft.value.interests
    if (current.includes(interest)) {
      draft.value.interests = current.filter((entry) => entry !== interest)
    } else if (current.length >= INTERESTS_MAX) {
      notifier.error(null, `Pick up to ${INTERESTS_MAX} interests.`)
    } else {
      draft.value.interests = [...current, interest]
    }
  }

  async function save(): Promise<void> {
    if (!draft.value || !isValid.value) return
    try {
      await updateMutation.mutate(draft.value)
      await meQuery.refetch()
      notifier.success('Profile saved.')
    } catch (error) {
      notifier.error(error, 'Could not save your profile.')
    }
  }

  function discard(): void {
    if (profile.value) draft.value = toDraft(profile.value)
  }

  async function resetActivity(): Promise<boolean> {
    try {
      await resetMutation.mutate()
      await meQuery.refetch()
      notifier.success('Activity cleared. Everyone is back in your deck.')
      return true
    } catch (error) {
      notifier.error(error, 'Could not reset your activity.')
      return false
    }
  }

  return {
    profile,
    draft,
    errors,
    isDirty,
    isValid,
    isLoading: meQuery.isLoading,
    isSaving: updateMutation.isPending,
    isResetting: resetMutation.isPending,
    toggleInterest,
    save,
    discard,
    resetActivity,
  }
}
