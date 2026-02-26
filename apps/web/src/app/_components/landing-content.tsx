'use client';

import Link from 'next/link';
import { 
  Check,
  X,
  Search,
  Code,
  Rocket,
  Users,
  Megaphone,
  Wrench,
  ChevronDown,
  Briefcase,
  Database,
  Terminal,
  TrendingUp,
  LayoutDashboard,
  Zap,
  Calendar,
  Clock,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VertexHubLogo } from '@/components/vertexhub-logo';
import { useState } from 'react';

// FAQ Item component to handle state
function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`not-last:border-b rounded-xl border border-white/5 bg-white/[0.02] px-5 transition-colors ${isOpen ? 'border-white/10 bg-white/[0.04]' : ''}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-sm font-medium text-neutral-200 hover:text-white outline-none"
      >
        {question}
        <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-5 text-sm text-neutral-400 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export function LandingContent() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans antialiased text-neutral-300 selection:bg-vibe-primary selection:text-black">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full transition-all duration-300 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white transition-opacity hover:opacity-80">
            <VertexHubLogo className="w-5 h-5 text-vibe-primary" />
            <span className="hidden md:block">VertexHub Plataforma</span>
            <span className="block md:hidden">VertexHub</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <a href="#o-que-e" className="rounded-md px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-white">O que é</a>
            <a href="#funcionalidades" className="rounded-md px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-white">Funcionalidades</a>
            <a href="#pra-quem" className="rounded-md px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-white">Pra quem</a>
            <a href="#faq" className="rounded-md px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-white">FAQ</a>
          </nav>
          <div className="flex gap-2">
            <Link href="/login">
              <Button size="sm" variant="ghost" className="h-8 rounded-lg px-4 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 hidden sm:inline-flex">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="h-8 rounded-lg px-4 text-xs font-semibold bg-vibe-primary text-black hover:bg-vibe-primary/90">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pt-14">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.15),transparent)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(245,158,11,0.08),transparent)]"></div>
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '64px 64px' }}></div>
            <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-vibe-primary/10 blur-[120px]"></div>
          </div>
          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 z-10">
            <div>
              <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-neutral-300 mb-6 group cursor-default">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 bg-vibe-primary"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-vibe-primary"></span>
                </span>
                <span className="group-hover:text-white transition-colors">Acesso Antecipado Gratuito</span>
              </span>
            </div>
            <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
              Gestão inteligente para <br />
              <span className="bg-gradient-to-r from-vibe-primary to-amber-300 bg-clip-text text-transparent">Agências e Devs</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-neutral-400 sm:text-lg">
              VertexHub centraliza empresas, clientes, integrações e propostas em um único lugar. Pare de usar planilhas e comece a escalar.
            </p>
            
            <div className="mt-8 flex flex-col items-center gap-4">
              <Link href="/register">
                <Button className="h-12 rounded-xl bg-vibe-primary px-8 text-sm font-black text-black shadow-[0_0_24px_rgba(245,158,11,0.25)] transition-all hover:brightness-110 hover:shadow-[0_0_32px_rgba(245,158,11,0.35)] hover:scale-105 active:scale-95">
                  Começar gratuitamente
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* O que é */}
        <section id="o-que-e" className="relative py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-vibe-primary">Por que existimos</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Software focado na sua operação.</h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-400 sm:text-base">Esqueça a dor de gerenciar clientes pelo WhatsApp misturado ao Trello. O VertexHub organiza sua operação B2B com clareza.</p>
            </div>
            <div className="mt-10 grid gap-4">
              <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-colors hover:border-white/10 hover:bg-white/[0.04]">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-vibe-primary/15 text-vibe-primary">
                  <Check className="size-3" />
                </span>
                <span className="text-sm text-neutral-300 leading-relaxed"><strong className="text-white">Isolamento Multi-empresa:</strong> Navegue entre múltiplos projetos e mantenha clientes, serviços e dashboards completamente separados.</span>
              </div>
              <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-colors hover:border-white/10 hover:bg-white/[0.04]">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-vibe-primary/15 text-vibe-primary">
                  <Check className="size-3" />
                </span>
                <span className="text-sm text-neutral-300 leading-relaxed"><strong className="text-white">Propostas integradas ao Servidor:</strong> Gere domínios no Easypanel e publique propostas linkadas em questão de segundos.</span>
              </div>
              <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-colors hover:border-white/10 hover:bg-white/[0.04]">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-vibe-primary/15 text-vibe-primary">
                  <Check className="size-3" />
                </span>
                <span className="text-sm text-neutral-300 leading-relaxed"><strong className="text-white">Motor de Integrações Nativas:</strong> Plugue sua Evolution API (WhatsApp) e Resend (Email) para interações imersivas.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Funcionalidades */}
        <section id="funcionalidades" className="relative py-24">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(245,158,11,0.06),transparent)]"></div>
          </div>
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-vibe-primary">O que entregamos</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Tudo em um só lugar</h2>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-neutral-400 sm:text-base">Módulos precisos pensados em desenvolvedores e agências de software.</p>
            </div>
            
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col h-full rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(245,158,11,0.05)] group">
                <span className="flex size-10 items-center justify-center rounded-lg bg-vibe-primary/10 text-vibe-primary transition-colors group-hover:bg-vibe-primary/15 mb-4">
                  <Briefcase className="size-5" />
                </span>
                <h3 className="text-sm font-semibold text-white mb-2">Multitenancy App</h3>
                <p className="text-xs leading-relaxed text-neutral-400">Atenda vários projetos com a mesma conta, troque de empresa e isole configs de webhook ou tokens.</p>
              </div>
              
              <div className="flex flex-col h-full rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(245,158,11,0.05)] group">
                <span className="flex size-10 items-center justify-center rounded-lg bg-vibe-primary/10 text-vibe-primary transition-colors group-hover:bg-vibe-primary/15 mb-4">
                  <Terminal className="size-5" />
                </span>
                <h3 className="text-sm font-semibold text-white mb-2">Contratos & Easypanel</h3>
                <p className="text-xs leading-relaxed text-neutral-400">Lance um domínio pelo seu próprio painel web via API Easypanel e envie um link ativo da proposta.</p>
              </div>

              <div className="flex flex-col h-full rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(245,158,11,0.05)] group">
                <span className="flex size-10 items-center justify-center rounded-lg bg-vibe-primary/10 text-vibe-primary transition-colors group-hover:bg-vibe-primary/15 mb-4">
                  <Database className="size-5" />
                </span>
                <h3 className="text-sm font-semibold text-white mb-2">Engenharia de Notificações</h3>
                <p className="text-xs leading-relaxed text-neutral-400">Módulos oficiais para comunicação via mensageiros. Você foca no Lead, nós mantemos a infraestrutura conectada.</p>
              </div>

              <div className="flex flex-col h-full rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(245,158,11,0.05)] group">
                <span className="flex size-10 items-center justify-center rounded-lg bg-vibe-primary/10 text-vibe-primary transition-colors group-hover:bg-vibe-primary/15 mb-4">
                  <TrendingUp className="size-5" />
                </span>
                <h3 className="text-sm font-semibold text-white mb-2">Métricas On-Time</h3>
                <p className="text-xs leading-relaxed text-neutral-400">Gráficos vitais baseados nos seus serviços fechados ou em funil de vendas abertos em cada empresa ativa.</p>
              </div>

              <div className="flex flex-col h-full rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(245,158,11,0.05)] group">
                <span className="flex size-10 items-center justify-center rounded-lg bg-vibe-primary/10 text-vibe-primary transition-colors group-hover:bg-vibe-primary/15 mb-4">
                  <Users className="size-5" />
                </span>
                <h3 className="text-sm font-semibold text-white mb-2">Relatórios Avançados</h3>
                <p className="text-xs leading-relaxed text-neutral-400">Entenda de onde vieram seus Leads mais lucrativos e saiba precisamente como o negócio transaciona fluxo.</p>
              </div>

              <div className="flex flex-col h-full rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(245,158,11,0.05)] group">
                <span className="flex size-10 items-center justify-center rounded-lg bg-vibe-primary/10 text-vibe-primary transition-colors group-hover:bg-vibe-primary/15 mb-4">
                  <Rocket className="size-5" />
                </span>
                <h3 className="text-sm font-semibold text-white mb-2">Disparos Estratégicos</h3>
                <p className="text-xs leading-relaxed text-neutral-400">Monte réguas de mensagens de WhatsApp direto pelo portal para aquecer leads B2B e alavancar conversões.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pra quem é */}
        <section id="pra-quem" className="relative py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-vibe-primary">Diagnóstico</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Esse hub é (e não é) para você?</h2>
            </div>
            
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
                <h3 className="flex items-center gap-3 text-sm font-semibold text-emerald-400">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                    <Check className="size-4" />
                  </span>
                  É focado em você se...
                </h3>
                <ul className="mt-6 grid gap-4">
                  <li className="flex items-start gap-3 text-sm text-neutral-300">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500/70" />
                    Você possui Agência (Web/Design/Tráfego) e múltiplos clientes pontuais
                  </li>
                  <li className="flex items-start gap-3 text-sm text-neutral-300">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500/70" />
                    Fica exausto gerando PDFs no Canva a cada negociação aberta
                  </li>
                  <li className="flex items-start gap-3 text-sm text-neutral-300">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500/70" />
                    Misturava cobrança e histórico operacional no WhatsApp pessoal
                  </li>
                  <li className="flex items-start gap-3 text-sm text-neutral-300">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500/70" />
                    Você prefere softwares diretos, limpos e otimizados fáceis de ler
                  </li>
                </ul>
              </div>
              
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
                <h3 className="flex items-center gap-3 text-sm font-semibold text-red-400">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-500/15">
                    <X className="size-4" />
                  </span>
                  Não foi feito pra você se...
                </h3>
                <ul className="mt-6 grid gap-4">
                  <li className="flex items-start gap-3 text-sm text-neutral-300">
                    <X className="mt-0.5 size-4 shrink-0 text-red-500/70" />
                    Sua empresa é varejo puramente físico (ex: padarias, farmácias)
                  </li>
                  <li className="flex items-start gap-3 text-sm text-neutral-300">
                    <X className="mt-0.5 size-4 shrink-0 text-red-500/70" />
                    Você precisa de recursos de integração fiscal e emissão de NFe contábil bruta
                  </li>
                  <li className="flex items-start gap-3 text-sm text-neutral-300">
                    <X className="mt-0.5 size-4 shrink-0 text-red-500/70" />
                    Sua operação foca unicamente em SPAM B2C de atacado com milhões de contatos
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Custo Zero - Details */}
        <section className="relative py-24">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(245,158,11,0.06),transparent)]"></div>
          </div>
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-vibe-primary">Detalhes</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Por que R$ 0,00?</h2>
            </div>
            
            <div className="mt-12 rounded-xl border border-white/5 bg-white/[0.02] p-6 sm:p-10">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="flex-1 space-y-4 text-neutral-300 text-sm leading-relaxed">
                  <p>
                    A plataforma nasceu de uma necessidade íntima: gerir agências de serviços digitais e desenvolvimento de software não precisava ser um remendo de planilhas.
                  </p>
                  <p>
                    Nesta <strong>Fase BETA Pública</strong>, estamos modelando a experiência focada em você. Contribuindo com seu uso ativo e sugestões de funcionalidade, isentamos seu custo de servidor durante todo o período primário.
                  </p>
                  <p>
                    Sem "pegadinhas", sem travas. Tudo (CRM, Propostas, Integrações e Campanhas) liberado para o seu workflow brilhar de forma consistente.
                  </p>
                </div>
                
                <div className="w-full md:w-[320px] rounded-xl border border-white/10 bg-black/40 p-6 text-center shadow-[0_0_30px_rgba(245,158,11,0.05)]">
                  <div className="inline-flex size-12 items-center justify-center rounded-xl bg-vibe-primary/10 text-vibe-primary mb-4">
                    <Zap className="size-6" />
                  </div>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Acesso Ilimitado</p>
                  <p className="text-4xl font-extrabold text-white mb-2">Grátis</p>
                  <p className="text-xs text-neutral-400 mb-6">Em período de Early Access</p>
                  
                  <Link href="/register">
                    <Button className="w-full h-10 font-bold bg-vibe-primary text-black hover:bg-vibe-primary/90">
                      Garantir Acesso
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="relative py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-vibe-primary">FAQ</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Perguntas frequentes</h2>
            </div>
            
            <div className="mt-10 grid gap-2">
              <FaqItem 
                question="Posso usar domínios de clientes para enviar as propostas?" 
                answer="Sim, a infraestrutura da VertexHub interage com IPs e configurações DNS para possibilitar mapeamento de nomes, criando subdomínios vinculados diretamente pela API." 
              />
              <FaqItem 
                question="Quais serviços eu preciso para o Módulo WhatsApp rodar?" 
                answer="Basta configurar o endereço da API e apiKey da sua própria instância de Evolution API cadastrada na internet. Nós conectaremos nossos webhooks na sua API provendo os dados no Dashboard." 
              />
              <FaqItem 
                question="Como são criadas as campanhas de notificação?" 
                answer="São workflows focados. Você escolhe seu contato/empresa-alvo, define as réguas de mensagens desejadas e o sistema se encarregará na fila do disparo programático da campanha." 
              />
              <FaqItem 
                question="Posso ter minha equipe toda conectada no hub?" 
                answer="Por enquanto o workspace principal trabalha em modo 'Solo-Owner'. No futuro estendemos papéis granulares de ACL (Permissões de Membro) direto no sistema de permissões." 
              />
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="relative py-32 border-t border-white/5 bg-white/[0.01]">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Pronto para a nova gestão?</h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-neutral-400 sm:text-base">Mudo o paradigma da sua agência hoje, do zero ao Pro sem burocracia.</p>
            <Link href="/register">
              <Button className="mt-8 h-12 rounded-xl bg-vibe-primary px-10 text-sm font-black text-black shadow-[0_0_24px_rgba(245,158,11,0.25)] transition-all hover:brightness-110 hover:shadow-[0_0_32px_rgba(245,158,11,0.35)] hover:scale-105 active:scale-95">
                Reservar Meu Acesso Grátis
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0A0A0A] py-14 text-neutral-400">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 text-sm lg:flex-row lg:px-6">
          <div className="flex flex-col items-center gap-5 lg:items-start text-center lg:text-left">
            <div className="flex items-center gap-2">
              <VertexHubLogo className="size-5 text-vibe-primary" />
              <span className="text-md font-bold text-white">VertexHub</span>
            </div>
            <span className="max-w-xs">
              SaaS de gestão empresarial inteligente focada para devs freelances e agências digitais.
            </span>
            <span className="text-xs text-neutral-500">Copyright © {new Date().getFullYear()} - Todos os direitos reservados.</span>
          </div>
          
          <div className="flex flex-col gap-3 lg:ml-auto items-center lg:items-start">
            <span className="text-neutral-500 uppercase text-xs font-semibold tracking-wider mb-1">Acesso</span>
            <Link href="/login" className="transition-colors hover:text-white">Fazer Login</Link>
            <Link href="/register" className="transition-colors hover:text-white">Criar Nova Conta</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
