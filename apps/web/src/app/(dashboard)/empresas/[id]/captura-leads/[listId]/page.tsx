import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Target, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLeadList } from '@/actions/lead-lists';
import { LeadKanban } from './_components/lead-kanban';

interface KanbanPageProps {
  params: Promise<{ id: string; listId: string }>;
}

export default async function KanbanPage({ params }: KanbanPageProps) {
  const { id: companyId, listId } = await params;
  const leadList = await getLeadList(companyId, listId);

  if (!leadList) {
    notFound();
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={`/empresas/${companyId}/captura-leads`}>
            <ChevronLeft className="size-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-rose-500/10 rounded-xl blur-xl" />
        <div className="relative rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-950">
                <Target className="size-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{leadList.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Target className="size-3.5" />
                    {leadList.nicho}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {leadList.cidade}, {leadList.estado} — {leadList.pais}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" />
                    {leadList.leads.length} leads
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LeadKanban leadList={leadList} companyId={companyId} />
    </div>
  );
}
