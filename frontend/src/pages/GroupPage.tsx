import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useGroupMatches, useCreateMatch, useSetScore, useUpdateScore, useDeleteMatch, useSports } from '../hooks/useMatches'
import { useGroupChampionships, useCreateChampionship, useCloseChampionship, useChampionshipRounds, useCreateRound, useDeleteRound } from '../hooks/useChampionships'
import { useGroupMatchBets, usePlaceBet } from '../hooks/useBets'
import { useLeaderboard, useMyRole, useGroup } from '../hooks/useGroups'
import { useAuth } from '../context/AuthContext'
import { Match } from '../types'

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
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab('matches')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'matches' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Partidas
        </button>
        <button
          onClick={() => setTab('leaderboard')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'leaderboard' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Ranking
        </button>
      </div>

      {tab === 'matches' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Partidas</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewChampionship(true)}
                className="px-3 py-1.5 border border-green-600 text-green-600 text-sm rounded-lg hover:bg-green-50 transition-colors"
              >
                + Campeonato
              </button>
              <button
                onClick={() => setShowNewMatch(true)}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                + Partida
              </button>
            </div>
          </div>

          {showNewChampionship && (
            <NewChampionshipForm groupId={groupId} onClose={() => setShowNewChampionship(false)} />
          )}

          {showNewMatch && (
            <NewMatchForm groupId={groupId} championships={championships ?? []} onClose={() => setShowNewMatch(false)} />
          )}

          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Carregando...</div>
          ) : matches?.length === 0 ? (
            <p className="text-center py-8 text-gray-400">Nenhuma partida cadastrada ainda.</p>
          ) : (
            <MatchList matches={matches ?? []} groupId={groupId} isOwner={isOwner} />
          )}
        </div>
      )}

      {tab === 'leaderboard' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-gray-700">Ranking</h2>
            <Tooltip content={SCORING_RULES_TOOLTIP}>
              <span className="text-gray-400 text-sm cursor-help">ⓘ</span>
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
            <p className="text-center py-8 text-gray-400">Ainda não há pontuação registrada.</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, i) => (
                <div key={entry.userId} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 text-gray-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>{i + 1}</span>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{entry.userName}</p>
                    <p className="text-xs text-gray-400">
                      {entry.exactScores} acerto(s) exato(s)
                    </p>
                  </div>

                  <span className="text-lg font-bold text-green-600 flex-shrink-0">
                    {entry.totalPoints} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}

function ChampionshipHeader({ championship, isOwner }: {
  championship: NonNullable<Match['championship']> & { scoringMode?: string; betScope?: string; status?: string; defaultBetAmount?: number }
  isOwner: boolean
}) {
  const closeChampionship = useCloseChampionship()
  const deleteRound = useDeleteRound()
  const { data: rounds } = useChampionshipRounds(championship.id)
  const [showRounds, setShowRounds] = useState(false)
  const [roundError, setRoundError] = useState('')
  const isClosed = championship.status === 'CLOSED'
  const isChampScope = championship.betScope === 'CHAMPIONSHIP'
  const isExactOnly = championship.scoringMode === 'EXACT_ONLY'

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
          {isClosed ? 'Encerrado' : 'Pool total'}
        </span>
      )}
      {isOwner && isChampScope && !isClosed && (
        <button
          onClick={() => {
            if (!confirm(`Encerrar "${championship.name}" e distribuir o prêmio acumulado?`)) return
            closeChampionship.mutate(championship.id)
          }}
          disabled={closeChampionship.isPending}
          className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-60"
        >
          Encerrar campeonato
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

    {isOwner && showRounds && rounds && rounds.length > 0 && (
      <div className="mb-3 ml-2 flex flex-wrap gap-2">
        {rounds.map(r => (
          <span key={r.id} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {r.name}
            <button
              onClick={async () => {
                if (!confirm(`Remover rodada "${r.name}"?`)) return
                setRoundError('')
                try {
                  await deleteRound.mutateAsync({ championshipId: championship.id, roundId: r.id })
                } catch (err: any) {
                  setRoundError(err.response?.data?.error ?? 'Erro ao remover rodada')
                }
              }}
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
    </>
  )
}

function MatchList({ matches, groupId, isOwner }: { matches: Match[]; groupId: string; isOwner: boolean }) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  // Separar partidas com e sem campeonato
  const withChampionship = matches.filter(m => m.championship)
  const withoutChampionship = matches.filter(m => !m.championship)

  // Agrupar por campeonato, depois por round.id (não por nome, para evitar duplicatas)
  type RoundGroup = { roundId: string; roundName: string; orderNum?: number; matches: Match[] }
  const byChampionship = withChampionship.reduce<Record<string, { championship: NonNullable<Match['championship']>; rounds: Record<string, RoundGroup> }>>((acc, match) => {
    const cId = match.championship!.id
    if (!acc[cId]) acc[cId] = { championship: match.championship!, rounds: {} }
    const roundId = match.round?.id ?? 'no-round'
    const roundName = match.round?.name ?? 'Sem rodada'
    if (!acc[cId].rounds[roundId]) acc[cId].rounds[roundId] = { roundId, roundName, orderNum: match.round?.orderNum, matches: [] }
    acc[cId].rounds[roundId].matches.push(match)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.values(byChampionship).map(({ championship, rounds }) => (
        <div key={championship.id}>
          <ChampionshipHeader championship={championship as any} isOwner={isOwner} />
          <div className="space-y-4 pl-2 border-l-2 border-green-100">
            {Object.values(rounds)
              .sort((a, b) => (a.orderNum ?? 9999) - (b.orderNum ?? 9999))
              .map(({ roundId, roundName, matches: roundMatches }) => (
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
        </div>
      ))}

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

  const myBet = bets?.find(b => b.user.id === user?.userId)
  const otherBets = bets?.filter(b => b.user.id !== user?.userId) ?? []

  const statusLabel: Record<string, string> = { SCHEDULED: 'Agendada', IN_PROGRESS: 'Em andamento', FINISHED: 'Finalizada' }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`Excluir ${match.homeTeam} x ${match.awayTeam}? Todas as apostas serão removidas.`)) return
    await deleteMatch.mutateAsync({ matchId: match.id, groupId })
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button onClick={onSelect} className="w-full text-left p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-sm font-medium text-gray-800">{match.homeTeam}</span>
            <span className="text-gray-400 text-sm">
              {match.status === 'FINISHED'
                ? `${match.homeScore} - ${match.awayScore}`
                : 'vs'}
            </span>
            <span className="text-sm font-medium text-gray-800">{match.awayTeam}</span>
          </div>
          <div className="flex items-center gap-2">
            {myBet && match.status !== 'FINISHED' && (
              <span className="text-xs text-green-600 font-medium">
                Aposta: {myBet.homeScore}×{myBet.awayScore}
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              match.status === 'FINISHED' ? 'bg-gray-100 text-gray-500' :
              match.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' :
              'bg-blue-100 text-blue-600'
            }`}>{statusLabel[match.status] ?? match.status}</span>
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleteMatch.isPending}
                className="text-gray-300 hover:text-red-500 transition-colors text-xs px-1"
                title="Excluir partida"
              >
                ✕
              </button>
            )}
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
                      R$ {myBet.amount.toFixed(2)}
                    </span>
                  )}
                  <span className="text-green-600 text-xs">Aposta registrada</span>
                </div>
              ) : (
                <>
                  <form onSubmit={handleBet} className="flex flex-wrap items-center gap-2">
                    <input type="number" min="0" value={betHome} onChange={e => setBetHome(e.target.value)}
                      placeholder="0" className="w-16 text-center border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    <span className="text-gray-400">x</span>
                    <input type="number" min="0" value={betAway} onChange={e => setBetAway(e.target.value)}
                      placeholder="0" className="w-16 text-center border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    <div className={`flex items-center gap-1 border rounded-lg px-2 py-1.5 text-sm ${
                      defaultAmt ? 'border-gray-200 bg-gray-50' : 'border-gray-300 focus-within:ring-2 focus-within:ring-green-500'
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
                    <button type="submit" disabled={placeBet.isPending}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-60">
                      Apostar
                    </button>
                  </form>
                  {betError && <p className="text-red-500 text-xs mt-1">{betError}</p>}
                </>
              )}
            </div>
          )}

          {/* Placar final — só o dono do grupo pode registrar/editar */}
          {isOwner && match.status !== 'FINISHED' && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Registrar placar final</p>
              <form onSubmit={handleScore} className="flex items-center gap-2">
                <input type="number" min="0" value={scoreHome} onChange={e => setScoreHome(e.target.value)}
                  placeholder="0" className="w-16 text-center border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
                <span className="text-gray-400">x</span>
                <input type="number" min="0" value={scoreAway} onChange={e => setScoreAway(e.target.value)}
                  placeholder="0" className="w-16 text-center border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
                <button type="submit" disabled={setScore.isPending}
                  className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-60">
                  Finalizar
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
                          <span className="text-gray-400">Apostou R$ {(bet.amount).toFixed(2)}</span>
                          {winnings !== null && (
                            <span className={`font-semibold ${net !== null && net >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {winnings > 0
                                ? `Ganhou R$ ${winnings.toFixed(2)}${net !== null ? ` (${net >= 0 ? '+' : ''}R$ ${net.toFixed(2)})` : ''}`
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
                          Pool acumulado no campeonato — ganhos ao encerrar
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 text-right flex items-center justify-end gap-1">
                          Prêmio da partida: R$ {pool.toFixed(2)}
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
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
      <h3 className="font-medium text-gray-800 text-sm">Nova Partida</h3>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
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
      <input type="datetime-local" value={form.matchDate} onChange={e => setForm(f => ({ ...f, matchDate: e.target.value }))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
      <div className="flex gap-2">
        <button type="submit" disabled={createMatch.isPending || createRound.isPending}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-60">
          {createMatch.isPending ? 'Criando...' : 'Criar partida'}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700">
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
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white rounded-xl border border-green-200 space-y-3">
      <h3 className="font-medium text-gray-800 text-sm">Novo Campeonato</h3>
      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        placeholder="Nome (ex: Premier League, Copa do Mundo)" required
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
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
          <label className="text-xs text-gray-500 mb-1 block">Pool do prêmio</label>
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
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-60">
          {createChampionship.isPending ? 'Criando...' : 'Criar campeonato'}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700">
          Cancelar
        </button>
      </div>
    </form>
  )
}
