import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { Group } from '../types'

export function useMyGroups() {
  return useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: () => api.get('/groups').then(r => r.data)
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => api.post('/groups', { name }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] })
  })
}

export function useJoinGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (inviteCode: string) => api.post('/groups/join', { inviteCode }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] })
  })
}

export function useDeleteGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (groupId: string) => api.delete(`/groups/${groupId}`),
    onSuccess: (_, groupId) => {
      qc.invalidateQueries({ queryKey: ['groups'] })
      qc.removeQueries({ queryKey: ['group', groupId] })
      qc.removeQueries({ queryKey: ['group-members', groupId] })
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
    }
  })
}

export function useGroup(groupId: string) {
  return useQuery<Group>({
    queryKey: ['group', groupId],
    queryFn: () => api.get(`/groups/${groupId}`).then(r => r.data),
    enabled: !!groupId
  })
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => api.get(`/groups/${groupId}/members`).then(r => r.data),
    enabled: !!groupId
  })
}

export function useMyRole(groupId: string, userId: string | undefined) {
  const { data: members } = useGroupMembers(groupId)
  if (!members || !userId) return undefined
  const me = members.find((m: any) => m.user?.id === userId)
  return me?.role as string | undefined
}

export function useLeaderboard(
  groupId: string,
  scope?: { championshipId?: string; standalone?: boolean }
) {
  const params = new URLSearchParams()
  if (scope?.championshipId) params.set('championshipId', scope.championshipId)
  if (scope?.standalone) params.set('standalone', 'true')
  const qs = params.toString()
  return useQuery<import('../types').LeaderboardEntry[]>({
    queryKey: ['leaderboard', groupId, scope?.championshipId ?? null, scope?.standalone ?? false],
    queryFn: () => api.get(`/groups/${groupId}/leaderboard${qs ? '?' + qs : ''}`).then(r => r.data),
    enabled: !!groupId
  })
}
