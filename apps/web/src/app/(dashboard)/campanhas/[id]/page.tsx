import { CampaignForm } from '../_components/campaign-form';
import { createCampaign, getCampaign, updateCampaign, sendCampaign } from '../_actions/campaign-actions';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Send, Mail, Edit, Plus } from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignEditPage({ params }: PageProps) {
  const { id } = await params;
  const isNew = id === 'novo';
  
  let initialData = null;
  if (!isNew) {
    initialData = await getCampaign(id);
    if (!initialData) notFound();
  }

  async function handleSave(data: any) {
    'use server';
    if (isNew) {
        await createCampaign(data);
    } else {
        await updateCampaign(id, data);
    }
  }

  async function handleSend() {
    'use server';
    await sendCampaign(id);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: 'Campanhas', href: '/campanhas', icon: Mail },
          { label: isNew ? 'Nova' : 'Editar', icon: isNew ? Plus : Edit }
        ]}
      />

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-emerald-500/10 rounded-2xl blur-2xl" />
        <div className="relative glass-strong rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
                {isNew ? 'Nova Campanha' : 'Editar Campanha'}
            </h1>
            <p className="text-muted-foreground mt-1">
                {isNew ? 'Crie uma nova campanha de email' : 'Gerencie as configurações da campanha'}
            </p>
          </div>
          {!isNew && initialData.status !== 'SENT' && (
              <form action={handleSend}>
                  <Button type="submit">
                      <Send className="mr-2 h-4 w-4" />
                      Disparar Agora
                  </Button>
              </form>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <CampaignForm initialData={initialData} action={handleSave} />
      </div>
    </div>
  );
}
