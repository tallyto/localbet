import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useMyGroups, useCreateGroup, useJoinGroup } from '../hooks/useGroups'
import { Plus, Hash, Users, Copy, Check, ChevronRight, Loader2 } from 'lucide-react'

export function DashboardPage() {
  const { data: groups, isLoading } = useMyGroups()
  const createGroup = useCreateGroup()
  const joinGroup = useJoinGroup()
  const navigate = useNavigate()

  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await createGroup.mutateAsync(groupName)
      setGroupName('')
      setShowCreate(false)
    } catch {
      setError('Erro ao criar grupo')
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const group = await joinGroup.mutateAsync(inviteCode)
      setInviteCode('')
      setShowJoin(false)
      navigate(`/groups/${group.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Código inválido')
    }
  }

  function openCreate() { setShowCreate(true); setShowJoin(false); setError('') }
  function openJoin() { setShowJoin(true); setShowCreate(false); setError('') }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Meus Grupos</h1>
          {!isLoading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {groups?.length === 0 ? 'Nenhum grupo ainda' : `${groups?.length} grupo${groups?.length !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={openJoin} className="btn-outline gap-1.5">
            <Hash className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Entrar com código</span>
            <span className="sm:hidden">Entrar</span>
          </button>
          <button onClick={openCreate} className="btn-primary gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Criar grupo</span>
            <span className="sm:hidden">Criar</span>
          </button>
        </div>
      </div>

      {(showCreate || showJoin) && (
        <div className="mb-6 card p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {showCreate ? 'Novo grupo' : 'Entrar em um grupo'}
          </p>
          {showCreate && (
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="Ex: Bolão da empresa"
                className="input-base flex-1"
                required
                autoFocus
              />
              <button type="submit" disabled={createGroup.isPending} className="btn-primary flex-shrink-0">
                {createGroup.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost flex-shrink-0">
                Cancelar
              </button>
            </form>
          )}
          {showJoin && (
            <form onSubmit={handleJoin} className="flex gap-2">
              <input
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Código (ex: ABC12345)"
                className="input-base flex-1 font-mono tracking-widest"
                maxLength={8}
                required
                autoFocus
              />
              <button type="submit" disabled={joinGroup.isPending} className="btn-primary flex-shrink-0">
                {joinGroup.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar'}
              </button>
              <button type="button" onClick={() => setShowJoin(false)} className="btn-ghost flex-shrink-0">
                Cancelar
              </button>
            </form>
          )}
          {error && (
            <p className="mt-2.5 text-sm text-red-600 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <GroupsSkeleton />
      ) : groups?.length === 0 ? (
        <EmptyGroups onCreate={openCreate} onJoin={openJoin} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {groups?.map(group => (
            <GroupCard key={group.id} group={group} onClick={() => navigate(`/groups/${group.id}`)} />
          ))}
        </div>
      )}
    </Layout>
  )
}

function GroupCard({
  group,
  onClick,
}: {
  group: { id: string; name: string; inviteCode: string; ownerId: string; createdAt: string }
  onClick: () => void
}) {
  const [copied, setCopied] = useState(false)

  function copyCode(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(group.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      onClick={onClick}
      className="card p-5 cursor-pointer hover:shadow-card-hover hover:border-brand-200 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-brand-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-gray-400 font-mono tracking-wider">{group.inviteCode}</span>
              <button
                onClick={copyCode}
                className="text-gray-300 hover:text-brand-600 transition-colors"
                title="Copiar código"
              >
                {copied ? <Check className="w-3 h-3 text-brand-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-400 flex-shrink-0 mt-1 transition-colors" />
      </div>
    </div>
  )
}

function GroupsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="card p-5">
          <div className="flex items-center gap-3">
            <div className="skeleton w-10 h-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyGroups({ onCreate, onJoin }: { onCreate: () => void; onJoin: () => void }) {
  return (
    <div className="card p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
        <Users className="w-7 h-7 text-brand-400" />
      </div>
      <h3 className="font-semibold text-gray-800 mb-1">Nenhum grupo ainda</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
        Crie um grupo para começar seu bolão ou entre com o código de um amigo.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button onClick={onJoin} className="btn-outline">
          <Hash className="w-3.5 h-3.5" />
          Entrar com código
        </button>
        <button onClick={onCreate} className="btn-primary">
          <Plus className="w-3.5 h-3.5" />
          Criar grupo
        </button>
      </div>
    </div>
  )
}
