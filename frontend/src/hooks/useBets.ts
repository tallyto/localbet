import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { Bet } from '../types'

export function useGroupMatchBets(groupId: string, matchId: string) {
  return useQuery<Bet[]>({
    queryKey: ['bets', groupId, matchId],
    queryFn: () => api.get(`/bets/group/${groupId}/match/${matchId}`).then(r => r.data),
    enabled: !!groupId && !!matchId
  })
}

export function usePlaceBet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { groupId: string; matchId: string; homeScore: number; awayScore: number; amount: number }) =>
      api.post('/bets', data).then(r => r.data),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ['bets', vars.groupId, vars.matchId] })
  })
}
