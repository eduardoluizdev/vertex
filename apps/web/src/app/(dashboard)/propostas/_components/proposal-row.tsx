'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, MessageCircle, Trash2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteProposal, sendProposalWhatsapp } from '../_actions/proposal-actions';
import { toast } from 'sonner';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviado',
  APPROVED: 'Aprovado',
  REJECTED: 'Reprovado',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  DRAFT: 'outline',
  SENT: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
};


interface ProposalRowProps {
  proposal: any;
}

export function ProposalRow({ proposal }: ProposalRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);


  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteProposal(proposal.id);
        toast.success('Proposta excluída');
        router.refresh();
      } catch {
        toast.error('Erro ao excluir proposta');
      } finally {
        setDeleteId(null);
      }
    });
  };

  const handleWhatsapp = () => {
    startTransition(async () => {
      try {
        const res = await sendProposalWhatsapp(proposal.id);
        if (res && res.error) {
          toast.error(res.error);
        } else {
          toast.success('Mensagem enviada via WhatsApp!');
        }
      } catch (e: any) {
        toast.error(e?.message ?? 'Erro ao enviar WhatsApp');
      }
    });
  };

  const publicUrl = `/p/${proposal.publicToken}`;

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">
              #{String(proposal.number).padStart(4, '0')}
            </span>
            <h3 className="font-semibold truncate">{proposal.title}</h3>
            <Badge variant={STATUS_VARIANTS[proposal.status] ?? 'outline'}>
              {STATUS_LABELS[proposal.status] ?? proposal.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {proposal.customer?.name}
            </span>
            <span className="font-semibold text-foreground">
              R$ {proposal.totalValue?.toFixed(2).replace('.', ',')}
            </span>
            <span>
              Criado: {format(new Date(proposal.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
            {proposal.followUpDate && (
              <span>
                Follow-up: {format(new Date(proposal.followUpDate), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4 shrink-0">
          {/* Public link */}
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <a href={publicUrl} target="_blank" rel="noreferrer" title="Ver link público">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>

          {/* WhatsApp */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWhatsapp}
            disabled={isPending || proposal.status === 'APPROVED' || proposal.status === 'REJECTED'}
            title={proposal.status === 'APPROVED' || proposal.status === 'REJECTED' ? 'Ação indisponível para esta proposta' : 'Enviar via WhatsApp'}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 disabled:opacity-50"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>

          {/* Edit */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/propostas/${proposal.id}`)}
          >
            Editar
          </Button>

          {/* Delete */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(proposal.id)}
            disabled={isPending}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteId === proposal.id} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir proposta?</AlertDialogTitle>
            <AlertDialogDescription>
              A proposta <strong>#{String(proposal.number).padStart(4, '0')} – {proposal.title}</strong> será excluída permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
