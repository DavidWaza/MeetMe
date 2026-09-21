import { transformApiResponse } from '@/lib/api-envelope'
import { authApi } from '@/mock-backend'
import type { TypeAuthServicePort } from '../../ports/auth.port'
import { toLogInInput, toSessionUser, toSignUpInput } from '../transformers/session-transformer'

export default function useAuthServiceMock(): TypeAuthServicePort {
  const toUser = (session: Parameters<typeof toSessionUser>[0] | null) =>
    session ? toSessionUser(session) : null

  return {
    async getSession() {
      return transformApiResponse(await authApi.getSession(), toUser)
    },
    async logIn(draft) {
      return transformApiResponse(await authApi.logIn(toLogInInput(draft)), toUser)
    },
    async signUp(draft) {
      return transformApiResponse(await authApi.signUp(toSignUpInput(draft)), toUser)
    },
    logOut: () => authApi.logOut(),
  }
}
