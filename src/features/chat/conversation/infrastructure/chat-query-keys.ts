export const CHAT_QUERY_ROOT = 'chat/conversation'

export const chatQueryKeys = {
  root: CHAT_QUERY_ROOT,
  conversation: (matchId: string) => `${CHAT_QUERY_ROOT}/${matchId}`,
  suggestions: (matchId: string, messageCount: number) =>
    `${CHAT_QUERY_ROOT}/${matchId}/suggestions?n=${messageCount}`,
  rules: (matchId: string) => `${CHAT_QUERY_ROOT}/${matchId}/rules`,
}
