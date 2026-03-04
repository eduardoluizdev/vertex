import { CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ConfettiEffect } from './_components/confetti-effect';

const API_URL = process.env.API_URL || 'https://api.vertexhub.dev';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export const metadata = {
  title: 'Pagamento Confirmado — VertexHub',
};

export default async function PagamentoSucessoPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  let proposal: any = null;
  if (token) {
    try {
      const res = await fetch(`${API_URL}/v1/public/proposals/${token}`, { cache: 'no-store' });
      if (res.ok) proposal = await res.json();
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <ConfettiEffect />

      <div className="w-full max-w-md text-center space-y-8 relative z-10">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative flex size-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 shadow-xl shadow-green-500/10">
            <CheckCircle2 className="size-12 text-green-600 dark:text-green-400" />
            <span className="absolute inset-0 rounded-full animate-ping bg-green-400/20" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Pagamento Confirmado!</h1>
          <p className="text-muted-foreground">
            {proposal?.customer?.name
              ? `${proposal.customer.name}, seu pagamento foi recebido com sucesso.`
              : 'Seu pagamento foi recebido com sucesso.'}
          </p>
        </div>

        {/* Proposal details */}
        {proposal && (
          <div className="rounded-2xl border bg-card p-6 text-left space-y-4 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Proposta</span>
              <span className="font-semibold">#{String(proposal.number).padStart(4, '0')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Título</span>
              <span className="font-semibold truncate max-w-[60%] text-right">{proposal.title}</span>
            </div>
            {proposal.company?.name && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Empresa</span>
                <span className="font-semibold">{proposal.company.name}</span>
              </div>
            )}
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Valor pago</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                R$ {Number(proposal.totalValue).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Back link */}
        {token && (
          <Link
            href={`/p/${token}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Voltar para a proposta
          </Link>
        )}
      </div>
    </div>
  );
}
