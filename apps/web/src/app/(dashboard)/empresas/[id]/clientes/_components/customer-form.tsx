'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { fetchClient } from '@/lib/fetch-client';
import { maskPhone, maskCEP, maskDocument, unmask } from '@/lib/masks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { Checkbox } from '@/components/ui/checkbox';
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

const customerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  document: z.string().optional(),
  personType: z.enum(['INDIVIDUAL', 'COMPANY'], {
    message: 'Tipo de pessoa é obrigatório',
  }),
  zip: z.string().optional(),
  street: z.string().optional(),
  neighborhood: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  subscriptions: z.array(
    z.object({
      serviceId: z.string(),
      recurrenceDay: z.number().min(1).max(31),
      recurrenceMonth: z.number().min(1).max(12).optional(),
    })
  ).optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

type ServiceOption = {
  id: string;
  name: string;
  recurrence: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
};

interface CustomerFormProps {
  companyId: string;
  services: ServiceOption[];
  defaultValues?: CustomerFormValues;
  customerId?: string;
}

export function CustomerForm({
  companyId,
  services,
  defaultValues,
  customerId,
}: CustomerFormProps) {
  const router = useRouter();
  const isEditing = !!customerId;

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultValues ?? {
      name: '',
      email: '',
      phone: '',
      document: '',
      personType: 'INDIVIDUAL',
      zip: '',
      street: '',
      neighborhood: '',
      number: '',
      complement: '',
      city: '',
      state: '',
      subscriptions: [],
    },
  });

  const personType = form.watch('personType');
  const watchedSubscriptions = form.watch('subscriptions') || [];

  const handleCEPBlur = useCallback(
    async (value: string) => {
      const digits = unmask(value);
      if (digits.length !== 8) return;

      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${digits}/json/`,
        );
        const data = await response.json();

        if (data.erro) {
          toast.error('CEP não encontrado');
          return;
        }

        form.setValue('street', data.logradouro || '');
        form.setValue('neighborhood', data.bairro || '');
        form.setValue('city', data.localidade || '');
        form.setValue('state', data.uf || '');
      } catch {
        toast.error('Erro ao buscar CEP');
      }
    },
    [form],
  );

  async function onSubmit(data: CustomerFormValues) {
    try {
      const path = isEditing
        ? `/v1/companies/${companyId}/customers/${customerId}`
        : `/v1/companies/${companyId}/customers`;

      const response = await fetchClient(path, {
        method: isEditing ? 'PATCH' : 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar cliente');
      }

      toast.success(
        isEditing ? 'Cliente atualizado com sucesso' : 'Cliente criado com sucesso',
      );
      router.push(`/empresas/${companyId}/clientes`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar cliente',
      );
    }
  }

  const documentMask = useCallback(
    (value: string) => maskDocument(value, personType),
    [personType],
  );

  const toggleService = (serviceId: string, checked: boolean) => {
    const current = form.getValues('subscriptions') || [];
    if (checked) {
      form.setValue('subscriptions', [
        ...current,
        { serviceId, recurrenceDay: 1 }, 
      ]);
    } else {
      form.setValue(
        'subscriptions',
        current.filter((s) => s.serviceId !== serviceId)
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* ... existing fields ... */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="cliente@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <MaskedInput
                    mask={maskPhone}
                    placeholder="(11) 99999-9999"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="personType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de pessoa</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue('document', '');
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">Pessoa Física</SelectItem>
                    <SelectItem value="COMPANY">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {personType === 'INDIVIDUAL' ? 'CPF' : 'CNPJ'}
                </FormLabel>
                <FormControl>
                  <MaskedInput
                    mask={documentMask}
                    placeholder={
                      personType === 'INDIVIDUAL'
                        ? '000.000.000-00'
                        : '00.000.000/0000-00'
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <FormField
            control={form.control}
            name="zip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <MaskedInput
                    mask={maskCEP}
                    placeholder="00000-000"
                    {...field}
                    onBlur={(e) => {
                      field.onBlur();
                      handleCEPBlur(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem className="md:col-span-3">
                <FormLabel>Rua</FormLabel>
                <FormControl>
                  <Input placeholder="Preenchido pelo CEP" readOnly {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="neighborhood"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input placeholder="Preenchido pelo CEP" readOnly {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="complement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complemento</FormLabel>
                <FormControl>
                  <Input placeholder="Sala 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="Preenchido pelo CEP" readOnly {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input placeholder="Preenchido pelo CEP" readOnly {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {services.length > 0 && (
          <div className="space-y-4">
            <div className="mb-4">
              <FormLabel className="text-base">Serviços</FormLabel>
              <p className="text-sm text-muted-foreground">
                Selecione os serviços e configure a recorrência
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const subscriptionIndex = watchedSubscriptions.findIndex(
                  (s) => s.serviceId === service.id
                );
                const isSelected = subscriptionIndex !== -1;

                return (
                  <div
                    key={service.id}
                    className={`rounded-md border p-4 space-y-3 transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex flex-row items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          toggleService(service.id, checked as boolean)
                        }
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{service.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {service.recurrence}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
                        {/* Day Field - Always shown for MONTHLY and YEARLY */}
                        {(service.recurrence === 'MONTHLY' || service.recurrence === 'YEARLY') && (
                          <FormField
                            control={form.control}
                            name={`subscriptions.${subscriptionIndex}.recurrenceDay`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Dia do vencimento</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min={1} 
                                    max={31} 
                                    {...field} 
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {/* Month Field - Only shown for YEARLY */}
                        {service.recurrence === 'YEARLY' && (
                          <FormField
                            control={form.control}
                            name={`subscriptions.${subscriptionIndex}.recurrenceMonth`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Mês</FormLabel>
                                <Select
                                  onValueChange={(val) => field.onChange(parseInt(val))}
                                  defaultValue={field.value?.toString()}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Mês" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                      <SelectItem key={m} value={m.toString()}>
                                        {new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' })}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        
                        {(service.recurrence === 'DAILY' || service.recurrence === 'WEEKLY') && (
                           <p className="text-xs text-muted-foreground">
                             Recorrência automática definida pelo sistema.
                           </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <FormMessage>{form.formState.errors.subscriptions?.message}</FormMessage>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? 'Salvando...'
              : isEditing
                ? 'Salvar alterações'
                : 'Criar cliente'}
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
