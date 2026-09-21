import { computed, ref } from 'vue'
import {
  emptySignUpDraft,
  hasErrors,
  validateLogIn,
  validateSignUp,
  type TypeFieldErrors,
  type TypeLogInDraft,
  type TypeSessionUser,
  type TypeSignUpDraft,
} from '../domain/auth-entities'
import type {
  TypeAuthMutationPort,
  TypeAuthNotifierPort,
  TypeSessionPort,
} from '../ports/auth.port'

export interface TypeAuthDeps {
  mutationPort: TypeAuthMutationPort
  session: TypeSessionPort
  notifier: TypeAuthNotifierPort
}

/**
 * Log in, sign up, log out, restore.
 *
 * Returns booleans rather than navigating: where to go next is the screen's
 * decision (routing is not a port), and a failed attempt leaves the form as it
 * was with the reason in `formError`.
 *
 * Field errors appear only after the first submit, so a form doesn't open
 * covered in red.
 */
export default function useAuth(options: { deps: TypeAuthDeps }) {
  const { mutationPort, session, notifier } = options.deps

  const logInMutation = mutationPort.useLogInMutation()
  const signUpMutation = mutationPort.useSignUpMutation()
  const logOutMutation = mutationPort.useLogOutMutation()

  const logInDraft = ref<TypeLogInDraft>({ email: '', password: '' })
  const signUpDraft = ref<TypeSignUpDraft>(emptySignUpDraft())
  const attempted = ref(false)
  /** The backend's reason for a refusal ("That email and password do not match."). */
  const formError = ref<string | null>(null)

  const logInErrors = computed<TypeFieldErrors<TypeLogInDraft>>(() =>
    attempted.value ? validateLogIn(logInDraft.value) : {},
  )
  const signUpErrors = computed<TypeFieldErrors<TypeSignUpDraft>>(() =>
    attempted.value ? validateSignUp(signUpDraft.value) : {},
  )

  function reasonOf(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback
  }

  function signedIn(user: TypeSessionUser): void {
    session.set(user)
    attempted.value = false
    formError.value = null
  }

  async function submitLogIn(): Promise<boolean> {
    attempted.value = true
    formError.value = null
    if (hasErrors(validateLogIn(logInDraft.value))) return false
    try {
      const user = await logInMutation.mutate({ ...logInDraft.value })
      signedIn(user)
      notifier.success(`Welcome back, ${user.firstName}.`)
      return true
    } catch (error) {
      formError.value = reasonOf(error, 'Could not log you in.')
      return false
    }
  }

  async function submitSignUp(): Promise<boolean> {
    attempted.value = true
    formError.value = null
    if (hasErrors(validateSignUp(signUpDraft.value))) return false
    try {
      const user = await signUpMutation.mutate({ ...signUpDraft.value })
      signedIn(user)
      notifier.success(`Welcome to MeetMe, ${user.firstName}!`)
      return true
    } catch (error) {
      formError.value = reasonOf(error, 'Could not create your account.')
      return false
    }
  }

  /** Always ends signed out locally, even if the backend call fails. */
  async function logOut(): Promise<void> {
    try {
      await logOutMutation.mutate()
    } catch {
      /* the local session is cleared regardless */
    }
    session.set(null)
  }

  async function restore(): Promise<TypeSessionUser | null> {
    const user = await mutationPort.restore().catch(() => null)
    session.set(user)
    return user
  }

  function fillLogIn(email: string, password: string): void {
    logInDraft.value = { email, password }
    formError.value = null
  }

  return {
    logInDraft,
    signUpDraft,
    logInErrors,
    signUpErrors,
    formError,
    isLoggingIn: logInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isLoggingOut: logOutMutation.isPending,
    submitLogIn,
    submitSignUp,
    logOut,
    restore,
    fillLogIn,
  }
}
