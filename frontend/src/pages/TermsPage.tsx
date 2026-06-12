import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export function TermsPage() {
  usePageTitle('Termos de Uso')
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav aria-label="Navegação principal" className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <span aria-hidden="true" className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">L</span>
          <span className="font-bold text-gray-900">LocalBet</span>
        </Link>
        <div className="flex gap-3">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            Entrar
          </Link>
          <Link to="/register" className="btn-primary text-sm px-4 py-2">
            Criar conta
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12 prose prose-sm prose-gray">
        <h1 className="text-3xl font-extrabold mb-2">Termos de Uso</h1>
        <p className="text-gray-400 text-sm mb-8">Última atualização: junho de 2026</p>

        <Section title="1. O que é o LocalBet">
          <p>
            O LocalBet é uma plataforma gratuita de bolões entre amigos. Permite que grupos de pessoas criem apostas de placar em partidas esportivas, compitam por pontos e distribuam valores entre si de forma organizada.
          </p>
          <p>
            O LocalBet <strong>não é uma casa de apostas</strong>. Não operamos nem intermediamos apostas financeiras. Qualquer movimentação de dinheiro ocorre exclusivamente entre os próprios participantes do grupo, fora da plataforma.
          </p>
        </Section>

        <Section title="2. Uso da plataforma">
          <ul>
            <li>O acesso é permitido para maiores de 18 anos.</li>
            <li>Cada usuário é responsável pelas informações que fornece ao se cadastrar.</li>
            <li>É proibido usar a plataforma para fins ilegais, spam ou qualquer atividade que prejudique outros usuários.</li>
            <li>Grupos e campeonatos criados são de responsabilidade do administrador do grupo.</li>
          </ul>
        </Section>

        <Section title="3. Valores e premiações">
          <p>
            Os valores apostados e distribuídos entre membros de um grupo são acordos privados entre os participantes. O LocalBet apenas registra e calcula automaticamente as pontuações e distribuições conforme as regras configuradas pelo administrador do grupo.
          </p>
          <p>
            O LocalBet não retém, cobra taxas sobre, nem tem qualquer responsabilidade sobre valores trocados entre participantes.
          </p>
        </Section>

        <Section title="4. Privacidade">
          <p>
            Coletamos apenas as informações necessárias para o funcionamento do serviço: nome, e-mail e dados das apostas dentro dos grupos. Não vendemos dados para terceiros nem exibimos publicidade.
          </p>
          <p>
            Seus dados de aposta são visíveis somente para os membros do mesmo grupo.
          </p>
        </Section>

        <Section title="5. Disponibilidade">
          <p>
            O LocalBet é fornecido "como está", sem garantia de disponibilidade ininterrupta. Podemos interromper, modificar ou encerrar o serviço a qualquer momento, preferencialmente com aviso prévio aos usuários.
          </p>
        </Section>

        <Section title="6. Limitação de responsabilidade">
          <p>
            O LocalBet não se responsabiliza por desentendimentos entre membros de grupos, valores não pagos entre participantes, nem por perdas decorrentes de uso incorreto da plataforma.
          </p>
        </Section>

        <Section title="7. Contato">
          <p>
            Dúvidas, sugestões ou solicitações de exclusão de conta podem ser enviadas para{' '}
            <a href="mailto:contato@localbet.app" className="text-brand-600 hover:underline">contato@localbet.app</a>.
          </p>
        </Section>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <Link to="/" className="text-sm text-brand-600 hover:underline">← Voltar para o início</Link>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-800 mb-3">{title}</h2>
      <div className="text-gray-600 leading-relaxed space-y-2">{children}</div>
    </section>
  )
}
