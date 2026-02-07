'use client';

import Link from 'next/link';
import { ArrowRight, Briefcase, Users, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VertexHubLogo } from '@/components/vertexhub-logo';
import { AnimatedBackground } from './animated-background';

export function LandingContent() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <AnimatedBackground />
      
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VertexHubLogo className="w-8 h-8 text-violet-400" />
            <span className="text-xl font-bold text-white">VertexHub</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0">
                Começar Agora
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Logo with glow */}
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-violet-500/50 blur-3xl rounded-full" />
            <VertexHubLogo className="relative w-24 h-24 text-violet-400 mx-auto animate-scale-in" />
          </div>
          
          {/* Title */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-violet-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Gestão Empresarial Inteligente</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                VertexHub
              </span>
              <br />
              <span className="text-4xl md:text-5xl">
                Para Desenvolvedores
              </span>
            </h1>
          </div>
          
          {/* Description */}
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            A plataforma completa de gestão empresarial pensada para desenvolvedores.
            Gerencie empresas, clientes e serviços de forma simples e eficiente.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 text-lg px-8 hover-lift"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                size="lg" 
                variant="outline" 
                className="glass text-white border-white/20 hover:bg-white/10 text-lg px-8"
              >
                Já tenho uma conta
              </Button>
            </Link>
          </div>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-16 max-w-4xl mx-auto">
            <div className="glass-strong rounded-2xl p-6 hover-lift space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Gestão de Empresas</h3>
              <p className="text-gray-400">
                Organize e gerencie múltiplas empresas em um único lugar
              </p>
            </div>
            
            <div className="glass-strong rounded-2xl p-6 hover-lift space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Controle de Clientes</h3>
              <p className="text-gray-400">
                Mantenha registro completo de todos os seus clientes
              </p>
            </div>
            
            <div className="glass-strong rounded-2xl p-6 hover-lift space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Serviços & Analytics</h3>
              <p className="text-gray-400">
                Acompanhe serviços e analise métricas importantes
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 text-center text-gray-500 text-sm">
        <p>© 2026 VertexHub. Plataforma de gestão empresarial.</p>
      </footer>
    </div>
  );
}
