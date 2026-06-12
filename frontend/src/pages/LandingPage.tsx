import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../api/client'

const SPORTS = ['Futebol', 'Basquete', 'Vôlei', 'Tênis', 'Fórmula 1', 'MMA', 'Qualquer esporte']

interface Stats {
  users: number
  groups: number
  championships: number
  matches: number
}

function usePublicStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data)).catch(() => {})
  }, [])
  return stats
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (value === 0) return
    let start = 0
    const step = Math.ceil(value / 40)
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(start)
    }, 20)
    return () => clearInterval(timer)
  }, [value])
  return <>{display.toLocaleString('pt-BR')}</>
}

export function LandingPage() {
  const stats = usePublicStats()

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="font-bold text-xl text-green-600 tracking-tight">localbet</span>
        <div className="flex gap-3">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            Entrar
          </Link>
          <Link to="/register" className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
            Criar conta
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-green-200">
          Copa do Mundo 2026
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
          Bolão com os amigos,<br />
          <span className="text-green-600">sem banca, sem anúncios.</span>
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-xl mx-auto">
          Aposte nos placares com seu grupo de amigos. O dinheiro fica entre vocês — quem acertar leva.
          Nenhum centavo vai para uma casa de apostas.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm">
            Criar meu bolão agora
          </Link>
          <Link to="/login" className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="border-y border-gray-100 py-10 px-6">
          <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <StatItem value={stats.users} label="usuários" />
            <StatItem value={stats.groups} label="bolões criados" />
            <StatItem value={stats.championships} label="campeonatos" />
            <StatItem value={stats.matches} label="partidas" />
          </div>
        </section>
      )}

      {/* Why section */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">Por que o LocalBet nasceu?</h2>
          <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
            A Copa do Mundo chegou e todo grupo de amigos queria um bolão. As alternativas eram caras, cheias de anúncios ou simplesmente complicadas demais.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <FeatureCard
              icon="🏆"
              title="O dinheiro é de vocês"
              description="Nenhuma taxa oculta, nenhuma banca levando a margem. O prêmio é 100% distribuído entre os participantes do grupo."
            />
            <FeatureCard
              icon="🚫"
              title="Zero anúncios"
              description="Sem banners, sem notificações invasivas, sem patrocínio de casas de apostas. É uma ferramenta para amigos, não uma plataforma comercial."
            />
            <FeatureCard
              icon="🎯"
              title="Placar exato ou proporcional"
              description="Configure as regras: quem acertar o placar exato leva tudo, ou distribua proporcionalmente aos pontos de cada um."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Como funciona</h2>
          <div className="space-y-6">
            <Step n={1} title="Crie um grupo" description="Dê um nome para o bolão e compartilhe o código de convite com seus amigos." />
            <Step n={2} title="Adicione as partidas" description="Configure o campeonato (Copa do Mundo, Série A, NBA…) e cadastre os jogos que vão entrar no bolão." />
            <Step n={3} title="Cada um aposta" description="Cada membro aposta o placar que acha que vai dar. Os palpites ficam ocultos até o jogo terminar." />
            <Step n={4} title="Lançou o placar, calculou" description="O admin do grupo registra o resultado final. O sistema calcula a pontuação e distribui o prêmio automaticamente." />
          </div>
        </div>
      </section>

      {/* Sports */}
      <section className="bg-green-600 py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Funciona para qualquer esporte</h2>
          <p className="text-green-100 mb-8 text-sm">
            Copa do Mundo, Série A, NBA, F1, vôlei de praia — se tem placar, tem bolão.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SPORTS.map(s => (
              <span key={s} className="bg-white/20 text-white text-sm px-3 py-1.5 rounded-full font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-extrabold mb-4">Pronto para o bolão?</h2>
        <p className="text-gray-500 mb-8">Crie sua conta grátis e comece agora.</p>
        <Link to="/register" className="px-8 py-3.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-base">
          Criar conta grátis
        </Link>
      </section>

      <footer className="border-t border-gray-100 py-8 px-6 text-center text-xs text-gray-400">
        <p className="mb-3">localbet — feito para amigos, sem fins lucrativos.</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a
            href="https://www.paypal.com/donate?business=rodrigues.tallyto%40hotmail.com&currency_code=BRL&item_name=LocalBet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.79A.859.859 0 0 1 5.79 2h8.263c2.77 0 4.744.638 5.876 1.898.537.594.882 1.26 1.026 1.978.153.77.13 1.667-.07 2.674l-.007.042c-.595 3.02-2.64 4.556-6.09 4.556H13.2a.859.859 0 0 0-.848.728l-.022.12-.677 4.296-.03.165a.641.641 0 0 1-.633.54H7.076z"/>
              <path d="M20.908 7.32c-.027.17-.058.344-.094.523C19.9 12.01 17.4 13.5 13.5 13.5h-1.288a.641.641 0 0 0-.633.54l-.85 5.387a.429.429 0 0 1-.423.36H8.04a.427.427 0 0 1-.422-.49l.343-2.176.86-5.45.033-.187a.859.859 0 0 1 .848-.728h1.588c3.45 0 5.495-1.536 6.09-4.556.008-.04.015-.082.022-.122a3.566 3.566 0 0 0 3.506.242z"/>
            </svg>
            Apoiar via PayPal
          </a>
          <Link to="/terms" className="hover:text-gray-600 underline">Termos de uso</Link>
        </div>
      </footer>
    </div>
  )
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-3xl font-extrabold text-green-600">
        <AnimatedNumber value={value} />
        {value > 0 && '+'}
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <span className="text-3xl mb-3 block">{icon}</span>
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}

function Step({ n, title, description }: { n: number; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start">
      <span className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
        {n}
      </span>
      <div>
        <p className="font-semibold text-gray-800">{title}</p>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  )
}
