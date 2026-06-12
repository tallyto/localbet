import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { ActivityEvent } from '../types'
import { useAuth } from '../context/AuthContext'

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

function toNotification(event: ActivityEvent): AppNotification {
  return {
    id: event.id,
    groupId: event.groupId,
    groupName: event.groupName,
    title: event.title,
    description: event.description,
    href: `/groups/${event.groupId}`,
    tone: event.tone,
  }
}

export function useNotifications() {
  const { user, isAuthenticated } = useAuth()
  const [readIds, setReadIds] = useState<string[]>(() => readStoredIds(user?.userId))

  const { data } = useQuery<ActivityEvent[]>({
    queryKey: ['activity-notifications'],
    queryFn: () => api.get('/activity/notifications').then(r => r.data),
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  })

  const notifications = (data ?? []).map(toNotification)
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
