'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { fetchClient } from '@/lib/fetch-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  nicho: z.string().min(1, 'Nicho é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(1, 'Estado é obrigatório'),
  pais: z.string().min(1, 'País é obrigatório'),
  quantidade: z.number().int().min(1, 'Mínimo 1').max(200, 'Máximo 200'),
});

type FormValues = z.infer<typeof schema>;

interface NewLeadListFormProps {
  companyId: string;
}

export function NewLeadListForm({ companyId }: NewLeadListFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      nicho: '',
      cidade: '',
      estado: '',
      pais: 'Brasil',
      quantidade: 20,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetchClient(
        `/v1/companies/${companyId}/lead-lists`,
        {
          method: 'POST',
          body: JSON.stringify(values),
        },
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast.success('Lista criada! A busca está em andamento.', {
        description: 'Os leads serão importados automaticamente em alguns minutos.',
      });
      router.push(`/empresas/${companyId}/captura-leads`);
      router.refresh();
    } catch (error) {
      toast.error('Erro ao criar lista', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Lista</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Dentistas SP - Janeiro 2026" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nicho"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nicho</FormLabel>
              <FormControl>
                <Input placeholder="Ex: dentistas, advogados, restaurantes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="São Paulo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input placeholder="SP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pais"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <FormControl>
                  <Input placeholder="Brasil" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade (máx. 200)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={200}
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Buscar Leads
          </Button>
        </div>
      </form>
    </Form>
  );
}
