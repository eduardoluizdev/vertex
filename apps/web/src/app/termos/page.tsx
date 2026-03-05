import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { VertexHubLogo } from '@/components/vertexhub-logo';

export const metadata: Metadata = {
  title: 'Termos de Uso — VertexHub',
  description: 'Leia os Termos de Uso da plataforma VertexHub.',
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-300 antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white transition-opacity hover:opacity-80">
            <VertexHubLogo />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Voltar ao início
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="mb-10">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-500 mb-2">Legal</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Termos de Uso</h1>
          <p className="mt-3 text-sm text-neutral-500">Última atualização: 5 de março de 2025</p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-neutral-400">

          <section>
            <h2 className="text-base font-semibold text-white mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar ou utilizar a plataforma <strong className="text-neutral-200">VertexHub</strong> ("Serviço"), você
              concorda em ficar vinculado a estes Termos de Uso ("Termos"). Se você não concordar com qualquer parte dos Termos,
              não deverá utilizar o Serviço. Estes Termos se aplicam a todos os usuários, visitantes e qualquer outra pessoa que
              acesse ou use o Serviço.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">2. Descrição do Serviço</h2>
            <p>
              O VertexHub é uma plataforma SaaS (<em>Software as a Service</em>) destinada a agências de software e
              desenvolvedores. Oferece funcionalidades de gestão multiempresa, controle de clientes e serviços, criação e envio
              de propostas comerciais, campanhas de comunicação via WhatsApp e e-mail, captura de leads e integrações com
              serviços de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">3. Cadastro e Conta</h2>
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li>Para utilizar o Serviço, você deve criar uma conta fornecendo informações verídicas e completas.</li>
              <li>Você é responsável por manter a confidencialidade de suas credenciais de acesso.</li>
              <li>Você é responsável por todas as atividades realizadas em sua conta.</li>
              <li>Notifique-nos imediatamente sobre qualquer uso não autorizado de sua conta.</li>
              <li>Não é permitido criar contas para fins fraudulentos, de spam ou em desacordo com estes Termos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">4. Uso Aceitável</h2>
            <p className="mb-3">Ao utilizar o Serviço, você concorda em NÃO:</p>
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li>Violar quaisquer leis ou regulamentos aplicáveis, incluindo a LGPD;</li>
              <li>Enviar comunicações não solicitadas (spam) ou mensagens em massa sem o consentimento dos destinatários;</li>
              <li>Tentar acessar sistemas, dados ou redes não autorizados;</li>
              <li>Utilizar o Serviço para armazenar, transmitir ou distribuir conteúdo ilegal, difamatório ou prejudicial;</li>
              <li>Realizar engenharia reversa, descompilar ou tentar extrair o código-fonte da plataforma;</li>
              <li>Revender, sublicenciar ou transferir o acesso ao Serviço a terceiros sem autorização expressa.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">5. Integrações com Terceiros</h2>
            <p>
              O VertexHub permite a integração com serviços de terceiros, como Evolution API (WhatsApp), Resend (e-mail),
              Asaas, AbacatePay, Google Analytics e Google Gemini. Ao utilizar tais integrações, você também fica sujeito
              aos termos e políticas de privacidade de cada serviço. O VertexHub não se responsabiliza pela disponibilidade
              ou pelo funcionamento desses serviços externos.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">6. Propriedade Intelectual</h2>
            <p>
              O Serviço e seu conteúdo original, funcionalidades e recursos são propriedade do VertexHub e estão protegidos
              por leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual. Você não adquire
              nenhum direito de propriedade sobre o Serviço ou seu conteúdo ao utilizá-lo.
            </p>
            <p className="mt-3">
              Os dados inseridos por você na plataforma (cadastros de empresas, clientes, propostas, etc.) permanecem de sua
              propriedade. Ao utilizar o Serviço, você nos concede licença limitada para armazenar e processar esses dados
              exclusivamente para a finalidade de prestação do Serviço.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">7. Disponibilidade e Suporte</h2>
            <p>
              Empenhamos esforços razoáveis para manter o Serviço disponível, mas não garantimos disponibilidade ininterrupta.
              Podemos realizar manutenções programadas ou emergenciais, com ou sem aviso prévio. Não nos responsabilizamos por
              perdas decorrentes de indisponibilidades temporárias do Serviço.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">8. Limitação de Responsabilidade</h2>
            <p>
              Na máxima extensão permitida pela lei aplicável, o VertexHub não será responsável por danos indiretos, incidentais,
              especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, perda de dados ou interrupção
              de negócios, decorrentes do uso ou da impossibilidade de uso do Serviço.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">9. Modificações dos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes Termos a qualquer momento. Quando forem feitas alterações relevantes,
              notificaremos você por e-mail ou por aviso em destaque na plataforma. O uso continuado do Serviço após as
              modificações constitui aceitação dos novos Termos.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">10. Rescisão</h2>
            <p>
              Podemos suspender ou encerrar sua conta imediatamente, sem aviso prévio, caso você viole estes Termos. Você
              pode encerrar sua conta a qualquer momento acessando as configurações da plataforma ou entrando em contato
              conosco. Após o encerramento, seus dados poderão ser excluídos conforme descrito em nossa Política de
              Privacidade.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">11. Lei Aplicável e Foro</h2>
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de domicílio
              do VertexHub para dirimir quaisquer controvérsias decorrentes destes Termos, com renúncia expressa a qualquer
              outro, por mais privilegiado que seja.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">12. Contato</h2>
            <p>
              Em caso de dúvidas sobre estes Termos, entre em contato com nossa equipe pelo e-mail disponível na plataforma
              ou pela seção de suporte do site.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-neutral-600">
          <p>© {new Date().getFullYear()} VertexHub. Todos os direitos reservados.</p>
          <Link href="/privacidade" className="text-amber-500/70 hover:text-amber-500 transition-colors">
            Política de Privacidade
          </Link>
        </div>
      </main>
    </div>
  );
}
