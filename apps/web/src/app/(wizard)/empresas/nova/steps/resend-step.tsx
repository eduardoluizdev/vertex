'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { fetchClient } from '@/lib/fetch-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const resendSchema = z.object({
  apiKey: z.string().min(1, 'API Key é obrigatória').startsWith('re_', 'A chave deve começar com re_'),
  fromEmail: z.string().email('Email de envio inválido'),
  frontendUrl: z.string().url('URL inválida').optional(),
});

type ResendFormValues = z.infer<typeof resendSchema>;

interface ResendStepProps {
  companyId: string;
  onSuccess: () => void;
  onSkip: () => void;
}

export function ResendStep({ companyId, onSuccess, onSkip }: ResendStepProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResendFormValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      apiKey: '',
      fromEmail: '',
      frontendUrl: typeof window !== 'undefined' ? window.location.origin : 'https://vertexhub.dev',
    },
  });

  async function onSubmit(data: ResendFormValues) {
    try {
      const response = await fetchClient(`/v1/integrations/resend?companyId=${companyId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          enabled: true,
          config: {
            apiKey: data.apiKey,
            fromEmail: data.fromEmail,
            frontendUrl: data.frontendUrl,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar configuração do Resend');
      }

      toast.success('Resend configurado com sucesso!');
      setIsSuccess(true);
      
      // Auto-advance after a short delay
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (error) {
      toast.error('Erro ao configurar Resend');
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-8 animate-in fade-in zoom-in duration-300">
        <div className="flex size-20 items-center justify-center border-4 border-green-500/20 bg-green-500/10 rounded-full">
          <CheckCircle2 className="size-10 text-green-500" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Email Configurado!</h3>
          <p className="text-muted-foreground">Sua empresa já pode enviar emails pelas campanhas.</p>
        </div>
        <Button onClick={onSuccess} size="lg" className="w-full sm:w-auto mt-4 px-8">
          Concluir <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold flex items-center justify-center gap-2">
          <Mail className="size-5 text-blue-500" />
          Configurar Envios de Email
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Integre sua conta do Resend para realizar disparos de email nas campanhas.
        </p>
      </div>

      <div className="w-full xl:max-w-md mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resend API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="re_..." type="password" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Crie uma API key no painel do Resend com permissão de envio.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fromEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Remetente</FormLabel>
                  <FormControl>
                    <Input placeholder="contato@suaempresa.com.br" type="email" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    O email que aparecerá como remetente nas campanhas. Precisa ser um domínio verificado no Resend.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="hidden">
              <FormField
                control={form.control}
                name="frontendUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-center gap-3 pt-6 mt-4">
              <Button type="button" variant="ghost" onClick={onSkip} className="rounded-full px-6">
                Pular
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} size="lg" className="rounded-full px-8">
                {form.formState.isSubmitting ? 'Salvando...' : 'Salvar e Concluir'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
