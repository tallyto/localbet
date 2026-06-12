import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import { useDeleteGroup, useMyGroups } from '../hooks/useGroups'
import { Group } from '../types'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { usePageTitle } from '../hooks/usePageTitle'

export function AccountPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [groupError, setGroupError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null)
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null)
  const [showDanger, setShowDanger] = useState(false)
  const { data: groups = [] } = useMyGroups()
  const deleteGroup = useDeleteGroup()

  usePageTitle('Minha conta')
  const confirmWord = user?.name ?? ''
  const canDelete = confirm.trim().toLowerCase() === confirmWord.trim().toLowerCase()
  const ownedGroups = groups.filter(group => group.ownerId === user?.userId)
  const hasOwnedGroups = ownedGroups.length > 0

  async function handleDelete() {
    if (!canDelete || hasOwnedGroups) return
    setLoading(true)
    setError('')
    try {
      await api.delete('/auth/me')
      logout()
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Erro ao excluir conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteGroup() {
    if (!groupToDelete) return
    setDeletingGroupId(groupToDelete.id)
    setGroupError('')
    try {
      await deleteGroup.mutateAsync(groupToDelete.id)
      setGroupToDelete(null)
    } catch (err: any) {
      setGroupError(err.response?.data?.error ?? 'Erro ao excluir grupo. Tente novamente.')
    } finally {
      setDeletingGroupId(null)
    }
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Minha conta</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gerencie suas informações pessoais</p>
        </div>

        {/* User info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Informações</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-400">Nome</p>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">E-mail</p>
              <p className="text-sm font-medium text-gray-800">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-xl border border-red-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-600">Excluir conta</p>
              <p className="text-xs text-gray-400 mt-0.5">Esta ação é permanente e não pode ser desfeita.</p>
            </div>
            {!showDanger && (
              <button
                onClick={() => setShowDanger(true)}
                className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                Excluir conta
              </button>
            )}
          </div>

          {showDanger && (
            <div className="space-y-3 pt-1 border-t border-red-100">
              <p className="text-xs text-gray-600">
                Serão removidos: sua conta, todas as suas apostas e participações em grupos.
                <br />
                <span className="font-semibold text-red-500">Grupos dos quais você é dono precisam ser excluídos antes.</span>
              </p>

              {hasOwnedGroups && (
                <div className="border border-red-100 rounded-lg divide-y divide-red-100 overflow-hidden">
                  <div className="px-3 py-2 bg-red-50">
                    <p className="text-xs font-semibold text-red-600">Grupos que bloqueiam a exclusão</p>
                  </div>
                  {ownedGroups.map(group => (
                    <div key={group.id} className="px-3 py-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{group.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{group.inviteCode}</p>
                      </div>
                      <button
                        onClick={() => setGroupToDelete(group)}
                        disabled={deletingGroupId === group.id}
                        className="shrink-0 text-xs text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {deletingGroupId === group.id ? 'Excluindo...' : 'Excluir grupo'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {groupError && <p className="text-xs text-red-500">{groupError}</p>}

              <div>
                <label htmlFor="confirm-delete" className="text-xs text-gray-500 mb-1 block">
                  Digite seu nome <span className="font-semibold text-gray-700">"{confirmWord}"</span> para confirmar
                </label>
                <input
                  id="confirm-delete"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder={confirmWord}
                  className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={!canDelete || loading || hasOwnedGroups}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Excluindo...' : 'Confirmar exclusão'}
                </button>
                <button
                  onClick={() => { setShowDanger(false); setConfirm(''); setError('') }}
                  className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
        <ConfirmDialog
          open={!!groupToDelete}
          title="Excluir grupo"
          description={`Excluir o grupo "${groupToDelete?.name ?? ''}"? Esta ação também remove apostas, campeonatos e partidas vinculadas a ele.`}
          confirmLabel="Excluir"
          loading={deleteGroup.isPending}
          onConfirm={handleDeleteGroup}
          onCancel={() => setGroupToDelete(null)}
        />
      </div>
    </Layout>
  )
}
