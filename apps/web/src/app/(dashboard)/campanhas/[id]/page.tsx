import { CampaignForm } from '../_components/campaign-form';
import { createCampaign, getCampaign, updateCampaign, sendCampaign } from '../_actions/campaign-actions';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
            {isNew ? 'Nova Campanha' : 'Editar Campanha'}
        </h1>
        {!isNew && initialData.status !== 'SENT' && (
            <form action={handleSend}>
                <Button type="submit">
                    <Send className="mr-2 h-4 w-4" />
                    Disparar Agora
                </Button>
            </form>
        )}
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <CampaignForm initialData={initialData} action={handleSave} />
      </div>
    </div>
  );
}
