import { useState, FormEvent } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const redirect = safeRedirect(searchParams.get('redirect'))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(redirect)
    } catch {
      setError('Email ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Brand panel — decorativo, oculto de leitores de tela */}
      <div aria-hidden="true" className="hidden lg:flex flex-col justify-between w-[420px] bg-brand-700 p-10 flex-shrink-0">
        <Link to="/" tabIndex={-1} className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold">L</span>
          <span className="text-white font-bold text-lg">LocalBet</span>
        </Link>
        <div>
          <p className="text-white/90 text-3xl font-bold leading-tight mb-4">
            Bolão com os amigos,<br />do jeito certo.
          </p>
          <p className="text-white/60 text-sm leading-relaxed">
            Sem banco, sem anúncios. Apenas você e seus amigos apostando nos jogos que mais amam.
          </p>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Bem-vindo de volta</h1>
            <p className="text-gray-500 text-sm mb-8">Entre na sua conta para continuar</p>

            {error && (
              <div role="alert" aria-live="assertive" className="mb-5 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle aria-hidden="true" className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulário de login">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <div aria-hidden="true" className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    id="login-email"
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
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                <div className="relative">
                  <div aria-hidden="true" className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-base pl-9 pr-10"
                    required
                    autoComplete="current-password"
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
                    Entrando...
                  </span>
                ) : 'Entrar'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Não tem conta?{' '}
              <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-brand-600 font-semibold hover:text-brand-700">
                Cadastre-se grátis
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
