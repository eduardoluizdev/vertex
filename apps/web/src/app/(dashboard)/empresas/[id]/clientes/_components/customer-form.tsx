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
  serviceIds: z.array(z.string()).optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

type ServiceOption = {
  id: string;
  name: string;
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
      serviceIds: [],
    },
  });

  const personType = form.watch('personType');

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
          <FormField
            control={form.control}
            name="serviceIds"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Serviços</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Selecione os serviços que deseja vincular a este cliente
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {services.map((service) => (
                    <FormField
                      key={service.id}
                      control={form.control}
                      name="serviceIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={service.id}
                            className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(service.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), service.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== service.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {service.name}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
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
