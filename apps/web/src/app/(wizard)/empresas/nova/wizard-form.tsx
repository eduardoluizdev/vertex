'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyForm } from '@/app/(dashboard)/empresas/_components/company-form';
import { WhatsappStep } from './steps/whatsapp-step';
import { ResendStep } from './steps/resend-step';
import { ProposalTemplateStep } from './steps/proposal-template-step';
import { setSelectedCompany } from '@/app/(dashboard)/_actions/set-selected-company';

type WizardStep = 'COMPANY' | 'WHATSAPP' | 'RESEND' | 'PROPOSAL_TEMPLATE';

const STEP_INFO = {
  COMPANY: {
    title: 'Cadastro da Empresa',
    subtitle: 'Precisamos de alguns dados essenciais para o uso da plataforma.',
  },
  WHATSAPP: {
    title: 'Conectar WhatsApp',
    subtitle: 'Necessário para enviar mensagens e disparos de campanha aos leads.',
  },
  RESEND: {
    title: 'Configurar Email',
    subtitle: 'Permite enviarmos campanhas de e-mail pela sua caixa de saída.',
  },
  PROPOSAL_TEMPLATE: {
    title: 'Mensagem de Proposta',
    subtitle: 'Configure o texto enviado ao cliente quando você disparar uma proposta pelo WhatsApp.',
  },
};

export function WizardForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>('COMPANY');
  const [createdCompanyId, setCreatedCompanyId] = useState<string | null>(null);

  const handleCompanyCreated = async (companyId: string) => {
    setCreatedCompanyId(companyId);
    await setSelectedCompany(companyId, true).catch(console.error);
    setCurrentStep('WHATSAPP');
  };

  const handleWhatsappFinished = () => {
    setCurrentStep('RESEND');
  };

  const handleResendFinished = () => {
    setCurrentStep('PROPOSAL_TEMPLATE');
  };

  const handleProposalTemplateFinished = () => {
    router.push('/dashboard');
    router.refresh();
  };

  const steps: WizardStep[] = ['COMPANY', 'WHATSAPP', 'RESEND', 'PROPOSAL_TEMPLATE'];
  const currentIndex = steps.indexOf(currentStep);
  const info = STEP_INFO[currentStep];

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] overflow-hidden relative">
      
      {/* Top Progress bar and Header */}
      <div className="w-full pt-10 pb-6 flex flex-col items-center">
        <div className="flex items-center gap-12 text-sm text-muted-foreground w-full max-w-xl mx-auto px-6 mb-3">
          <div className="flex-1 flex justify-start">
            {currentIndex > 0 && (
              <button 
                onClick={() => {
                  if (currentStep === 'WHATSAPP') setCurrentStep('COMPANY');
                  if (currentStep === 'RESEND') setCurrentStep('WHATSAPP');
                  if (currentStep === 'PROPOSAL_TEMPLATE') setCurrentStep('RESEND');
                }} 
                className="hover:text-foreground transition-colors"
              >
                &lsaquo; Voltar
              </button>
            )}
          </div>
          <span className="font-mono">{currentIndex + 1} / {steps.length}</span>
          <div className="flex-1" />
        </div>
        
        {/* Progress Line */}
        <div className="w-full max-w-xl mx-auto bg-muted rounded-full h-1 overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-700 ease-in-out" 
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center mt-12 px-6 pb-20 overflow-y-auto">
        <div className="w-full max-w-md animate-in slide-in-from-bottom-8 fade-in duration-700">
          
          <div className="text-center mb-10 space-y-2">
            <h1 className="text-3xl font-normal text-foreground tracking-tight">
              {info.title}
            </h1>
            <p className="text-muted-foreground text-sm">
              {info.subtitle}
            </p>
          </div>

          <div className="transition-all duration-500">
            {currentStep === 'COMPANY' && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <CompanyForm onSuccess={handleCompanyCreated} />
              </div>
            )}

            {currentStep === 'WHATSAPP' && createdCompanyId && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <WhatsappStep 
                  companyId={createdCompanyId} 
                  onSuccess={handleWhatsappFinished} 
                  onSkip={handleWhatsappFinished} 
                />
              </div>
            )}

            {currentStep === 'RESEND' && createdCompanyId && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <ResendStep 
                  companyId={createdCompanyId} 
                  onSuccess={handleResendFinished} 
                  onSkip={handleResendFinished} 
                />
              </div>
            )}

            {currentStep === 'PROPOSAL_TEMPLATE' && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <ProposalTemplateStep
                  onSuccess={handleProposalTemplateFinished}
                  onSkip={handleProposalTemplateFinished}
                />
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
