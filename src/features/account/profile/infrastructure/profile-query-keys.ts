export const PROFILE_QUERY_ROOT = 'account/profile'

export const profileQueryKeys = {
  root: PROFILE_QUERY_ROOT,
  me: () => `${PROFILE_QUERY_ROOT}/me`,
}
