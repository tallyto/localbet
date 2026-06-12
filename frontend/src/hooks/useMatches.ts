import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { Match } from '../types'

export function useGroupMatches(groupId: string) {
  return useQuery<Match[]>({
    queryKey: ['matches', groupId],
    queryFn: () => api.get(`/sports/matches/group/${groupId}`).then(r => r.data),
    enabled: !!groupId
  })
}

export function useSports() {
  return useQuery({
    queryKey: ['sports'],
    queryFn: () => api.get('/sports').then(r => r.data)
  })
}

export function useCreateMatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      sportId: string
      groupId: string
      homeTeam: string
      awayTeam: string
      matchDate: string
      championshipId?: string
      roundId?: string
    }) => api.post('/sports/matches', data).then(r => r.data),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['matches', vars.groupId] })
  })
}

export function useSetScore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ matchId, homeScore, awayScore }: { matchId: string; homeScore: number; awayScore: number }) =>
      api.post(`/matches/${matchId}/score`, { homeScore, awayScore }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matches'] })
      qc.invalidateQueries({ queryKey: ['bets'] })
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
    }
  })
}

export function useUpdateScore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ matchId, homeScore, awayScore }: { matchId: string; homeScore: number; awayScore: number }) =>
      api.put(`/matches/${matchId}/score`, { homeScore, awayScore }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matches'] })
      qc.invalidateQueries({ queryKey: ['bets'] })
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
    }
  })
}

export function useDeleteMatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ matchId, groupId }: { matchId: string; groupId: string }) =>
      api.delete(`/matches/${matchId}`).then(r => r.data),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['matches', vars.groupId] })
  })
}
