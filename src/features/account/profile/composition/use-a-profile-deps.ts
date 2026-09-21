import { useToastStore } from '@/stores/toasts'
import useProfileQueryAdapter from '../adapters/profile-query-adapter'
import type { TypeProfileDeps } from '../application/use-profile'
import useProfileServiceMock from '../infrastructure/services/profile-service-mock'

export default function useAProfileDeps(): TypeProfileDeps {
  const toasts = useToastStore()

  return {
    queryPort: useProfileQueryAdapter(useProfileServiceMock()),
    notifier: {
      error: (error, fallback) => toasts.pushError(error, fallback),
      success: (message) => toasts.push({ message, tone: 'success', icon: 'check' }),
    },
  }
}
