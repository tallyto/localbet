interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  tone?: 'danger' | 'default'
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  tone = 'danger',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!open) return null

  const confirmClass = tone === 'danger'
    ? 'bg-red-600 text-white hover:bg-red-700'
    : 'bg-green-600 text-white hover:bg-green-700'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gray-900/40" onClick={loading ? undefined : onCancel} />
      <div className="relative w-full max-w-sm bg-white rounded-xl border border-gray-200 shadow-xl p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${confirmClass}`}
          >
            {loading ? 'Processando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
