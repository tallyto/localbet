import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useMyGroups, useCreateGroup, useJoinGroup } from '../hooks/useGroups'

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

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Meus Grupos</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowJoin(true); setShowCreate(false); setError('') }}
            className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 text-sm font-medium transition-colors"
          >
            Entrar com código
          </button>
          <button
            onClick={() => { setShowCreate(true); setShowJoin(false); setError('') }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
          >
            Criar grupo
          </button>
        </div>
      </div>

      {(showCreate || showJoin) && (
        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
          {showCreate && (
            <form onSubmit={handleCreate} className="flex gap-3">
              <input
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="Nome do grupo"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                required
              />
              <button type="submit" disabled={createGroup.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60">
                {createGroup.isPending ? 'Criando...' : 'Criar'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm">
                Cancelar
              </button>
            </form>
          )}
          {showJoin && (
            <form onSubmit={handleJoin} className="flex gap-3">
              <input
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Código do grupo (ex: ABC12345)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-mono"
                maxLength={8}
                required
              />
              <button type="submit" disabled={joinGroup.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60">
                {joinGroup.isPending ? 'Entrando...' : 'Entrar'}
              </button>
              <button type="button" onClick={() => setShowJoin(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm">
                Cancelar
              </button>
            </form>
          )}
          {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : groups?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Você ainda não participa de nenhum grupo.</p>
          <p className="text-gray-400 text-sm mt-1">Crie um novo ou entre com um código de convite.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups?.map(group => (
            <GroupCard key={group.id} group={group} onClick={() => navigate(`/groups/${group.id}`)} />
          ))}
        </div>
      )}
    </Layout>
  )
}

function GroupCard({ group, onClick }: { group: { id: string; name: string; inviteCode: string; ownerId: string; createdAt: string }; onClick: () => void }) {
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
      className="cursor-pointer p-5 bg-white rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-sm transition-all"
    >
      <h3 className="font-semibold text-gray-800">{group.name}</h3>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400 font-mono">{group.inviteCode}</span>
        <button
          onClick={copyCode}
          className="text-xs px-2 py-0.5 rounded border border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors"
        >
          {copied ? 'Copiado!' : 'Copiar código'}
        </button>
      </div>
    </div>
  )
}
