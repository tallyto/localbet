import { useMemo, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { api } from '../api/client'
import { Group, LeaderboardEntry } from '../types'
import { useAuth } from '../context/AuthContext'
import { useMyGroups } from './useGroups'

export interface AppNotification {
  id: string
  groupId: string
  groupName: string
  title: string
  description: string
  href: string
  tone: 'success' | 'info' | 'warning'
}

function storageKey(userId?: string) {
  return `localbet:read-notifications:${userId ?? 'anonymous'}`
}

function readStoredIds(userId?: string) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId)) ?? '[]') as string[]
  } catch {
    return []
  }
}

export function useNotifications() {
  const { user } = useAuth()
  const { data: groups } = useMyGroups()
  const [readIds, setReadIds] = useState<string[]>(() => readStoredIds(user?.userId))

  const leaderboardQueries = useQueries({
    queries: (groups ?? []).map((group: Group) => ({
      queryKey: ['leaderboard', group.id, null, false],
      queryFn: () => api.get<LeaderboardEntry[]>(`/groups/${group.id}/leaderboard`).then(r => r.data),
      enabled: !!group.id,
      staleTime: 30_000,
    })),
  })

  const notifications = useMemo<AppNotification[]>(() => {
    if (!groups?.length || !user?.userId) return []

    return groups.flatMap((group, index) => {
      const leaderboard = leaderboardQueries[index]?.data ?? []
      const myEntry = leaderboard.find(entry => entry.userId === user.userId)
      if (!myEntry) return []

      const position = leaderboard.findIndex(entry => entry.userId === user.userId) + 1
      const items: AppNotification[] = []
      const href = `/groups/${group.id}`

      if (position === 1 && leaderboard.length > 1) {
        items.push({
          id: `${group.id}:leader`,
          groupId: group.id,
          groupName: group.name,
          title: 'Você está liderando',
          description: `Primeiro lugar em ${group.name} com ${myEntry.totalPoints} pontos.`,
          href,
          tone: 'success',
        })
      } else if (position > 0 && position <= 3) {
        items.push({
          id: `${group.id}:podium:${position}`,
          groupId: group.id,
          groupName: group.name,
          title: 'Você está no pódio',
          description: `${position}º lugar em ${group.name}.`,
          href,
          tone: 'info',
        })
      }

      if (myEntry.level > 1) {
        items.push({
          id: `${group.id}:level:${myEntry.level}`,
          groupId: group.id,
          groupName: group.name,
          title: `Nível ${myEntry.level} alcançado`,
          description: `${myEntry.xp} XP acumulados no ranking do grupo.`,
          href,
          tone: 'success',
        })
      }

      for (const badge of myEntry.badges ?? []) {
        items.push({
          id: `${group.id}:badge:${badge}`,
          groupId: group.id,
          groupName: group.name,
          title: badge,
          description: `Conquista desbloqueada em ${group.name}.`,
          href,
          tone: 'info',
        })
      }

      if ((myEntry.exactScores ?? 0) > 0) {
        items.push({
          id: `${group.id}:exact:${myEntry.exactScores}`,
          groupId: group.id,
          groupName: group.name,
          title: 'Placar exato',
          description: `${myEntry.exactScores} acerto${myEntry.exactScores !== 1 ? 's' : ''} exato${myEntry.exactScores !== 1 ? 's' : ''}.`,
          href,
          tone: 'warning',
        })
      }

      return items
    }).slice(0, 20)
  }, [groups, leaderboardQueries, user?.userId])

  const unreadCount = notifications.filter(item => !readIds.includes(item.id)).length

  function markAllAsRead() {
    const next = Array.from(new Set([...readIds, ...notifications.map(item => item.id)]))
    localStorage.setItem(storageKey(user?.userId), JSON.stringify(next))
    setReadIds(next)
  }

  function markAsRead(id: string) {
    if (readIds.includes(id)) return
    const next = [...readIds, id]
    localStorage.setItem(storageKey(user?.userId), JSON.stringify(next))
    setReadIds(next)
  }

  return {
    notifications,
    unreadCount,
    readIds,
    markAllAsRead,
    markAsRead,
  }
}
