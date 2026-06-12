import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useGroupMatches, useCreateMatch, useSetScore, useUpdateScore, useDeleteMatch, useSports } from '../hooks/useMatches'
import { useGroupChampionships, useCreateChampionship, useCloseChampionship, useChampionshipRounds, useCreateRound, useDeleteRound, useDeleteChampionship } from '../hooks/useChampionships'
import { useGroupMatchBets, usePlaceBet } from '../hooks/useBets'
import { useLeaderboard, useMyRole, useGroup } from '../hooks/useGroups'
import { useAuth } from '../context/AuthContext'
import { Championship, Match } from '../types'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { DateTimePicker } from '../components/DateTimePicker'
import { Plus, Trophy, Swords, Trash2, ChevronDown, ChevronUp, Loader2, Target, Info, List, Columns } from 'lucide-react'

function Tooltip({ children, content }: { children: React.ReactNode; content: React.ReactNode }) {
  return (
    <span className="relative group inline-flex items-center">
      {children}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-left leading-relaxed shadow-xl">
        {content}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </span>
    </span>
  )
}

const SCORING_RULES_TOOLTIP = (
  <div className="space-y-1.5">
    <p className="font-semibold text-white mb-1">Regras de pontuação</p>
    <p><span className="font-bold text-green-400">10 pts</span> — Placar exato</p>
    <p><span className="font-bold text-blue-400">7 pts</span> — Vencedor + diferença de gols certos</p>
    <p><span className="font-bold text-yellow-400">3 pts</span> — Apenas o vencedor certo</p>
    <p><span className="font-bold text-gray-400">0 pts</span> — Errou</p>
    <hr className="border-gray-700 my-1.5" />
    <p className="text-gray-300">O prêmio é distribuído proporcionalmente aos pontos. Se ninguém acertar, cada um recebe o que apostou de volta.</p>
  </div>
)

const EXACT_ONLY_TOOLTIP = (
  <div className="space-y-1.5">
    <p className="font-semibold text-white mb-1">Apenas placar exato</p>
    <p>Somente quem acertar o placar exato divide o prêmio igualmente.</p>
    <hr className="border-gray-700 my-1.5" />
    <p><span className="font-bold text-green-400">10 pts</span> — Acerto exato (ganha parte do prêmio)</p>
    <p><span className="font-bold text-blue-400">7 pts</span> — Vencedor + diff (sem prêmio)</p>
    <p><span className="font-bold text-yellow-400">3 pts</span> — Apenas vencedor (sem prêmio)</p>
    <p className="text-gray-300 mt-1">Se ninguém acertar o exato, cada um recebe o que apostou de volta.</p>
  </div>
)

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatMatchDate = (dateStr: string) => {
  const d = new Date(dateStr)
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const day = weekdays[d.getDay()]
  const date = d.getDate()
  const month = months[d.getMonth()]
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${day} ${date} ${month} · ${hours}:${minutes}`
}

export function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const { user } = useAuth()
  const [tab, setTab] = useState<'matches' | 'leaderboard'>('matches')
  const [showNewMatch, setShowNewMatch] = useState(false)
  const [rankingScope, setRankingScope] = useState<{ type: 'overall' | 'championship' | 'standalone'; championshipId?: string }>({ type: 'overall' })

  const { data: group } = useGroup(groupId ?? '')
  const { data: matches, isLoading } = useGroupMatches(groupId ?? '')
  const { data: championships } = useGroupChampionships(groupId ?? '')
  const myRole = useMyRole(groupId ?? '', user?.userId)
  const isOwner = myRole === 'OWNER'
  const [showNewChampionship, setShowNewChampionship] = useState(false)

  const leaderboardScope = rankingScope.type === 'championship'
    ? { championshipId: rankingScope.championshipId }
    : rankingScope.type === 'standalone'
    ? { standalone: true }
    : undefined
  const { data: leaderboard } = useLeaderboard(groupId ?? '', leaderboardScope)

  const hasStandalone = (matches ?? []).some(m => !m.championship)

  if (!groupId) return null

  return (
    <Layout breadcrumb={group ? [{ label: 'Meus grupos', href: '/dashboard' }, { label: group.name }] : undefined}>
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('matches')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'matches'
              ? 'bg-white text-gray-900 shadow-card'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          Partidas
        </button>
        <button
          onClick={() => setTab('leaderboard')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'leaderboard'
              ? 'bg-white text-gray-900 shadow-card'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          Ranking
        </button>
      </div>

      {tab === 'matches' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Partidas</h2>
            {isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewChampionship(true)}
                  className="btn-outline text-xs px-3 py-1.5 gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Campeonato
                </button>
                <button
                  onClick={() => setShowNewMatch(true)}
                  className="btn-primary text-xs px-3 py-1.5 gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Partida
                </button>
              </div>
            )}
          </div>

          {showNewChampionship && (
            <NewChampionshipForm groupId={groupId} onClose={() => setShowNewChampionship(false)} />
          )}

          {showNewMatch && (
            <NewMatchForm groupId={groupId} championships={championships ?? []} onClose={() => setShowNewMatch(false)} />
          )}

          {isLoading ? (
            <MatchesSkeleton />
          ) : matches?.length === 0 && championships?.length === 0 ? (
            <div className="card p-10 text-center mt-2">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Swords className="w-6 h-6 text-gray-400" />
              </div>
              <p className="font-medium text-gray-700 mb-1">Nenhuma partida ainda</p>
              <p className="text-sm text-gray-400">Crie um campeonato ou adicione partidas avulsas.</p>
            </div>
          ) : (
            <MatchList matches={matches ?? []} championships={championships ?? []} groupId={groupId} isOwner={isOwner} />
          )}
        </div>
      )}

      {tab === 'leaderboard' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-gray-900">Ranking</h2>
            <Tooltip content={SCORING_RULES_TOOLTIP}>
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            </Tooltip>
          </div>

          {/* Scope tabs */}
          <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setRankingScope({ type: 'overall' })}
              className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                rankingScope.type === 'overall'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Geral
            </button>
            {(championships ?? []).map(c => (
              <button
                key={c.id}
                onClick={() => setRankingScope({ type: 'championship', championshipId: c.id })}
                className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-full font-medium transition-colors whitespace-nowrap ${
                  rankingScope.type === 'championship' && rankingScope.championshipId === c.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c.name}{c.season ? ` ${c.season}` : ''}
              </button>
            ))}
            {hasStandalone && (
              <button
                onClick={() => setRankingScope({ type: 'standalone' })}
                className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  rankingScope.type === 'standalone'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Partidas avulsas
              </button>
            )}
          </div>

          {!leaderboard?.length ? (
            <div className="card p-10 text-center mt-2">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-gray-400" />
              </div>
              <p className="font-medium text-gray-700 mb-1">Nenhuma pontuação ainda</p>
              <p className="text-sm text-gray-400">O ranking aparece quando as primeiras partidas forem finalizadas.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                return (
                  <div key={entry.userId} className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                    i === 0 ? 'bg-yellow-50 border-yellow-200' :
                    i === 1 ? 'bg-gray-50 border-gray-200' :
                    i === 2 ? 'bg-orange-50 border-orange-100' :
                    'bg-white border-gray-200'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' :
                      i === 1 ? 'bg-gray-200 text-gray-600' :
                      i === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {medal ?? i + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{entry.userName}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {entry.exactScores} acerto{entry.exactScores !== 1 ? 's' : ''} exato{entry.exactScores !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <span className={`text-base font-bold flex-shrink-0 ${
                      i === 0 ? 'text-yellow-600' : i === 1 ? 'text-gray-600' : i === 2 ? 'text-orange-500' : 'text-brand-600'
                    }`}>
                      {entry.totalPoints} pts
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}

function ChampionshipHeader({ championship, isOwner }: {
  championship: Championship
  isOwner: boolean
}) {
  const closeChampionship = useCloseChampionship()
  const deleteChampionship = useDeleteChampionship()
  const deleteRound = useDeleteRound()
  const { data: rounds } = useChampionshipRounds(championship.id)
  const [showRounds, setShowRounds] = useState(false)
  const [roundError, setRoundError] = useState('')
  const [championshipError, setChampionshipError] = useState('')
  const [confirmAction, setConfirmAction] = useState<'close' | 'deleteChampionship' | null>(null)
  const [roundToDelete, setRoundToDelete] = useState<{ id: string; name: string } | null>(null)
  const isClosed = championship.status === 'CLOSED'
  const isChampScope = championship.betScope === 'CHAMPIONSHIP'
  const isExactOnly = championship.scoringMode === 'EXACT_ONLY'

  async function handleCloseChampionship() {
    setChampionshipError('')
    try {
      await closeChampionship.mutateAsync(championship.id)
      setConfirmAction(null)
    } catch (err: any) {
      setChampionshipError(err.response?.data?.error ?? 'Erro ao encerrar campeonato')
    }
  }

  async function handleDeleteChampionship() {
    setChampionshipError('')
    try {
      await deleteChampionship.mutateAsync({ championshipId: championship.id })
      setConfirmAction(null)
    } catch (err: any) {
      setChampionshipError(err.response?.data?.error ?? 'Erro ao remover campeonato')
    }
  }

  async function handleDeleteRound() {
    if (!roundToDelete) return
    setRoundError('')
    try {
      await deleteRound.mutateAsync({ championshipId: championship.id, roundId: roundToDelete.id })
      setRoundToDelete(null)
    } catch (err: any) {
      setRoundError(err.response?.data?.error ?? 'Erro ao remover rodada')
    }
  }

  return (
    <>
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <h3 className="font-semibold text-gray-800">{championship.name}</h3>
      {championship.season && (
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{championship.season}</span>
      )}
      <Tooltip content={isExactOnly ? EXACT_ONLY_TOOLTIP : SCORING_RULES_TOOLTIP}>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium cursor-help border border-dashed
          bg-purple-50 text-purple-700 border-purple-200">
          {isExactOnly ? 'Exato' : 'Proporcional'} ⓘ
        </span>
      </Tooltip>
      {isChampScope && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          isClosed ? 'bg-gray-100 text-gray-500' : 'bg-orange-50 text-orange-700'
        }`}>
          {isClosed ? 'Encerrado' : 'Prêmio acumulado'}
        </span>
      )}
      {isOwner && isChampScope && !isClosed && (
        <button
          onClick={() => setConfirmAction('close')}
          disabled={closeChampionship.isPending}
          className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-60"
        >
          Encerrar campeonato
        </button>
      )}
      {isOwner && (
        <button
          onClick={() => setConfirmAction('deleteChampionship')}
          disabled={deleteChampionship.isPending}
          className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50 disabled:opacity-60"
        >
          Remover campeonato
        </button>
      )}
      {isOwner && rounds && rounds.length > 0 && (
        <button
          onClick={() => setShowRounds(v => !v)}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          {showRounds ? 'Ocultar rodadas' : `Gerenciar rodadas (${rounds.length})`}
        </button>
      )}
    </div>

    {championshipError && (
      <p className="text-xs text-red-500 mb-2">{championshipError}</p>
    )}

    {isOwner && showRounds && rounds && rounds.length > 0 && (
      <div className="mb-3 ml-2 flex flex-wrap gap-2">
        {rounds.map(r => (
          <span key={r.id} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {r.name}
            <button
              onClick={() => setRoundToDelete({ id: r.id, name: r.name })}
              disabled={deleteRound.isPending}
              className="text-gray-400 hover:text-red-500 font-bold leading-none disabled:opacity-50"
              title="Remover rodada"
            >
              ×
            </button>
          </span>
        ))}
        {roundError && (
          <p className="text-xs text-red-500 w-full mt-1">{roundError}</p>
        )}
      </div>
    )}
    <ConfirmDialog
      open={confirmAction === 'close'}
      title="Encerrar campeonato"
      description={`Encerrar "${championship.name}" e distribuir o prêmio acumulado?`}
      confirmLabel="Encerrar"
      loading={closeChampionship.isPending}
      onConfirm={handleCloseChampionship}
      onCancel={() => setConfirmAction(null)}
    />
    <ConfirmDialog
      open={confirmAction === 'deleteChampionship'}
      title="Remover campeonato"
      description={`Remover "${championship.name}" e todos os jogos dele? Esta ação não pode ser desfeita.`}
      confirmLabel="Remover"
      loading={deleteChampionship.isPending}
      onConfirm={handleDeleteChampionship}
      onCancel={() => setConfirmAction(null)}
    />
    <ConfirmDialog
      open={!!roundToDelete}
      title="Remover rodada"
      description={`Remover rodada "${roundToDelete?.name ?? ''}" e todos os jogos dela? Esta ação não pode ser desfeita.`}
      confirmLabel="Remover"
      loading={deleteRound.isPending}
      onConfirm={handleDeleteRound}
      onCancel={() => setRoundToDelete(null)}
    />
    </>
  )
}

function MatchList({ matches, championships, groupId, isOwner }: {
  matches: Match[]
  championships: Championship[]
  groupId: string
  isOwner: boolean
}) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  const [bracketChampionships, setBracketChampionships] = useState<Set<string>>(new Set())

  // Separar partidas com e sem campeonato
  const withChampionship = matches.filter(m => m.championship)
  const withoutChampionship = matches.filter(m => !m.championship)

  // Agrupar por campeonato, depois por round.id (não por nome, para evitar duplicatas)
  type RoundGroup = { roundId: string; roundName: string; orderNum?: number; matches: Match[] }
  const byChampionship = championships.reduce<Record<string, { championship: Championship; rounds: Record<string, RoundGroup> }>>((acc, championship) => {
    acc[championship.id] = { championship, rounds: {} }
    return acc
  }, {})

  withChampionship.forEach(match => {
    const cId = match.championship!.id
    if (!byChampionship[cId]) byChampionship[cId] = { championship: match.championship!, rounds: {} }
    const roundId = match.round?.id ?? 'no-round'
    const roundName = match.round?.name ?? 'Sem rodada'
    if (!byChampionship[cId].rounds[roundId]) byChampionship[cId].rounds[roundId] = { roundId, roundName, orderNum: match.round?.orderNum, matches: [] }
    byChampionship[cId].rounds[roundId].matches.push(match)
  })

  function toggleBracket(cId: string, enabled: boolean) {
    setBracketChampionships(prev => {
      const next = new Set(prev)
      if (enabled) next.add(cId)
      else next.delete(cId)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {Object.values(byChampionship).map(({ championship, rounds }) => {
        const isBracket = bracketChampionships.has(championship.id)
        const roundList = Object.values(rounds).sort((a, b) => (a.orderNum ?? 9999) - (b.orderNum ?? 9999))
        const hasRounds = roundList.some(r => r.roundId !== 'no-round')

        return (
          <div key={championship.id}>
            <ChampionshipHeader championship={championship} isOwner={isOwner} />

            {hasRounds && (
              <div className="flex gap-0.5 mb-3 bg-gray-100 p-0.5 rounded-lg w-fit">
                <button
                  onClick={() => toggleBracket(championship.id, false)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${!isBracket ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List className="w-3 h-3" /> Lista
                </button>
                <button
                  onClick={() => toggleBracket(championship.id, true)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${isBracket ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Columns className="w-3 h-3" /> Chave
                </button>
              </div>
            )}

            {isBracket ? (
              <BracketView roundGroups={roundList} />
            ) : (
              <div className="space-y-4 pl-2 border-l-2 border-green-100">
                {roundList.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">Nenhum jogo neste campeonato.</p>
                ) : roundList.map(({ roundId, roundName, matches: roundMatches }) => (
                  <div key={roundId}>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{roundName}</p>
                    <div className="space-y-2">
                      {roundMatches.map(match => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          groupId={groupId}
                          isOwner={isOwner}
                          isSelected={selectedMatchId === match.id}
                          onSelect={() => setSelectedMatchId(selectedMatchId === match.id ? null : match.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {withoutChampionship.length > 0 && (
        <div>
          {withChampionship.length > 0 && (
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Outras partidas</p>
          )}
          <div className="space-y-2">
            {withoutChampionship.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                groupId={groupId}
                isOwner={isOwner}
                isSelected={selectedMatchId === match.id}
                onSelect={() => setSelectedMatchId(selectedMatchId === match.id ? null : match.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MatchCard({ match, groupId, isOwner, isSelected, onSelect }: {
  match: Match; groupId: string; isOwner: boolean; isSelected: boolean; onSelect: () => void
}) {
  const { user } = useAuth()
  const setScore = useSetScore()
  const updateScore = useUpdateScore()
  const deleteMatch = useDeleteMatch()
  const { data: bets } = useGroupMatchBets(groupId, match.id)
  const placeBet = usePlaceBet()
  const defaultAmt = match.championship?.defaultBetAmount
  const [betHome, setBetHome] = useState('')
  const [betAway, setBetAway] = useState('')
  const [betAmount, setBetAmount] = useState(defaultAmt ? defaultAmt.toString() : '')
  const [scoreHome, setScoreHome] = useState(match.homeScore?.toString() ?? '')
  const [scoreAway, setScoreAway] = useState(match.awayScore?.toString() ?? '')
  const [editingScore, setEditingScore] = useState(false)
  const [betError, setBetError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const myBet = bets?.find(b => b.user.id === user?.userId)
  const otherBets = bets?.filter(b => b.user.id !== user?.userId) ?? []

  const statusLabel: Record<string, string> = { SCHEDULED: 'Agendada', IN_PROGRESS: 'Em andamento', FINISHED: 'Finalizada' }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  async function confirmDeleteMatch() {
    await deleteMatch.mutateAsync({ matchId: match.id, groupId })
    setShowDeleteConfirm(false)
  }

  async function handleUpdateScore(e: React.FormEvent) {
    e.preventDefault()
    await updateScore.mutateAsync({
      matchId: match.id,
      homeScore: parseInt(scoreHome),
      awayScore: parseInt(scoreAway)
    })
    setEditingScore(false)
  }

  async function handleBet(e: React.FormEvent) {
    e.preventDefault()
    setBetError('')
    try {
      await placeBet.mutateAsync({
        groupId, matchId: match.id,
        homeScore: parseInt(betHome), awayScore: parseInt(betAway),
        amount: parseFloat(betAmount) || 0
      })
      setBetHome(''); setBetAway(''); setBetAmount('')
    } catch (err: any) {
      setBetError(err.response?.data?.error ?? 'Erro ao registrar aposta')
    }
  }

  async function handleScore(e: React.FormEvent) {
    e.preventDefault()
    try {
      await setScore.mutateAsync({
        matchId: match.id,
        homeScore: parseInt(scoreHome), awayScore: parseInt(scoreAway)
      })
      setScoreHome(''); setScoreAway('')
    } catch {}
  }

  return (
    <div className={`card overflow-hidden transition-all ${isSelected ? 'border-brand-200' : ''}`}>
      <button onClick={onSelect} className="w-full text-left p-4 hover:bg-gray-50/60 transition-colors">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-gray-900 truncate">{match.homeTeam}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${
                match.status === 'FINISHED'
                  ? 'bg-gray-100 text-gray-700 font-mono'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {match.status === 'FINISHED' ? `${match.homeScore} - ${match.awayScore}` : 'vs'}
              </span>
              <span className="text-sm font-semibold text-gray-900 truncate">{match.awayTeam}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{formatMatchDate(match.matchDate)}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {myBet && match.status !== 'FINISHED' && (
              <span className="text-xs bg-brand-50 text-brand-700 font-medium px-2 py-0.5 rounded-full border border-brand-100">
                {myBet.homeScore}×{myBet.awayScore}
              </span>
            )}
            {myBet && match.status === 'FINISHED' && myBet.result && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                myBet.result.isExact ? 'bg-green-50 text-green-700 border-green-200' :
                myBet.result.points > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-gray-100 text-gray-500 border-gray-200'
              }`}>
                {myBet.result.points} pts
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              match.status === 'FINISHED' ? 'bg-gray-100 text-gray-500' :
              match.status === 'IN_PROGRESS' ? 'bg-brand-100 text-brand-700' :
              'bg-blue-50 text-blue-600'
            }`}>{statusLabel[match.status] ?? match.status}</span>
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleteMatch.isPending}
                className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Excluir partida"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {isSelected
              ? <ChevronUp className="w-4 h-4 text-gray-400" />
              : <ChevronDown className="w-4 h-4 text-gray-400" />
            }
          </div>
        </div>
      </button>

      {isSelected && (
        <div className="border-t border-gray-100 p-4 space-y-4">

          {/* Minha aposta */}
          {match.status !== 'FINISHED' && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Sua aposta</p>
              {myBet ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-700 font-mono text-lg font-bold">
                    {myBet.homeScore} × {myBet.awayScore}
                  </span>
                  {myBet.amount > 0 && (
                    <span className="text-green-600 text-xs font-medium">
                      {formatCurrency(myBet.amount)}
                    </span>
                  )}
                  <span className="text-green-600 text-xs">Aposta registrada</span>
                </div>
              ) : (
                <>
                  <form onSubmit={handleBet} className="flex flex-wrap items-center gap-2">
                    <input type="number" min="0" value={betHome} onChange={e => setBetHome(e.target.value)}
                      placeholder="0" className="w-16 text-center input-base py-1.5 px-2" required />
                    <span className="text-gray-400 font-medium">×</span>
                    <input type="number" min="0" value={betAway} onChange={e => setBetAway(e.target.value)}
                      placeholder="0" className="w-16 text-center input-base py-1.5 px-2" required />
                    <div className={`flex items-center gap-1 border rounded-lg px-2 py-1.5 text-sm bg-white ${
                      defaultAmt ? 'border-gray-200 bg-gray-50' : 'border-gray-200 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent'
                    }`}>
                      <span className="text-gray-400 text-xs">R$</span>
                      <input
                        type="number" min="0" step="0.01" value={betAmount}
                        onChange={e => !defaultAmt && setBetAmount(e.target.value)}
                        readOnly={!!defaultAmt}
                        placeholder="0,00"
                        className={`w-20 outline-none text-sm ${defaultAmt ? 'text-gray-500 cursor-default' : ''}`}
                      />
                      {defaultAmt && (
                        <span className="text-gray-400 text-xs" title="Valor fixo definido pelo campeonato">🔒</span>
                      )}
                    </div>
                    <button type="submit" disabled={placeBet.isPending} className="btn-primary px-3 py-1.5 text-xs">
                      {placeBet.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apostar'}
                    </button>
                  </form>
                  {betError && <p className="text-red-500 text-xs mt-1">{betError}</p>}
                </>
              )}
            </div>
          )}

          {/* Placar final — só o dono do grupo pode registrar/editar */}
          {isOwner && match.status !== 'FINISHED' && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Registrar placar final</p>
              <form onSubmit={handleScore} className="flex items-center gap-2">
                <input type="number" min="0" value={scoreHome} onChange={e => setScoreHome(e.target.value)}
                  placeholder="0" className="w-16 text-center input-base py-1.5 px-2" required />
                <span className="text-gray-400 font-medium">×</span>
                <input type="number" min="0" value={scoreAway} onChange={e => setScoreAway(e.target.value)}
                  placeholder="0" className="w-16 text-center input-base py-1.5 px-2" required />
                <button type="submit" disabled={setScore.isPending}
                  className="btn-primary px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-900">
                  {setScore.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Finalizar'}
                </button>
              </form>
            </div>
          )}

          {/* Editar placar — só para partidas já finalizadas */}
          {isOwner && match.status === 'FINISHED' && (
            <div>
              {!editingScore ? (
                <button
                  onClick={() => setEditingScore(true)}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Corrigir placar
                </button>
              ) : (
                <form onSubmit={handleUpdateScore} className="flex items-center gap-2">
                  <input type="number" min="0" value={scoreHome} onChange={e => setScoreHome(e.target.value)}
                    className="w-16 text-center border border-orange-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" required />
                  <span className="text-gray-400">x</span>
                  <input type="number" min="0" value={scoreAway} onChange={e => setScoreAway(e.target.value)}
                    className="w-16 text-center border border-orange-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" required />
                  <button type="submit" disabled={updateScore.isPending}
                    className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-60">
                    Salvar
                  </button>
                  <button type="button" onClick={() => setEditingScore(false)}
                    className="text-xs text-gray-400 hover:text-gray-600">
                    Cancelar
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Meu resultado — só quando finalizada e apostou */}
          {match.status === 'FINISHED' && myBet && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">Meu resultado</p>
              <div className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
                myBet.result?.isExact ? 'bg-green-50 border-green-200' :
                (myBet.result?.points ?? 0) > 0 ? 'bg-blue-50 border-blue-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-gray-800">{myBet.homeScore} × {myBet.awayScore}</span>
                  {myBet.result?.isExact && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Placar exato!</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {myBet.result && (
                    <span className={`font-semibold ${myBet.result.points === 0 ? 'text-gray-400' : 'text-blue-600'}`}>
                      {myBet.result.points} pts
                    </span>
                  )}
                  {myBet.amount > 0 && myBet.result && (
                    <span className={`font-semibold ${
                      myBet.result.winnings > myBet.amount ? 'text-green-600' :
                      myBet.result.winnings === myBet.amount ? 'text-gray-500' : 'text-red-500'
                    }`}>
                      {myBet.result.winnings > 0
                        ? (myBet.result.winnings === myBet.amount
                            ? formatCurrency(myBet.result.winnings) + ' (devolvido)'
                            : `${formatCurrency(myBet.result.winnings)} (+${formatCurrency(myBet.result.winnings - myBet.amount)})`)
                        : 'Sem ganhos'
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Não apostou — só quando finalizada e não apostou */}
          {match.status === 'FINISHED' && !myBet && (
            <p className="text-xs text-gray-400 italic">Você não apostou neste jogo.</p>
          )}

          {/* Apostas (visíveis só após finalizar) */}
          {match.status === 'FINISHED' && bets && bets.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Apostas ({bets.length})</p>
              <div className="space-y-1.5">
                {bets.map(bet => {
                  const isMe = bet.user.id === user?.userId
                  const pts = bet.result?.points ?? null
                  const winnings = bet.result?.winnings ?? null
                  const isExact = bet.result?.isExact ?? false
                  const hasAmount = (bet.amount ?? 0) > 0
                  const net = winnings !== null && hasAmount ? winnings - (bet.amount ?? 0) : null

                  return (
                    <div key={bet.id} className={`px-3 py-2.5 rounded-lg text-sm ${
                      isMe ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-transparent'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 font-medium">
                            {isMe ? 'Você' : bet.user.name}
                          </span>
                          {isExact && (
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Exato</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {pts !== null && (
                            <span className={`text-xs font-semibold ${pts === 0 ? 'text-gray-400' : 'text-blue-600'}`}>
                              {pts} pts
                            </span>
                          )}
                          <span className="font-mono font-bold text-gray-800">
                            {bet.homeScore} × {bet.awayScore}
                          </span>
                        </div>
                      </div>
                      {hasAmount && (
                        <div className="flex items-center justify-between mt-1.5 text-xs">
                          <span className="text-gray-400">Apostou {formatCurrency(bet.amount)}</span>
                          {winnings !== null && (
                            <span className={`font-semibold ${net !== null && net >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {winnings > 0
                                ? `Ganhou ${formatCurrency(winnings)}${net !== null ? ` (${net >= 0 ? '+' : ''}${formatCurrency(net)})` : ''}`
                                : 'Sem ganhos'
                              }
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

                {bets.some(b => (b.amount ?? 0) > 0) && (() => {
                  const isChampScope = match.championship?.betScope === 'CHAMPIONSHIP'
                  const isClosed = match.championship?.status === 'CLOSED'
                  const isExactOnly = match.championship?.scoringMode === 'EXACT_ONLY'
                  const pool = bets.reduce((s, b) => s + (b.amount ?? 0), 0)
                  return (
                    <div className="pt-1">
                      {isChampScope && !isClosed ? (
                        <p className="text-xs text-orange-500 text-right">
                          Prêmio acumulado no campeonato — ganhos ao encerrar
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 text-right flex items-center justify-end gap-1">
                          Prêmio da partida: {formatCurrency(pool)}
                          <Tooltip content={isExactOnly ? EXACT_ONLY_TOOLTIP : SCORING_RULES_TOOLTIP}>
                            <span className="text-gray-300 cursor-help">ⓘ</span>
                          </Tooltip>
                        </p>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Apostas abertas: mostrar contagem sem revelar valores */}
          {match.status !== 'FINISHED' && otherBets.length > 0 && (
            <p className="text-xs text-gray-400">
              {otherBets.length} outra(s) aposta(s) registrada(s) — os palpites serão revelados após o jogo.
            </p>
          )}
        </div>
      )}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Excluir partida"
        description={`Excluir ${match.homeTeam} x ${match.awayTeam}? Todas as apostas serão removidas.`}
        confirmLabel="Excluir"
        loading={deleteMatch.isPending}
        onConfirm={confirmDeleteMatch}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}

function BracketView({ roundGroups }: {
  roundGroups: { roundId: string; roundName: string; orderNum?: number; matches: Match[] }[]
}) {
  const phaseRounds = roundGroups.filter(r => r.roundId !== 'no-round')

  if (phaseRounds.length === 0) {
    return <p className="text-xs text-gray-400 py-2">Nenhum jogo neste campeonato.</p>
  }

  return (
    <div className="overflow-x-auto -mx-1 px-1 pb-3">
      <div className="flex gap-3 min-w-max">
        {phaseRounds.map(({ roundId, roundName, matches }) => (
          <div key={roundId} className="w-52 flex-shrink-0">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center pb-2 mb-2.5 border-b border-gray-100">
              {roundName}
              <span className="ml-1 font-normal text-gray-300">({matches.length})</span>
            </p>
            <div className="space-y-2">
              {matches.map(match => (
                <BracketMatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BracketMatchCard({ match }: { match: Match }) {
  const finished = match.status === 'FINISHED'
  const inProgress = match.status === 'IN_PROGRESS'
  const homeWins = finished && (match.homeScore ?? 0) > (match.awayScore ?? 0)
  const awayWins = finished && (match.awayScore ?? 0) > (match.homeScore ?? 0)

  return (
    <div className={`rounded-xl border overflow-hidden text-xs transition-colors ${
      inProgress ? 'border-brand-200' : 'border-gray-200'
    }`}>
      <div className={`px-2.5 py-1.5 text-[10px] font-medium leading-none ${
        inProgress ? 'bg-brand-500 text-white' :
        finished ? 'bg-gray-100 text-gray-500' :
        'bg-gray-50 text-gray-400'
      }`}>
        {inProgress ? (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse inline-block" />
            Em andamento
          </span>
        ) : finished ? 'Encerrado' : formatMatchDate(match.matchDate)}
      </div>
      <div className="bg-white divide-y divide-gray-100">
        <div className={`flex items-center justify-between px-2.5 py-2 gap-2 ${homeWins ? 'font-bold text-gray-900' : 'text-gray-400'}`}>
          <span className="truncate">{match.homeTeam}</span>
          {finished && <span className="font-mono font-bold flex-shrink-0 text-gray-700">{match.homeScore}</span>}
        </div>
        <div className={`flex items-center justify-between px-2.5 py-2 gap-2 ${awayWins ? 'font-bold text-gray-900' : 'text-gray-400'}`}>
          <span className="truncate">{match.awayTeam}</span>
          {finished && <span className="font-mono font-bold flex-shrink-0 text-gray-700">{match.awayScore}</span>}
        </div>
      </div>
    </div>
  )
}

function NewMatchForm({ groupId, championships, onClose }: {
  groupId: string
  championships: import('../types').Championship[]
  onClose: () => void
}) {
  const { data: sports } = useSports()
  const createMatch = useCreateMatch()
  const createRound = useCreateRound()
  const [form, setForm] = useState({
    sportId: '', homeTeam: '', awayTeam: '', matchDate: '',
    championshipId: '', roundId: '', newRoundName: ''
  })
  const [creatingRound, setCreatingRound] = useState(false)

  const { data: rounds } = useChampionshipRounds(form.championshipId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      let roundId = form.roundId || undefined

      // Cria nova rodada inline se necessário
      if (creatingRound && form.newRoundName.trim()) {
        const newRound = await createRound.mutateAsync({
          championshipId: form.championshipId,
          name: form.newRoundName.trim(),
          orderNum: rounds ? rounds.length + 1 : 1
        })
        roundId = newRound.id
      }

      await createMatch.mutateAsync({
        sportId: form.sportId, homeTeam: form.homeTeam, awayTeam: form.awayTeam,
        matchDate: form.matchDate, groupId,
        championshipId: form.championshipId || undefined,
        roundId,
      })
      onClose()
    } catch {}
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 card p-4 space-y-3 border-brand-100">
      <h3 className="font-semibold text-gray-900 text-sm">Nova Partida</h3>
      {championships.length > 0 && (
        <select
          value={form.championshipId}
          onChange={e => {
            const champ = championships.find(c => c.id === e.target.value)
            setForm(f => ({
              ...f,
              championshipId: e.target.value,
              sportId: champ ? champ.sport.id : f.sportId,
              roundId: '',
              newRoundName: ''
            }))
            setCreatingRound(false)
          }}
          className="input-base">
          <option value="">Sem campeonato</option>
          {championships.map(c => (
            <option key={c.id} value={c.id}>{c.name}{c.season ? ` ${c.season}` : ''}</option>
          ))}
        </select>
      )}
      <div className={form.championshipId ? 'relative' : ''}>
        <select
          value={form.sportId}
          onChange={e => !form.championshipId && setForm(f => ({ ...f, sportId: e.target.value }))}
          disabled={!!form.championshipId}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
            form.championshipId ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-default' : 'border-gray-300'
          }`}
          required
        >
          <option value="">Selecione o esporte</option>
          {sports?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {form.championshipId && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
            🔒
          </span>
        )}
      </div>
      {form.championshipId && (
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Rodada</label>
          {!creatingRound ? (
            <div className="flex gap-2">
              <select value={form.roundId} onChange={e => setForm(f => ({ ...f, roundId: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Sem rodada</option>
                {rounds?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <button type="button" onClick={() => setCreatingRound(true)}
                className="px-3 py-2 border border-dashed border-green-400 text-green-600 text-sm rounded-lg hover:bg-green-50">
                + Nova
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input value={form.newRoundName} onChange={e => setForm(f => ({ ...f, newRoundName: e.target.value }))}
                placeholder="Nome da rodada (ex: Rodada 1, Quartas)" autoFocus
                className="flex-1 px-3 py-2 border border-green-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <button type="button" onClick={() => { setCreatingRound(false); setForm(f => ({ ...f, newRoundName: '' })) }}
                className="px-3 py-2 text-gray-400 text-sm hover:text-gray-600">
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <input value={form.homeTeam} onChange={e => setForm(f => ({ ...f, homeTeam: e.target.value }))}
          placeholder="Time da casa" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
        <input value={form.awayTeam} onChange={e => setForm(f => ({ ...f, awayTeam: e.target.value }))}
          placeholder="Time visitante" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
      </div>
      <DateTimePicker
        value={form.matchDate}
        onChange={matchDate => setForm(f => ({ ...f, matchDate }))}
        required
      />
      <div className="flex gap-2">
        <button type="submit" disabled={createMatch.isPending || createRound.isPending}
          className="btn-primary text-xs">
          {createMatch.isPending ? 'Criando...' : 'Criar partida'}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost text-xs">
          Cancelar
        </button>
      </div>
    </form>
  )
}

function NewChampionshipForm({ groupId, onClose }: { groupId: string; onClose: () => void }) {
  const { data: sports } = useSports()
  const createChampionship = useCreateChampionship()
  const [form, setForm] = useState({
    name: '', season: '', sportId: '',
    scoringMode: 'PROPORTIONAL',
    betScope: 'MATCH',
    defaultBetAmount: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createChampionship.mutateAsync({
        name: form.name, season: form.season, sportId: form.sportId, groupId,
        scoringMode: form.scoringMode,
        betScope: form.betScope,
        defaultBetAmount: form.defaultBetAmount ? parseFloat(form.defaultBetAmount) : undefined,
      })
      onClose()
    } catch {}
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 card p-4 space-y-3 border-brand-100">
      <h3 className="font-semibold text-gray-900 text-sm">Novo Campeonato</h3>
      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        placeholder="Nome (ex: Série A, Copa do Mundo)" required
        className="input-base" />
      <div className="flex gap-2">
        <input value={form.season} onChange={e => setForm(f => ({ ...f, season: e.target.value }))}
          placeholder="Temporada (ex: 2026)" className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        <select value={form.sportId} onChange={e => setForm(f => ({ ...f, sportId: e.target.value }))}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required>
          <option value="">Esporte</option>
          {sports?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Regras do bolão</p>

        <div>
          <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            Pontuação
            <Tooltip content={SCORING_RULES_TOOLTIP}>
              <span className="text-gray-400 cursor-help">ⓘ</span>
            </Tooltip>
          </label>
          <select value={form.scoringMode} onChange={e => setForm(f => ({ ...f, scoringMode: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="PROPORTIONAL">Proporcional (10 / 7 / 3 pts)</option>
            <option value="EXACT_ONLY">Apenas placar exato (divide o prêmio quem acertar)</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Prêmio</label>
          <select value={form.betScope} onChange={e => setForm(f => ({ ...f, betScope: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="MATCH">Por jogo (prêmio distribuído ao final de cada partida)</option>
            <option value="CHAMPIONSHIP">Campeonato todo (acumula, distribui no encerramento)</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Valor padrão por aposta (opcional)</label>
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-green-500">
            <span className="text-gray-400 text-sm">R$</span>
            <input type="number" min="0" step="0.01" value={form.defaultBetAmount}
              onChange={e => setForm(f => ({ ...f, defaultBetAmount: e.target.value }))}
              placeholder="0,00" className="flex-1 outline-none text-sm" />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Pré-preenche o campo de valor ao apostar</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={createChampionship.isPending}
          className="btn-primary text-xs">
          {createChampionship.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Criar campeonato'}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost text-xs">
          Cancelar
        </button>
      </div>
    </form>
  )
}

function MatchesSkeleton() {
  return (
    <div className="space-y-3 mt-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="card p-4">
          <div className="flex items-center gap-3">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-5 w-12 rounded-lg" />
            <div className="skeleton h-4 w-24 rounded" />
            <div className="ml-auto skeleton h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
