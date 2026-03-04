import { Target } from 'lucide-react';
import { NewLeadListForm } from './_components/new-lead-list-form';

interface NovaListaPageProps {
  params: Promise<{ id: string }>;
}

export default async function NovaListaPage({ params }: NovaListaPageProps) {
  const { id: companyId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-orange-100 p-2.5 dark:bg-orange-950">
          <Target className="size-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Nova Lista de Leads</h2>
          <p className="text-sm text-muted-foreground">
            Configure os critérios de busca. Os leads serão buscados automaticamente no Google Maps via Apify.
          </p>
        </div>
      </div>

      <div className="max-w-xl">
        <NewLeadListForm companyId={companyId} />
      </div>
    </div>
  );
}
