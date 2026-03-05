import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { VertexHubLogo } from '@/components/vertexhub-logo';

export const metadata: Metadata = {
  title: 'Política de Privacidade — VertexHub',
  description: 'Saiba como o VertexHub coleta, usa e protege seus dados pessoais conforme a LGPD.',
};

export default function PrivacidadePage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-white">Política de Privacidade</h1>
          <p className="mt-3 text-sm text-neutral-500">Última atualização: 5 de março de 2025</p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-neutral-400">

          <section>
            <h2 className="text-base font-semibold text-white mb-3">1. Introdução</h2>
            <p>
              O <strong className="text-neutral-200">VertexHub</strong> ("nós", "nosso" ou "Serviço") está comprometido com a
              proteção da privacidade dos seus usuários. Esta Política de Privacidade descreve como coletamos, usamos,
              armazenamos e protegemos suas informações pessoais, em conformidade com a Lei Geral de Proteção de Dados
              (LGPD — Lei nº 13.709/2018) e demais legislações aplicáveis.
            </p>
            <p className="mt-3">
              Ao utilizar nossa plataforma, você concorda com as práticas descritas nesta Política. Caso não concorde, não
              utilize o Serviço.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">2. Dados que Coletamos</h2>
            <p className="mb-3">Coletamos as seguintes categorias de dados:</p>

            <div className="space-y-4">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <h3 className="text-sm font-semibold text-neutral-200 mb-1">Dados de Cadastro</h3>
                <p>Nome, endereço de e-mail e senha (armazenada em formato criptografado) fornecidos no momento do registro.</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <h3 className="text-sm font-semibold text-neutral-200 mb-1">Dados Operacionais</h3>
                <p>Informações inseridas por você na plataforma: cadastros de empresas, clientes, serviços, propostas, campanhas, templates de WhatsApp e leads.</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <h3 className="text-sm font-semibold text-neutral-200 mb-1">Dados de Uso e Navegação</h3>
                <p>Endereço IP, tipo de navegador, páginas acessadas, horários de acesso e dados de diagnóstico, coletados automaticamente para fins de segurança e melhoria do Serviço.</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <h3 className="text-sm font-semibold text-neutral-200 mb-1">Chaves de Integração</h3>
                <p>Tokens e chaves de API de serviços externos (WhatsApp, e-mail, pagamentos) que você configura voluntariamente para habilitar integrações. Esses dados são armazenados de forma segura e utilizados exclusivamente para operar as integrações configuradas.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">3. Finalidade e Base Legal do Tratamento</h2>
            <p className="mb-3">Tratamos seus dados para as seguintes finalidades, com as respectivas bases legais (LGPD, art. 7º):</p>
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li><strong className="text-neutral-300">Prestação do Serviço:</strong> execução de contrato — necessário para fornecer as funcionalidades da plataforma;</li>
              <li><strong className="text-neutral-300">Comunicações transacionais:</strong> execução de contrato — envio de notificações essenciais sobre sua conta;</li>
              <li><strong className="text-neutral-300">Segurança e prevenção a fraudes:</strong> legítimo interesse — proteger a integridade da plataforma e dos usuários;</li>
              <li><strong className="text-neutral-300">Melhoria contínua:</strong> legítimo interesse — análise de uso para aperfeiçoar funcionalidades;</li>
              <li><strong className="text-neutral-300">Cumprimento de obrigações legais:</strong> cumprimento de obrigação legal — atender requisições de autoridades competentes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">4. Compartilhamento de Dados</h2>
            <p className="mb-3">
              Não vendemos seus dados pessoais. Podemos compartilhá-los apenas nas seguintes circunstâncias:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li><strong className="text-neutral-300">Prestadores de serviço:</strong> empresas que nos auxiliam na operação da infraestrutura (hospedagem, banco de dados) sob acordos de confidencialidade;</li>
              <li><strong className="text-neutral-300">Serviços de terceiros integrados:</strong> apenas os dados estritamente necessários para operar as integrações que você habilitou (ex.: WhatsApp, Resend, Asaas, AbacatePay, Google Analytics, Gemini);</li>
              <li><strong className="text-neutral-300">Obrigação legal:</strong> quando exigido por lei, ordem judicial ou autoridade competente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">5. Armazenamento e Segurança</h2>
            <p>
              Seus dados são armazenados em servidores seguros. Adotamos medidas técnicas e organizacionais adequadas para
              proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição, incluindo:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-1 mt-3">
              <li>Transmissão de dados via HTTPS/TLS;</li>
              <li>Senhas armazenadas com hash criptográfico (bcrypt);</li>
              <li>Autenticação via JWT com expiração de sessão;</li>
              <li>Acesso restrito aos dados por controle de função (RBAC).</li>
            </ul>
            <p className="mt-3">
              Apesar de nossos esforços, nenhum método de transmissão pela internet ou armazenamento eletrônico é 100%
              seguro. Em caso de incidente de segurança que afete seus dados, notificaremos você conforme exigido pela LGPD.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">6. Retenção de Dados</h2>
            <p>
              Mantemos seus dados pelo tempo necessário para a prestação do Serviço e cumprimento de obrigações legais.
              Após o encerramento de sua conta, seus dados serão excluídos ou anonimizados em até <strong className="text-neutral-300">90 dias</strong>,
              salvo quando a retenção for exigida por lei ou para defesa em processos judiciais ou administrativos.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">7. Cookies e Tecnologias Similares</h2>
            <p>
              Utilizamos cookies de sessão para manter você autenticado na plataforma. Também podemos usar o Google Analytics
              (quando habilitado pelo administrador) para analisar o tráfego do site, o que pode envolver cookies de
              rastreamento. Você pode configurar seu navegador para recusar cookies, mas isso pode afetar a funcionalidade
              do Serviço.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">8. Seus Direitos como Titular de Dados</h2>
            <p className="mb-3">
              Nos termos da LGPD, você tem os seguintes direitos em relação aos seus dados pessoais:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li><strong className="text-neutral-300">Acesso:</strong> confirmar a existência de tratamento e acessar seus dados;</li>
              <li><strong className="text-neutral-300">Correção:</strong> solicitar a correção de dados incompletos ou desatualizados;</li>
              <li><strong className="text-neutral-300">Anonimização, bloqueio ou eliminação:</strong> de dados desnecessários ou tratados em desconformidade;</li>
              <li><strong className="text-neutral-300">Portabilidade:</strong> receber seus dados em formato estruturado;</li>
              <li><strong className="text-neutral-300">Eliminação:</strong> excluir dados tratados com base em consentimento;</li>
              <li><strong className="text-neutral-300">Revogação do consentimento:</strong> a qualquer momento, para tratamentos baseados nessa base legal;</li>
              <li><strong className="text-neutral-300">Oposição:</strong> opor-se ao tratamento realizado com base em legítimo interesse.</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer desses direitos, entre em contato conosco pelo e-mail disponível na plataforma. Responderemos
              em até 15 dias úteis.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">9. Dados de Menores de Idade</h2>
            <p>
              O Serviço não é destinado a menores de 18 anos. Não coletamos intencionalmente dados pessoais de menores.
              Caso tomemos conhecimento de que coletamos dados de um menor, excluiremos essas informações imediatamente.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">10. Transferência Internacional de Dados</h2>
            <p>
              Alguns serviços de terceiros que utilizamos podem processar dados em servidores localizados fora do Brasil.
              Nesses casos, garantimos que tais transferências ocorram em conformidade com a LGPD e com salvaguardas
              adequadas de proteção de dados.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">11. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política periodicamente. Notificaremos você sobre alterações relevantes por e-mail ou
              por aviso na plataforma. A data da última atualização constará sempre no topo desta página. O uso continuado
              do Serviço após as alterações implica aceitação da nova versão.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">12. Encarregado de Proteção de Dados (DPO)</h2>
            <p>
              Para questões relacionadas ao tratamento de dados pessoais, ao exercício de seus direitos ou a esta Política,
              entre em contato com nosso encarregado pelo e-mail disponível na seção de suporte da plataforma.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-neutral-600">
          <p>© {new Date().getFullYear()} VertexHub. Todos os direitos reservados.</p>
          <Link href="/termos" className="text-amber-500/70 hover:text-amber-500 transition-colors">
            Termos de Uso
          </Link>
        </div>
      </main>
    </div>
  );
}
