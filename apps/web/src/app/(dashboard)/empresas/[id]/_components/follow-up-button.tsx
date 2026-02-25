'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { sendProposalFollowUp } from '@/app/(dashboard)/propostas/_actions/proposal-actions';

interface FollowUpButtonProps {
  proposalId: string;
}

export function FollowUpButton({ proposalId }: FollowUpButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleSendFollowUp = () => {
    startTransition(async () => {
      try {
        const res = await sendProposalFollowUp(proposalId);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success('Mensagem de follow-up enviada com sucesso!');
        }
      } catch (err) {
        toast.error('Ocorreu um erro ao enviar o follow-up.');
      }
    });
  };

  return (
    <Button
      onClick={handleSendFollowUp}
      disabled={isPending}
      variant="default"
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors shrink-0"
      size="sm"
    >
      <MessageCircle className="h-4 w-4" />
      {isPending ? 'Enviando...' : 'Enviar Follow-up'}
    </Button>
  );
}
