import Link from 'next/link';
import { Plus, Target, MapPin, Users, Clock, CheckCircle, XCircle, Loader2, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLeadLists } from '@/actions/lead-lists';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface CapturaLeadsPageProps {
  params: Promise<{ id: string }>;
}

const statusConfig = {
  PROCESSANDO: {
    label: 'Processando',
    icon: Loader2,
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
    iconClass: 'animate-spin',
  },
  CONCLUIDO: {
    label: 'Concluído',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
    iconClass: '',
  },
  FALHA: {
    label: 'Falha',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    iconClass: '',
  },
};

export default async function CapturaLeadsPage({ params }: CapturaLeadsPageProps) {
  const { id: companyId } = await params;
  const leadLists = await getLeadLists(companyId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-rose-500/10 rounded-xl blur-xl" />
        <div className="relative flex items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-2.5 dark:bg-orange-950">
              <Target className="size-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Captura de Leads</h2>
              <p className="text-sm text-muted-foreground">
                Busque e gerencie listas de leads via Google Maps
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 shadow-lg">
            <Link href={`/empresas/${companyId}/captura-leads/nova`}>
              <Plus className="size-4" />
              Nova Lista
            </Link>
          </Button>
        </div>
      </div>

      {/* Lead Lists */}
      {leadLists.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card p-16 text-center">
          <div className="rounded-full bg-muted p-4">
            <Target className="size-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Nenhuma lista criada</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie sua primeira lista para buscar leads no Google Maps.
          </p>
          <Button asChild className="mt-6">
            <Link href={`/empresas/${companyId}/captura-leads/nova`}>
              <Plus className="size-4" />
              Criar primeira lista
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leadLists.map((list) => {
            const status = statusConfig[list.status];
            const StatusIcon = status.icon;
            return (
              <Card key={list.id} className="group relative overflow-hidden transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-tight">{list.name}</h3>
                    <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                      <StatusIcon className={`size-3 ${status.iconClass}`} />
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Target className="size-3.5 shrink-0" />
                      <span className="truncate">{list.nicho}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">{list.cidade}, {list.estado} — {list.pais}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="size-3.5 shrink-0" />
                      <span>
                        {list._count?.leads ?? 0} de {list.quantidade} leads
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-3.5 shrink-0" />
                      <span>
                        {new Date(list.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button asChild size="sm" className="w-full" variant="outline">
                      <Link href={`/empresas/${companyId}/captura-leads/${list.id}`}>
                        Ver Kanban
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
