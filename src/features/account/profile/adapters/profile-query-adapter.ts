import { unwrapApiResponse } from '@/lib/api-envelope'
import { invalidateQueries, useMutation, useQuery } from '@/lib/use-query'
import { profileQueryKeys } from '../infrastructure/profile-query-keys'
import type { TypeProfileQueryPort } from '../ports/profile-query.port'
import type { TypeProfileServicePort } from '../ports/profile-service.port'

export default function useProfileQueryAdapter(
  service: TypeProfileServicePort,
): TypeProfileQueryPort {
  return {
    useMeQuery() {
      return useQuery({ key: profileQueryKeys.me, fn: () => service.getMe() })
    },

    useUpdateMutation() {
      return useMutation(async (draft) => {
        const response = unwrapApiResponse(
          await service.updateMe(draft),
          'Could not save your profile.',
        )
        // Invalidate explicitly: inside the stale window a remount would not refetch.
        invalidateQueries(profileQueryKeys.root)
        return response.data
      })
    },

    useResetMutation() {
      return useMutation(async () => {
        unwrapApiResponse(await service.resetActivity(), 'Could not reset your activity.')
        // Everything the app has cached describes a world that no longer exists.
        invalidateQueries('')
      })
    },
  }
}
