import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type TypeMemberGender = 'man' | 'woman'

export interface TypeSessionUser {
  id: string
  email: string
  firstName: string
  gender: TypeMemberGender
}

/**
 * Who is signed in. Cross-screen client state: the router guard, the tab bar
 * and the profile page all read it.
 *
 * This store holds state only. Signing in and out goes through the auth
 * slice's use case, which writes here through its session port.
 */
export const useSessionStore = defineStore('session', () => {
  const user = ref<TypeSessionUser | null>(null)
  /** `unknown` until the first restore has asked the backend. */
  const status = ref<'unknown' | 'guest' | 'signed-in'>('unknown')

  function setUser(next: TypeSessionUser | null): void {
    user.value = next
    status.value = next ? 'signed-in' : 'guest'
  }

  return { user, status, isSignedIn: computed(() => status.value === 'signed-in'), setUser }
})
