'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, XCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviado',
  APPROVED: 'Aprovado',
  REJECTED: 'Reprovado',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.vertexhub.dev';

interface PublicProposalViewProps {
  proposal: any;
}

export function PublicProposalView({ proposal: initial }: PublicProposalViewProps) {
  const [proposal, setProposal] = useState(initial);
  const [loading, setLoading] = useState<'APPROVED' | 'REJECTED' | null>(null);

  const updateStatus = async (status: 'APPROVED' | 'REJECTED') => {
    setLoading(status);
    try {
      const res = await fetch(`${API_URL}/v1/public/proposals/${proposal.publicToken}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar');
      const updated = await res.json();
      setProposal((prev: any) => ({ ...prev, status: updated.status }));
      toast.success(status === 'APPROVED' ? 'Proposta aprovada!' : 'Proposta reprovada.');
    } catch {
      toast.error('Erro ao processar. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  const isFinalized = proposal.status === 'APPROVED' || proposal.status === 'REJECTED';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4 md:p-8 flex items-start justify-center">
      <div className="w-full max-w-3xl space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <FileText className="size-7 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
            {proposal.company?.name}
          </p>
          <h1 className="text-3xl font-bold">Proposta Comercial</h1>
          <Badge variant={
            proposal.status === 'APPROVED' ? 'default' :
            proposal.status === 'REJECTED' ? 'destructive' : 'secondary'
          }>
            {STATUS_LABELS[proposal.status] ?? proposal.status}
          </Badge>
        </div>

        {/* Info Card */}
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Número</p>
              <p className="font-semibold">#{String(proposal.number).padStart(4, '0')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Data</p>
              <p className="font-semibold">
                {format(new Date(proposal.proposalDate), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Cliente</p>
              <p className="font-semibold">{proposal.customer?.name}</p>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground text-sm">Título</p>
            <p className="text-lg font-semibold">{proposal.title}</p>
          </div>

          {proposal.notes && (
            <div>
              <p className="text-muted-foreground text-sm">Observações</p>
              <p className="text-sm whitespace-pre-line">{proposal.notes}</p>
            </div>
          )}
        </div>

        {/* Items Table */}
        {proposal.items?.length > 0 && (
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h2 className="font-semibold">Itens da Proposta</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="text-left p-3 font-medium text-muted-foreground">Produto/Serviço</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Descrição</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Qtd.</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Val. Unit.</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.items.map((item: any) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3 text-muted-foreground">{item.description || '—'}</td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-right">R$ {Number(item.unitPrice).toFixed(2)}</td>
                      <td className="p-3 text-right font-semibold">R$ {Number(item.totalPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30 border-t">
                    <td colSpan={4} className="p-3 text-right font-semibold">Total Geral</td>
                    <td className="p-3 text-right text-lg font-bold">
                      R$ {Number(proposal.totalValue).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isFinalized && (
          <div className="rounded-2xl border bg-card p-6 text-center space-y-4">
            <p className="text-muted-foreground">
              Após analisar a proposta acima, utilize os botões abaixo para responder.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
                onClick={() => updateStatus('APPROVED')}
                disabled={!!loading}
              >
                <CheckCircle className="h-5 w-5" />
                {loading === 'APPROVED' ? 'Aprovando...' : 'Aprovar Proposta'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2 dark:hover:bg-red-950/30"
                onClick={() => updateStatus('REJECTED')}
                disabled={!!loading}
              >
                <XCircle className="h-5 w-5" />
                {loading === 'REJECTED' ? 'Reprovando...' : 'Reprovar Proposta'}
              </Button>
            </div>
          </div>
        )}

        {isFinalized && (
          <div className={`rounded-2xl border p-6 text-center ${
            proposal.status === 'APPROVED'
              ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
              : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
          }`}>
            {proposal.status === 'APPROVED' ? (
              <>
                <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-green-700 dark:text-green-400">
                  Proposta Aprovada
                </p>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                  Obrigado! Entraremos em contato em breve.
                </p>
              </>
            ) : (
              <>
                <XCircle className="h-10 w-10 text-red-600 mx-auto mb-2" />
                <p className="font-semibold text-red-700 dark:text-red-400">
                  Proposta Reprovada
                </p>
                <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                  Agradecemos pela sua resposta.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
