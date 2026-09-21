import { transformApiResponse } from '@/lib/api-envelope'
import { meApi, resetActivity } from '@/mock-backend'
import type { TypeProfileServicePort } from '../../ports/profile-service.port'
import { toAccountProfile, toMePatch } from '../transformers/profile-transformer'

export default function useProfileServiceMock(): TypeProfileServicePort {
  return {
    async getMe() {
      return transformApiResponse(await meApi.getMe(), toAccountProfile)
    },
    async updateMe(draft) {
      return transformApiResponse(await meApi.updateMe(toMePatch(draft)), toAccountProfile)
    },
    resetActivity,
  }
}
