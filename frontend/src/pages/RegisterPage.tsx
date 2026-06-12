import { useState, FormEvent } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Eye, EyeOff, User, AlertCircle } from 'lucide-react'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const redirect = safeRedirect(searchParams.get('redirect'))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!acceptedTerms) {
      setError('Você precisa aceitar os termos de uso para continuar.')
      return
    }
    setLoading(true)
    try {
      await register(name, email, password, acceptedTerms)
      navigate(redirect)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Brand panel — decorativo, oculto de leitores de tela */}
      <div aria-hidden="true" className="hidden lg:flex flex-col justify-between w-[420px] bg-brand-700 p-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold">L</span>
          <span className="text-white font-bold text-lg">LocalBet</span>
        </div>
        <div>
          <p className="text-white/90 text-3xl font-bold leading-tight mb-4">
            Crie seu bolão<br />em minutos.
          </p>
          <ul className="space-y-3">
            {[
              'Grupos com código de convite',
              'Campeonatos e rodadas organizadas',
              'Ranking automático com pontuação',
            ].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-white/70 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-white/30 text-xs">© 2026 LocalBet</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <span aria-hidden="true" className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">L</span>
            <span className="font-bold text-gray-900 text-lg">LocalBet</span>
          </Link>

          <main>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Crie sua conta</h1>
            <p className="text-gray-500 text-sm mb-8">Grátis, sem cartão de crédito</p>

            {error && (
              <div role="alert" aria-live="assertive" className="mb-5 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle aria-hidden="true" className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulário de cadastro">
              <div>
                <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1.5">Nome</label>
                <div className="relative">
                  <div aria-hidden="true" className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="input-base pl-9"
                    required
                    minLength={2}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <div aria-hidden="true" className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="input-base pl-9"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                <div className="relative">
                  <div aria-hidden="true" className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="input-base pl-9 pr-10"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff aria-hidden="true" className="w-4 h-4" /> : <Eye aria-hidden="true" className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label htmlFor="register-terms" className="flex items-start gap-3 cursor-pointer">
                <input
                  id="register-terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  Li e aceito os{' '}
                  <Link to="/terms" target="_blank" className="text-brand-600 font-medium hover:text-brand-700 underline underline-offset-2">
                    termos de uso
                  </Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2 py-2.5"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg aria-hidden="true" className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Criando conta...
                  </span>
                ) : 'Criar conta grátis'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Já tem conta?{' '}
              <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-brand-600 font-semibold hover:text-brand-700">
                Entrar
              </Link>
            </p>
          </main>
        </div>
      </div>
    </div>
  )
}

function safeRedirect(value: string | null) {
  if (value && value.startsWith('/') && !value.startsWith('//')) return value
  return '/dashboard'
}
