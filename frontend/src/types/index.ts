export interface User {
  id: string
  name: string
  email: string
}

export interface Group {
  id: string
  name: string
  inviteCode: string
  ownerId: string
  createdAt: string
}

export interface Sport {
  id: string
  name: string
}

export interface Round {
  id: string
  name: string
  orderNum?: number
  createdAt: string
}

export interface Championship {
  id: string
  name: string
  season?: string
  sport: { id: string; name: string }
  scoringMode: 'PROPORTIONAL' | 'EXACT_ONLY'
  betScope: 'MATCH' | 'CHAMPIONSHIP'
  defaultBetAmount?: number
  status: 'ACTIVE' | 'CLOSED'
  createdAt: string
}

export interface Match {
  id: string
  sport: { id: string; name: string }
  homeTeam: string
  awayTeam: string
  matchDate: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED'
  homeScore?: number
  awayScore?: number
  championship?: Championship
  round?: Round
}

export interface Bet {
  id: string
  user: { id: string; name: string; email: string }
  homeScore: number
  awayScore: number
  amount: number
  result?: {
    points: number
    isExact: boolean
    winnings: number
  }
  createdAt: string
}

export interface BetResult {
  id: string
  betId: string
  points: number
  isExact: boolean
  winnings: number
  calculatedAt: string
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  totalPoints: number
  exactScores: number
  totalBet: number
  totalWinnings: number
}
