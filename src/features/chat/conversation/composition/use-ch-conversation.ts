import useConversation, { type TypeUseConversationOptions } from '../application/use-conversation'
import useChConversationDeps from './use-ch-conversation-deps'

export default function useChConversation(options: Omit<TypeUseConversationOptions, 'deps'>) {
  return useConversation({ deps: useChConversationDeps(), ...options })
}
