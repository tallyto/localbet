import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { ActivityEvent } from '../types'

export function useGroupActivity(groupId: string) {
  return useQuery<ActivityEvent[]>({
    queryKey: ['activity', groupId],
    queryFn: () => api.get(`/activity/groups/${groupId}`).then(r => r.data),
    enabled: !!groupId,
  })
}
