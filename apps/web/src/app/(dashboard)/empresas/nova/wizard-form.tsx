'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyForm } from '../_components/company-form';
import { WhatsappStep } from './steps/whatsapp-step';
import { ResendStep } from './steps/resend-step';
import { setSelectedCompany } from '@/app/(dashboard)/_actions/set-selected-company';

type WizardStep = 'COMPANY' | 'WHATSAPP' | 'RESEND';

export function WizardForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>('COMPANY');
  const [createdCompanyId, setCreatedCompanyId] = useState<string | null>(null);

  const handleCompanyCreated = async (companyId: string) => {
    setCreatedCompanyId(companyId);
    // Try to set the selected company cookie so the sidebar/layout picks it up
    await setSelectedCompany(companyId).catch(console.error);
    setCurrentStep('WHATSAPP');
  };

  const handleWhatsappFinished = () => {
    setCurrentStep('RESEND');
  };

  const handleResendFinished = () => {
    // When everything is done, refresh and go to dashboard
    router.push('/dashboard');
    router.refresh();
  };

  // Progress UI
  const steps = [
    { id: 'COMPANY', label: '1. Dados da Empresa' },
    { id: 'WHATSAPP', label: '2. WhatsApp' },
    { id: 'RESEND', label: '3. Envio de Email' },
  ];

  return (
    <div className="w-full">
      {/* Progress tracking */}
      <div className="mb-8 p-4 bg-card rounded-lg border shadow-sm flex items-center justify-between text-sm overflow-x-auto gap-4">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isPast =
            steps.findIndex((s) => s.id === currentStep) > index;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-full font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : isPast
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <div
                className={`flex items-center justify-center size-5 rounded-full text-xs shrink-0 ${
                  isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted-foreground/20'
                }`}
              >
                {index + 1}
              </div>
              {step.label}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-card w-full shadow-sm rounded-xl border p-6">
        {currentStep === 'COMPANY' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold mb-6">Cadastro da Empresa</h2>
            <CompanyForm onSuccess={handleCompanyCreated} />
          </div>
        )}

        {currentStep === 'WHATSAPP' && createdCompanyId && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold mb-6">Integração com WhatsApp</h2>
            <WhatsappStep 
              companyId={createdCompanyId} 
              onSuccess={handleWhatsappFinished} 
              onSkip={handleWhatsappFinished} 
            />
          </div>
        )}

        {currentStep === 'RESEND' && createdCompanyId && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold mb-6">Integração com Resend</h2>
            <ResendStep 
              companyId={createdCompanyId} 
              onSuccess={handleResendFinished} 
              onSkip={handleResendFinished} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
