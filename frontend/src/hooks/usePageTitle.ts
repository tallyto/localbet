import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — LocalBet` : 'LocalBet — Bolão entre amigos'
    return () => { document.title = 'LocalBet — Bolão entre amigos' }
  }, [title])
}
