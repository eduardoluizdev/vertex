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
  subject: z.string().optional(),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  scheduledAt: z.string().optional(),
  targetAudience: z.enum(['ALL', 'ACTIVE_CLIENTS', 'INACTIVE_CLIENTS', 'SPECIFIC_CLIENTS']).default('ALL'),
  channels: z.array(z.enum(['EMAIL', 'WHATSAPP'])).min(1, 'Selecione pelo menos um canal de envio'),
  customerIds: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  if (data.channels.includes('EMAIL') && (!data.subject || data.subject.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Assunto é obrigatório para envio por Email',
      path: ['subject'],
    });
  }
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  initialData?: any;
  customers: { id: string; name: string; email: string; phone?: string }[];
  action: (data: CampaignFormValues) => Promise<any>;
}

export function CampaignForm({ initialData, customers, action }: CampaignFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      subject: initialData?.subject || '',
      content: initialData?.content || '',
      scheduledAt: initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : '',
      channels: initialData?.channels || ['EMAIL'],
      targetAudience: initialData?.targetAudience || 'ALL',
      customerIds: initialData?.customers?.map((c: any) => c.id) || [],
    },
  });

  const targetAudience = form.watch('targetAudience');
  const selectedChannels = form.watch('channels');
  const isEmailSelected = selectedChannels?.includes('EMAIL');

  async function onSubmit(data: CampaignFormValues) {
    setLoading(true);
    try {
      const payload = { ...data };
      if (!payload.channels.includes('EMAIL') && !payload.subject) {
        payload.subject = payload.name; // fallback para banco de dados
      }

      await action(payload);
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
          name="channels"
          render={() => (
            <FormItem>
              <div className="mb-2">
                <FormLabel className="text-base">Canais de Envio</FormLabel>
              </div>
              <div className="flex flex-row gap-4">
                <FormField
                  control={form.control}
                  name="channels"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key="EMAIL"
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={field.value?.includes('EMAIL')}
                            onChange={(e) => {
                              const current = field.value || [];
                              const updated = e.target.checked
                                ? [...current, 'EMAIL']
                                : current.filter((value: string) => value !== 'EMAIL');
                              field.onChange(updated);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Email
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
                <FormField
                  control={form.control}
                  name="channels"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key="WHATSAPP"
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={field.value?.includes('WHATSAPP')}
                            onChange={(e) => {
                              const current = field.value || [];
                              const updated = e.target.checked
                                ? [...current, 'WHATSAPP']
                                : current.filter((value: string) => value !== 'WHATSAPP');
                              field.onChange(updated);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          WhatsApp
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              </div>
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
                  <SelectItem value="SPECIFIC_CLIENTS">Clientes Específicos</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {targetAudience === 'SPECIFIC_CLIENTS' && (
          <FormField
            control={form.control}
            name="customerIds"
            render={() => (
              <FormItem className="border rounded-md p-4">
                <FormLabel className="text-base">Selecione os Clientes</FormLabel>
                <FormDescription>
                  Selecione os clientes que devem receber esta campanha.
                </FormDescription>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto pr-2">
                  {customers.map((customer) => (
                    <FormField
                      key={customer.id}
                      control={form.control}
                      name="customerIds"
                      render={({ field }) => {
                        const isChecked = field.value?.includes(customer.id) || false;
                        return (
                          <FormItem
                            key={customer.id}
                            className={`flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 transition-colors ${isChecked ? 'bg-primary/5 border-primary/50' : 'bg-card'}`}
                          >
                            <FormControl>
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                                checked={isChecked}
                                onChange={(e) => {
                                  const current = field.value || [];
                                  const updated = e.target.checked
                                    ? [...current, customer.id]
                                    : current.filter((value) => value !== customer.id);
                                  field.onChange(updated);
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-medium cursor-pointer">
                                {customer.name}
                              </FormLabel>
                              <p className="text-xs text-muted-foreground">
                                {customer.email} {customer.phone && `• ${customer.phone}`}
                              </p>
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  {customers.length === 0 && (
                     <p className="text-sm text-muted-foreground col-span-full">Nenhum cliente cadastrado com email/telefone.</p>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {isEmailSelected && (
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
        )}

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
