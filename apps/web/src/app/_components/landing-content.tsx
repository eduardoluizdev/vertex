'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  Briefcase, 
  Zap, 
  BrainCircuit, 
  Terminal, 
  Database, 
  CheckCircle2,
  XCircle,
  Target,
  Rocket,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VertexHubLogo } from '@/components/vertexhub-logo';
import { AnimatedBackground } from './animated-background';

export function LandingContent() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#0A0A0A] text-gray-100 antialiased overflow-x-hidden selection:bg-vibe-primary selection:text-black">
      <style dangerouslySetInnerHTML={{__html: `
        .text-gradient {
            background: linear-gradient(to right, #F59E0B, #FBBC05);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .cta-pulse {
            animation: pulse-glow 2s infinite;
        }
        @keyframes pulse-glow {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
      `}} />
      <AnimatedBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <VertexHubLogo className="w-8 h-8 text-vibe-primary" />
            <span className="text-xl font-bold text-white tracking-tight">VertexHub</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden md:flex text-gray-300 hover:text-white hover:bg-white/10 font-semibold border-0">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-vibe-primary hover:bg-vibe-primary/90 text-vibe-bg font-bold px-6 border-0">
                Criar Conta
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-40 pb-20 w-full text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vibe-primary/10 border border-vibe-primary/20 text-vibe-primary text-sm font-semibold mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vibe-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-vibe-primary"></span>
          </span>
          PLATAFORMA ALL-IN-ONE PARA DEVS E AGÊNCIAS
        </div>

        <h1 className="text-4xl md:text-7xl font-extrabold leading-tight mb-8 max-w-5xl mx-auto uppercase tracking-tighter">
          E se você pudesse <span className="text-gradient">centralizar toda sua gestão</span> em um só lugar?
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto mb-12 leading-relaxed">
          <span className="text-white font-bold">Desenvolva sem bloqueios, gerencie sem caos.</span> VertexHub organiza empresas, clientes, integrações e contratos enquanto você foca no código.
        </p>

        <div className="flex flex-col items-center gap-6">
          <Link href="/register">
            <Button 
              size="lg" 
              className="bg-vibe-primary hover:bg-vibe-primary/90 text-vibe-bg font-extrabold py-8 px-10 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cta-pulse border-0"
            >
              <Zap className="w-6 h-6" />
              COMEÇAR O MEU HUB AGORA
            </Button>
          </Link>

          <div className="flex flex-wrap justify-center items-center gap-6 text-gray-400 text-sm font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-vibe-primary shrink-0" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-vibe-primary shrink-0" />
              <span>Setup em 2 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-vibe-primary shrink-0" />
              <span>Uso Imediato</span>
            </div>
          </div>
        </div>
      </main>
      
      {/* O Jeito Antigo vs VertexHub Section */}
      <section className="relative z-10 bg-[#0F0F0F] border-y border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white leading-tight">
                Gestão fragmentada não é <br/>
                <span className="text-vibe-primary">apenas ruim, custa clientes.</span>
              </h2>
              <div className="space-y-6 text-gray-400 text-lg">
                <div className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center text-red-500">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <p><span className="text-white font-bold">Planilhas caóticas:</span> Caçar dados do cliente espalhados por drives e mensagens.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center text-red-500">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <p><span className="text-white font-bold">Comunicação descentralizada:</span> Usar o WhatsApp pessoal para enviar relatórios empresariais.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center text-red-500">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <p><span className="text-white font-bold">Configuração repetitiva:</span> Copiar chaves de API, e-mails SMTP para cada novo cliente do zero.</p>
                </div>
                <hr className="border-white/5 my-4" />
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 shrink-0 bg-vibe-primary/10 border border-vibe-primary/20 rounded-xl flex items-center justify-center text-vibe-primary">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <p className="text-xl text-white font-bold leading-relaxed">
                    VertexHub: Você desenvolve o produto,<br/> a gente orquestra o cliente.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-vibe-primary p-1 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)]">
              <div className="bg-[#0A0A0A] p-8 md:p-12 rounded-[1.4rem]">
                <p className="text-2xl md:text-3xl font-black text-white leading-tight text-center md:text-left">
                  Transforme seu fluxo de trabalho no <span className="text-vibe-primary">jeito profissional</span> de entregar valor aos seus clientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto w-full text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-16 tracking-tighter uppercase italic leading-tight">
          <span className="text-vibe-primary">DOMINE</span> AS FERRAMENTAS QUE VÃO <br/>
          <span className="text-vibe-primary">ELEVAR O PADRÃO</span> DOS SEUS SERVIÇOS
        </h2>

        <div className="grid md:grid-cols-2 gap-8 text-left">
          <div className="p-8 bg-[#121212] border border-white/5 rounded-[2rem] hover:border-vibe-primary/40 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-vibe-primary/10 rounded-xl text-vibe-primary group-hover:scale-110 transition-transform">
                <Briefcase className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white">CRM Multi-Empresa</h3>
                <p className="text-vibe-primary font-bold text-sm uppercase tracking-widest mt-1">Isolamento Completo</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Esqueça misturar dados de diferentes empreendimentos. <span className="text-white font-bold">Cada empresa é um ecossistema.</span>
            </p>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-vibe-primary shrink-0 mt-0.5" />
                <span>Gestão isolada de clientes e serviços</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-vibe-primary shrink-0 mt-0.5" />
                <span>Dashboard de métricas individualizado</span>
              </li>
            </ul>
          </div>

          <div className="p-8 bg-[#121212] border border-white/5 rounded-[2rem] hover:border-vibe-primary/40 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-vibe-primary/10 rounded-xl text-vibe-primary group-hover:scale-110 transition-transform">
                <Database className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white">Integrações Nativas</h3>
                <p className="text-vibe-primary font-bold text-sm uppercase tracking-widest mt-1">O Cérebro da Comunicação</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Conectado ao núcleo do seu negócio. <span className="text-white font-bold">Comunique-se em tempo real:</span>
            </p>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-vibe-primary shrink-0 mt-0.5" />
                <span>Disparo de mensagens via WhatsApp integrado</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-vibe-primary shrink-0 mt-0.5" />
                <span>Integrações prontas de E-mail via Resend</span>
              </li>
            </ul>
          </div>

          <div className="p-8 bg-[#121212] border border-white/5 rounded-[2rem] hover:border-vibe-primary/40 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-vibe-primary/10 rounded-xl text-vibe-primary group-hover:scale-110 transition-transform">
                <Terminal className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white">Propostas e Contratos</h3>
                <p className="text-vibe-primary font-bold text-sm uppercase tracking-widest mt-1">Workflow Oficial</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Profissionalize seu fechamento de negócios. <span className="text-white font-bold">Do lead à assinatura:</span>
            </p>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-vibe-primary shrink-0 mt-0.5" />
                <span>Geração de domínios customizados integrados ao Easypanel</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-vibe-primary shrink-0 mt-0.5" />
                <span>Acompanhamento digital de aceite e contratos</span>
              </li>
            </ul>
          </div>

          <div className="p-8 bg-[#121212] border border-white/5 rounded-[2rem] hover:border-vibe-primary/40 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-vibe-primary/10 rounded-xl text-vibe-primary group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white">Métricas Acionáveis</h3>
                <p className="text-vibe-primary font-bold text-sm uppercase tracking-widest mt-1">Dashboard em Tempo Real</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Não seja cego com seu próprio crescimento. <span className="text-white font-bold">Saiba onde focar:</span>
            </p>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-vibe-primary shrink-0 mt-0.5" />
                <span>Relatórios visuais de faturamento e serviços ativos</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-vibe-primary shrink-0 mt-0.5" />
                <span>Histórico completo por cliente e ciclo analítico</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Red vs Green Section */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-red-500/5 border border-red-500/20 p-10 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-red-500/10 group-hover:text-red-500/20 transition-colors">
              <Rocket className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-red-500 mb-6">POR QUE VOCÊ ESTÁ ESTAGNADO</h3>
              <p className="text-lg font-bold text-gray-400 mb-8">Você já tentou organizar seu hub de serviços e travou porque:</p>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3 text-gray-500 font-medium">
                  <XCircle className="w-6 h-6 text-red-500/50 shrink-0 mt-0.5" />
                  Perde horas cobrando informações de clientes no 1x1
                </li>
                <li className="flex gap-3 text-gray-500 font-medium">
                  <XCircle className="w-6 h-6 text-red-500/50 shrink-0 mt-0.5" />
                  Mistura faturamento de diferentes projetos e perde o controle
                </li>
                <li className="flex gap-3 text-gray-500 font-medium">
                  <XCircle className="w-6 h-6 text-red-500/50 shrink-0 mt-0.5" />
                  Sistemas atuais cobram por assento ou são complexos demais
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 p-10 rounded-[2.5rem] relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
              <Target className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-emerald-500 mb-6">COMO O VERTEXHUB MUDA O JOGO</h3>
              <p className="text-lg font-bold text-gray-300 mb-8 italic">Organização silenciosa. Ação cirúrgica.</p>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3 text-gray-300 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  Fluxo aprovado: cliente entra, assina proposta, sistema notifica
                </li>
                <li className="flex gap-3 text-gray-300 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  Visão macro de caixa e status de projetos na tela principal
                </li>
                <li className="flex gap-3 text-gray-300 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  Feito para o ecossistema moderno: integra domínios e mensageiros nativamente
                </li>
              </ul>
              <div className="text-xl font-black text-white italic leading-tight mt-6 pt-6 border-t border-emerald-500/10">
                Resultado: <span className="text-vibe-primary">Você entrega muito mais valor sem perder o controle.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Immersive CTA */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto w-full text-center">
        <div className="max-w-4xl mx-auto bg-vibe-primary text-black p-12 md:p-16 rounded-[3rem] shadow-[0_0_80px_rgba(245,158,11,0.25)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-black mb-6 uppercase tracking-tighter">
              AUMENTE SEU FATURAMENTO, <br/> REDUZA SEU CAOS
            </h2>
            <p className="text-black/80 font-bold text-lg md:text-xl mb-10 max-w-2xl">
              Pare de gerir clientes de forma amadora. Tenha um sistema próprio, escalável e pronto para o crescimento explosivo da sua empresa.
            </p>
            
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-black text-white hover:bg-gray-900 font-extrabold py-8 px-12 rounded-2xl text-xl transition-transform transform hover:scale-105 active:scale-95 shadow-xl border-0 flex items-center gap-3"
              >
                CRIAR MINHA CONTA GRATUITA <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
              <span className="flex items-center gap-2 text-sm font-bold text-black/70">
                <CheckCircle2 className="w-5 h-5" /> Gestão Multi-empresa
              </span>
              <span className="flex items-center gap-2 text-sm font-bold text-black/70">
                <CheckCircle2 className="w-5 h-5" /> Suporte a WhatsApp Nativo
              </span>
              <span className="flex items-center gap-2 text-sm font-bold text-black/70">
                <CheckCircle2 className="w-5 h-5" /> Contratos Digitais
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#0A0A0A] py-8 text-center text-gray-600 text-sm font-medium">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-4">
          <VertexHubLogo className="w-6 h-6 text-gray-700 hover:text-vibe-primary transition-colors" />
          <p>© {new Date().getFullYear()} VertexHub. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
