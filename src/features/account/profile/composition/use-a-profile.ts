import useProfile from '../application/use-profile'
import useAProfileDeps from './use-a-profile-deps'

export default function useAProfile() {
  return useProfile({ deps: useAProfileDeps() })
}
