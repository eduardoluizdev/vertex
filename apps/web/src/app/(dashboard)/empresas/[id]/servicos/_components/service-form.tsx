'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { fetchClient } from '@/lib/fetch-client';
import { maskCurrency, parseCurrency } from '@/lib/masks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const RecurrenceEnum = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);

const serviceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.string().min(1, 'Preço é obrigatório'),
  recurrence: RecurrenceEnum,
  customerIds: z.array(z.string()).optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

type CustomerOption = {
  id: string;
  name: string;
};

interface ServiceFormProps {
  companyId: string;
  customers: CustomerOption[];
  defaultValues?: ServiceFormValues;
  serviceId?: string;
}

export function ServiceForm({
  companyId,
  customers,
  defaultValues,
  serviceId,
}: ServiceFormProps) {
  const router = useRouter();
  const isEditing = !!serviceId;

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: defaultValues ?? {
      name: '',
      description: '',
      price: '',
      recurrence: 'MONTHLY',
      customerIds: [],
    },
  });

  async function onSubmit(data: ServiceFormValues) {
    try {
      const path = isEditing
        ? `/v1/companies/${companyId}/services/${serviceId}`
        : `/v1/companies/${companyId}/services`;

      const response = await fetchClient(path, {
        method: isEditing ? 'PATCH' : 'POST',
        body: JSON.stringify({
          ...data,
          price: parseCurrency(data.price),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar serviço');
      }

      toast.success(
        isEditing ? 'Serviço atualizado com sucesso' : 'Serviço criado com sucesso',
      );
      router.push(`/empresas/${companyId}/servicos`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar serviço',
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do serviço" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerIds"
            render={() => (
              <FormItem>
                <FormLabel>Clientes (opcional)</FormLabel>
                <div className="rounded-md border p-3 max-h-40 overflow-y-auto space-y-2">
                  {customers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum cliente cadastrado
                    </p>
                  ) : (
                    customers.map((customer) => (
                      <FormField
                        key={customer.id}
                        control={form.control}
                        name="customerIds"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(customer.id)}
                                onCheckedChange={(checked) => {
                                  const next = checked
                                    ? [...(field.value ?? []), customer.id]
                                    : (field.value ?? []).filter(
                                        (id) => id !== customer.id,
                                      );
                                  field.onChange(next);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {customer.name}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (R$)</FormLabel>
                <FormControl>
                  <MaskedInput
                    mask={maskCurrency}
                    placeholder="0,00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="recurrence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recorrência</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a recorrência" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DAILY">Diário</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Descrição do serviço" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? 'Salvando...'
              : isEditing
                ? 'Salvar alterações'
                : 'Criar serviço'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
