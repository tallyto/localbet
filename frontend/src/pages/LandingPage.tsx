import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Users, Shield, Trophy, Zap, Check, ChevronRight } from 'lucide-react'

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
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">L</span>
            <span className="font-bold text-gray-900">LocalBet</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Entrar
            </Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-12 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-brand-100">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            Copa do Mundo 2026 chegando
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-5">
            Bolão com amigos,<br />
            <span className="text-brand-600">sem complicação.</span>
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
            Aposte nos placares, acompanhe o ranking e distribua o prêmio entre o grupo — sem banca, sem anúncios, sem taxas escondidas.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link to="/register" className="btn-primary px-6 py-3 text-base">
              Criar meu bolão agora
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-outline px-6 py-3 text-base">
              Já tenho conta
            </Link>
          </div>

          <div className="flex items-center gap-5 text-sm text-gray-400">
            {['Gratuito', 'Sem cadastro de cartão', 'Funciona no celular'].map(t => (
              <span key={t} className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* App mockup */}
        <div className="hidden lg:block">
          <AppMockup />
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="border-y border-gray-100 py-10 bg-gray-50">
          <div className="max-w-4xl mx-auto px-5 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            <StatItem value={stats.users} label="jogadores" />
            <StatItem value={stats.groups} label="bolões criados" />
            <StatItem value={stats.championships} label="campeonatos" />
            <StatItem value={stats.matches} label="partidas apostadas" />
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Feito para o seu grupo</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Tudo que você precisa para organizar um bolão justo, transparente e divertido.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              icon={<Shield className="w-5 h-5 text-brand-600" />}
              title="Dinheiro entre vocês"
              description="100% do prêmio vai para o grupo. Nenhuma taxa, nenhuma banca no meio."
            />
            <FeatureCard
              icon={<Trophy className="w-5 h-5 text-brand-600" />}
              title="Ranking automático"
              description="Pontuação calculada na hora que o placar é lançado. Sem planilha, sem briga."
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5 text-brand-600" />}
              title="Campeonatos e rodadas"
              description="Organize por Copa, Série A, rodadas ou qualquer estrutura. Do simples ao avançado."
            />
            <FeatureCard
              icon={<Users className="w-5 h-5 text-brand-600" />}
              title="Convide com um código"
              description="Compartilhe um código de 8 letras. Qualquer um entra no grupo em segundos."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-5 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Como funciona</h2>
            <p className="text-gray-500">Em quatro passos você já está apostando.</p>
          </div>

          <div className="relative">
            <div className="absolute left-5 top-8 bottom-8 w-px bg-brand-100 hidden sm:block" />
            <div className="space-y-8">
              <Step n={1} title="Crie um grupo" description="Dê um nome para o bolão. Um código de convite é gerado automaticamente." />
              <Step n={2} title="Adicione as partidas" description="Cadastre os jogos do campeonato — pode ser Copa do Mundo, Série A, NBA ou qualquer torneio." />
              <Step n={3} title="Cada um aposta o placar" description="Os participantes apostam em qual placar acham que vai dar. Os palpites ficam ocultos até o jogo acabar." />
              <Step n={4} title="Resultado lançado, prêmio calculado" description="O admin registra o placar final. O sistema distribui os pontos e o prêmio automaticamente." />
            </div>
          </div>
        </div>
      </section>

      {/* Sports */}
      <section className="py-20 px-5 bg-brand-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Funciona para qualquer esporte</h2>
          <p className="text-brand-200 mb-8 text-sm leading-relaxed">
            Se tem placar, tem bolão. Copa do Mundo, Brasileirão, NBA, F1, vôlei — você escolhe.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {['Futebol', 'Basquete', 'Vôlei', 'Tênis', 'Fórmula 1', 'MMA', 'Qualquer esporte'].map(s => (
              <span key={s} className="bg-white/15 hover:bg-white/25 text-white text-sm px-4 py-1.5 rounded-full font-medium transition-colors cursor-default border border-white/10">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-5 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
            Seu grupo está esperando.<br />
            <span className="text-brand-600">Começa agora.</span>
          </h2>
          <p className="text-gray-500 mb-8">Gratuito. Sem cartão de crédito. Pronto em 1 minuto.</p>
          <Link to="/register" className="btn-primary px-8 py-3.5 text-base">
            Criar conta grátis
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-brand-600 flex items-center justify-center text-white font-bold text-[10px]">L</span>
            <span>LocalBet — feito para amigos, sem fins lucrativos.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-gray-600 transition-colors">Termos de uso</Link>
            <a
              href="https://www.paypal.com/donate?business=rodrigues.tallyto%40hotmail.com&currency_code=BRL&item_name=LocalBet"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded-md font-semibold transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.79A.859.859 0 0 1 5.79 2h8.263c2.77 0 4.744.638 5.876 1.898.537.594.882 1.26 1.026 1.978.153.77.13 1.667-.07 2.674l-.007.042c-.595 3.02-2.64 4.556-6.09 4.556H13.2a.859.859 0 0 0-.848.728l-.022.12-.677 4.296-.03.165a.641.641 0 0 1-.633.54H7.076z"/>
              </svg>
              Apoiar
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function AppMockup() {
  return (
    <div className="relative select-none">
      <div className="absolute -inset-4 bg-brand-50 rounded-3xl -z-10" />

      {/* Browser chrome */}
      <div className="bg-gray-800 rounded-t-2xl px-3 py-2 flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        <span className="flex-1 bg-gray-700 rounded h-4 ml-2 text-[10px] text-gray-400 flex items-center px-2">
          localbet.com.br
        </span>
      </div>

      {/* App UI */}
      <div className="bg-gray-50 rounded-b-2xl p-3 shadow-2xl">
        {/* Fake nav */}
        <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 shadow-sm mb-3 border border-gray-100">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center">L</span>
            <span className="font-bold text-[11px] text-gray-900">LocalBet</span>
            <span className="text-gray-300 text-[10px]">›</span>
            <span className="text-[10px] text-gray-500">Copa 2026</span>
          </div>
          <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-[9px] font-bold flex items-center justify-center">JD</span>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0.5 mb-3 bg-gray-100 p-0.5 rounded-lg w-fit">
          <span className="bg-white text-gray-900 shadow-sm text-[10px] font-medium px-3 py-1 rounded-md">Partidas</span>
          <span className="text-gray-500 text-[10px] font-medium px-3 py-1">Ranking</span>
        </div>

        {/* Match cards */}
        <div className="space-y-2">
          <MockMatchCard
            home="Brasil" away="Argentina"
            status="Agendada" statusClass="bg-blue-50 text-blue-600"
            date="Sáb 14 jun · 18:00"
            badge={{ text: '2×1', class: 'bg-brand-50 text-brand-700 border border-brand-100' }}
          />
          <MockMatchCard
            home="França" away="Portugal"
            score="2 × 1"
            status="Encerrado" statusClass="bg-gray-100 text-gray-500"
            date="Sex 13 jun · 15:00"
            pts={{ text: '10 pts', class: 'bg-green-50 text-green-700 border-green-200' }}
          />
          <MockMatchCard
            home="Espanha" away="Alemanha"
            status="Ao vivo" statusClass="bg-brand-100 text-brand-700"
            date="Dom 15 jun · 12:00"
          />
        </div>

        {/* Ranking preview */}
        <div className="mt-3 bg-white rounded-xl border border-gray-100 p-2.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Ranking</p>
          <div className="space-y-1.5">
            {[
              { pos: '🥇', name: 'João D.', pts: '37 pts', color: 'text-yellow-600' },
              { pos: '🥈', name: 'Maria S.', pts: '28 pts', color: 'text-gray-500' },
              { pos: '🥉', name: 'Pedro L.', pts: '21 pts', color: 'text-orange-500' },
            ].map(e => (
              <div key={e.name} className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5">
                  <span>{e.pos}</span>
                  <span className="font-medium text-gray-700">{e.name}</span>
                </span>
                <span className={`font-bold ${e.color}`}>{e.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MockMatchCard({
  home, away, score, date, status, statusClass, badge, pts
}: {
  home: string; away: string; score?: string; date: string
  status: string; statusClass: string
  badge?: { text: string; class: string }
  pts?: { text: string; class: string }
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-semibold text-gray-900 truncate">{home}</span>
            <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] flex-shrink-0 ${score ? 'bg-gray-100 text-gray-700 font-mono' : 'bg-gray-100 text-gray-400'}`}>
              {score ?? 'vs'}
            </span>
            <span className="font-semibold text-gray-900 truncate">{away}</span>
          </div>
          <p className="text-[9px] text-gray-400 mt-0.5">{date}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {pts && <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${pts.class}`}>{pts.text}</span>}
          {badge && <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${badge.class}`}>{badge.text}</span>}
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${statusClass}`}>{status}</span>
        </div>
      </div>
    </div>
  )
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-3xl font-extrabold text-brand-600">
        <AnimatedNumber value={value} />+
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}

function Step({ n, title, description }: { n: number; title: string; description: string }) {
  return (
    <div className="flex gap-5 items-start relative">
      <span className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 z-10 shadow-md">
        {n}
      </span>
      <div className="pt-1.5">
        <p className="font-semibold text-gray-900 mb-1">{title}</p>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
