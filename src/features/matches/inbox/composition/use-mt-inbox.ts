import useInbox, { type TypeUseInboxOptions } from '../application/use-inbox'
import useMtInboxDeps from './use-mt-inbox-deps'

export default function useMtInbox(options: Omit<TypeUseInboxOptions, 'deps'> = {}) {
  return useInbox({ deps: useMtInboxDeps(), ...options })
}
