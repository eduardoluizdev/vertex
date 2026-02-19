import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getCampaigns } from './_actions/campaign-actions';
import { Plus, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Campanhas de Email</h1>
        <Button asChild>
          <Link href="/campanhas/novo">
            <Plus className="mr-2 h-4 w-4" />
            Nova Campanha
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="p-4">
           {campaigns.length === 0 ? (
               <div className="text-center py-10">
                   <Mail className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                   <h3 className="text-lg font-medium">Nenhuma campanha encontrada</h3>
                   <p className="text-muted-foreground mt-2">Crie sua primeira campanha para começar.</p>
               </div>
           ) : (
             <div className="space-y-4">
                 {campaigns.map((campaign: any) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div>
                            <h3 className="font-semibold text-lg">{campaign.name}</h3>
                            <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                            <div className="flex gap-2 mt-2">
                                <Badge variant={
                                    campaign.status === 'SENT' ? 'default' : 
                                    campaign.status === 'SCHEDULED' ? 'secondary' : 'outline'
                                }>
                                    {campaign.status}
                                </Badge>
                                {campaign.scheduledAt && (
                                    <span className="text-xs text-muted-foreground my-auto">
                                        Agendado: {format(new Date(campaign.scheduledAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/campanhas/${campaign.id}`}>Editar</Link>
                            </Button>
                        </div>
                    </div>
                 ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
