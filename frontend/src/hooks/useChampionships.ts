import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { Championship, Round } from '../types'

export function useGroupChampionships(groupId: string) {
  return useQuery<Championship[]>({
    queryKey: ['championships', groupId],
    queryFn: () => api.get(`/championships/group/${groupId}`).then(r => r.data),
    enabled: !!groupId
  })
}

export function useCreateChampionship() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name: string
      season: string
      sportId: string
      groupId: string
      scoringMode?: string
      betScope?: string
      defaultBetAmount?: number
    }) => api.post('/championships', data).then(r => r.data),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['championships', vars.groupId] })
  })
}

export function useChampionshipRounds(championshipId: string) {
  return useQuery<Round[]>({
    queryKey: ['rounds', championshipId],
    queryFn: () => api.get(`/championships/${championshipId}/rounds`).then(r => r.data),
    enabled: !!championshipId
  })
}

export function useCreateRound() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ championshipId, name, orderNum }: { championshipId: string; name: string; orderNum?: number }) =>
      api.post(`/championships/${championshipId}/rounds`, { name, orderNum }).then(r => r.data),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['rounds', vars.championshipId] })
  })
}

export function useDeleteRound() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ championshipId, roundId }: { championshipId: string; roundId: string }) =>
      api.delete(`/championships/${championshipId}/rounds/${roundId}`).then(r => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['rounds', vars.championshipId] })
      qc.invalidateQueries({ queryKey: ['matches'] })
    }
  })
}

export function useCloseChampionship() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (championshipId: string) =>
      api.post(`/championships/${championshipId}/close`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['championships'] })
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
      qc.invalidateQueries({ queryKey: ['bets'] })
    }
  })
}
