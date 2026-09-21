import { unwrapApiResponse } from '@/lib/api-envelope'
import { invalidateQueries, useMutation } from '@/lib/use-query'
import type { TypeAuthMutationPort, TypeAuthServicePort } from '../ports/auth.port'

/**
 * Every cached query describes the previous person's world. Switching who is
 * signed in must drop all of it, or the next user briefly sees the last one's
 * matches and profile.
 */
function forgetEverything(): void {
  invalidateQueries('')
}

export default function useAuthMutationAdapter(service: TypeAuthServicePort): TypeAuthMutationPort {
  return {
    useLogInMutation() {
      return useMutation(async (draft) => {
        const response = unwrapApiResponse(await service.logIn(draft), 'Could not log you in.')
        if (!response.data) throw new Error('Could not log you in.')
        forgetEverything()
        return response.data
      })
    },

    useSignUpMutation() {
      return useMutation(async (draft) => {
        const response = unwrapApiResponse(
          await service.signUp(draft),
          'Could not create your account.',
        )
        if (!response.data) throw new Error('Could not create your account.')
        forgetEverything()
        return response.data
      })
    },

    useLogOutMutation() {
      return useMutation(async () => {
        unwrapApiResponse(await service.logOut(), 'Could not log you out.')
        forgetEverything()
      })
    },

    async restore() {
      const response = await service.getSession()
      // A failed restore means "signed out", not a crash on the first screen.
      return response?.status ? response.data : null
    },
  }
}
