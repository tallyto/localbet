import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Shield, Trophy, Check, ChevronRight, Bell, Activity, Share2, CalendarRange } from 'lucide-react'

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
            Ranking, XP, badges e notificações
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-5">
            Bolão com amigos,<br />
            <span className="text-brand-600">agora com jogo.</span>
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
            Crie grupos, convide por link, acompanhe feed, notificações, ranking por período, XP, níveis e conquistas. Tudo sem banca no meio.
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

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            {['Gratuito', 'Sem cartão', 'Convite por link', 'Funciona no celular'].map(t => (
              <span key={t} className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                {t}
              </span>
            ))}
          </div>
        </div>

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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={<Shield className="w-5 h-5 text-brand-600" />}
              title="Dinheiro entre vocês"
              description="100% do prêmio vai para o grupo. Nenhuma taxa, nenhuma banca no meio."
            />
            <FeatureCard
              icon={<Trophy className="w-5 h-5 text-brand-600" />}
              title="Ranking com XP"
              description="Além dos pontos, cada pessoa evolui nível, ganha XP e desbloqueia conquistas."
            />
            <FeatureCard
              icon={<Bell className="w-5 h-5 text-brand-600" />}
              title="Notificações"
              description="O sininho mostra liderança, pódio, badges, placares exatos e novidades do grupo."
            />
            <FeatureCard
              icon={<Activity className="w-5 h-5 text-brand-600" />}
              title="Feed do grupo"
              description="Partidas finalizadas, líderes e conquistas viram uma linha do tempo fácil de acompanhar."
            />
            <FeatureCard
              icon={<CalendarRange className="w-5 h-5 text-brand-600" />}
              title="Ranking por período"
              description="Compare o desempenho geral, dos últimos 7 dias ou dos últimos 30 dias."
            />
            <FeatureCard
              icon={<Share2 className="w-5 h-5 text-brand-600" />}
              title="Convite por link"
              description="Compartilhe um link do grupo. Quem abrir já chega com o código pronto para entrar."
            />
          </div>
        </div>
      </section>

      {/* Origin */}
      <section className="py-20 px-5 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 mb-3">Por que LocalBet?</p>
            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
              Nasceu no localhost. Foi para a rua para aprender com gente jogando de verdade.
            </h2>
          </div>
          <div>
            <p className="text-gray-500 leading-relaxed mb-6">
              LocalBet é um nome com memória de origem: saiu de um ambiente local, foi publicado em produção e passou a medir o que importa fora da teoria. A pergunta não era “será que a ideia é boa?”, era “o que as pessoas fazem quando conseguem criar um bolão em poucos segundos?”.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                ['Baixa fricção', 'Entrar, criar grupo e convidar precisa ser rápido. Se demora, o grupo esfria.'],
                ['Uso real', 'O produto aprende com partidas, convites, rankings e retornos, não só com suposições.'],
                ['Diversão que volta', 'XP, feed, badges e notificações existem para transformar placar em hábito social.'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Como funciona</h2>
            <p className="text-gray-500">Em quatro passos o grupo já tem bolão, ranking e disputa rolando.</p>
          </div>

          <div className="relative">
            <div className="absolute left-5 top-8 bottom-8 w-px bg-brand-100 hidden sm:block" />
            <div className="space-y-8">
              <Step n={1} title="Crie o grupo" description="Dê um nome para o bolão e compartilhe o link de convite com os participantes." />
              <Step n={2} title="Monte campeonatos e partidas" description="Organize jogos avulsos, campeonatos, rodadas e regras de pontuação." />
              <Step n={3} title="Cada pessoa aposta" description="Os palpites ficam ocultos até o jogo acabar, mantendo a disputa justa." />
              <Step n={4} title="O jogo ganha vida" description="Ao lançar o placar, o app atualiza ranking, XP, badges, feed, notificações e prêmio." />
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
            Seu grupo merece mais que uma planilha.<br />
            <span className="text-brand-600">Comece o jogo.</span>
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
          <div className="flex items-center gap-1.5">
            <span className="relative w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
              <Bell className="w-3 h-3" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 text-white text-[7px] leading-3 text-center font-bold">3</span>
            </span>
            <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-[9px] font-bold flex items-center justify-center">JD</span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0.5 mb-3 bg-gray-100 p-0.5 rounded-lg w-fit">
          <span className="text-gray-500 text-[10px] font-medium px-3 py-1">Partidas</span>
          <span className="text-gray-500 text-[10px] font-medium px-3 py-1">Ranking</span>
          <span className="bg-white text-gray-900 shadow-sm text-[10px] font-medium px-3 py-1 rounded-md">Feed</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {[
            ['Jogos', '18'],
            ['Finalizados', '9'],
            ['Abertos', '7'],
            ['Campeonatos', '2'],
          ].map(([label, value]) => (
            <div key={label} className="bg-white rounded-lg border border-gray-100 px-2 py-1.5">
              <p className="text-[7px] uppercase text-gray-400 font-bold">{label}</p>
              <p className="text-[12px] font-extrabold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Ranking preview */}
        <div className="mt-3 bg-white rounded-xl border border-gray-100 p-2.5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Ranking</p>
            <span className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">7 dias</span>
          </div>
          <div className="space-y-2">
            {[
              { pos: '🥇', name: 'João D.', pts: '37 pts', xp: '235 XP', badge: 'Na mosca', color: 'text-yellow-600' },
              { pos: '🥈', name: 'Maria S.', pts: '28 pts', xp: '180 XP', badge: 'Nível 2', color: 'text-gray-500' },
              { pos: '🥉', name: 'Pedro L.', pts: '21 pts', xp: '145 XP', badge: 'Fiel', color: 'text-orange-500' },
            ].map(e => (
              <div key={e.name} className="text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>{e.pos}</span>
                    <span className="font-medium text-gray-700">{e.name}</span>
                  </span>
                  <span className={`font-bold ${e.color}`}>{e.pts}</span>
                </div>
                <div className="ml-5 mt-0.5 flex items-center gap-1.5">
                  <span className="text-[8px] text-gray-400">{e.xp}</span>
                  <span className="text-[8px] bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-1.5 py-0.5">{e.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 bg-white rounded-xl border border-gray-100 p-2.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Feed</p>
          <div className="space-y-2">
            {[
              ['João desbloqueou Mão cirúrgica', '3 placares exatos no grupo.'],
              ['Brasil 2 x 1 Argentina', 'Partida finalizada · Rodada 2'],
              ['Maria entrou no pódio', 'Subiu para o 2º lugar.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-2">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-3 h-3" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[9px] font-semibold text-gray-800 truncate">{title}</span>
                  <span className="block text-[8px] text-gray-400 truncate">{desc}</span>
                </span>
              </div>
            ))}
          </div>
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
