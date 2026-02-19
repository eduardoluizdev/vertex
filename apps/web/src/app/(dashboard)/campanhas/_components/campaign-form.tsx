'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/common/rich-text-editor';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const campaignSchema = z.object({
  name: z.string().min(1, 'Nome da campanha é obrigatório'),
  subject: z.string().min(1, 'Assunto é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  scheduledAt: z.string().optional(),
  targetAudience: z.enum(['ALL', 'ACTIVE_CLIENTS', 'INACTIVE_CLIENTS']).default('ALL'),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  initialData?: any;
  action: (data: CampaignFormValues) => Promise<any>;
}

export function CampaignForm({ initialData, action }: CampaignFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      subject: initialData?.subject || '',
      content: initialData?.content || '',
      scheduledAt: initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : '',
      targetAudience: initialData?.targetAudience || 'ALL',
    },
  });

  async function onSubmit(data: CampaignFormValues) {
    setLoading(true);
    try {
      await action(data);
      toast.success('Campanha salva com sucesso!');
      router.push('/campanhas');
      router.refresh();
    } catch (error) {
      toast.error('Erro ao salvar campanha');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Campanha</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Promoção de Natal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="targetAudience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Público Alvo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o público" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ALL">Todos os Clientes</SelectItem>
                  <SelectItem value="ACTIVE_CLIENTS">Clientes Ativos (Com serviços)</SelectItem>
                  <SelectItem value="INACTIVE_CLIENTS">Clientes Inativos (Sem serviços)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assunto do Email</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Confira nossas ofertas..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo</FormLabel>
              <FormControl>
                <div className="border rounded-md min-h-[400px]">
                   <RichTextEditor markdown={field.value} onChange={field.onChange} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="scheduledAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agendar Envio (Opcional)</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormDescription>
                Deixe em branco para salvar como rascunho. O envio será feito automaticamente na data selecionada.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-4">
           <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
           <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Campanha'}</Button>
        </div>
      </form>
    </Form>
  );
}
