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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, CheckCircle2, XCircle, Users } from 'lucide-react';
import { useState } from 'react';

const customerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  website: z.string().optional(),
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
  const [isValidatingPhone, setIsValidatingPhone] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [showContacts, setShowContacts] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter((contact) => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();
    const searchDigits = searchQuery.replace(/\D/g, '');
    return (
      contact.name?.toLowerCase().includes(searchLower) ||
      (searchDigits ? contact.number?.includes(searchDigits) : false)
    );
  });

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultValues ?? {
      name: '',
      email: '',
      phone: '',
      website: '',
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

  async function validatePhone() {
    const phone = form.getValues('phone');
    if (!phone || phone.replace(/\D/g, '').length < 10) {
       toast.error('Preencha um telefone válido antes de validar');
       return;
    }
    setIsValidatingPhone(true);
    try {
       const numericPhone = phone.replace(/\D/g, '');
       const reqPhone = numericPhone.length === 10 || numericPhone.length === 11 ? `55${numericPhone}` : numericPhone;
       const response = await fetchClient(`/v1/whatsapp/validate-number/${companyId}/${reqPhone}`);
       if (!response.ok) throw new Error('Falha ao validar');
       const data = await response.json();
       if (data.exists) {
          setPhoneStatus('valid');
          toast.success('Número possui WhatsApp!');
       } else {
          setPhoneStatus('invalid');
          toast.error('Número não possui WhatsApp');
       }
    } catch (error) {
       toast.error('Erro ao validar ou WhatsApp não conectado');
       setPhoneStatus('idle');
    } finally {
       setIsValidatingPhone(false);
    }
  }

  async function loadContacts() {
    setSearchQuery('');
    setShowContacts(true);
    setIsLoadingContacts(true);
    try {
       const res = await fetchClient(`/v1/whatsapp/contacts/${companyId}`);
       if (!res.ok) throw new Error();
       const data = await res.json();
       setContacts(data);
    } catch (e) {
       toast.error('Erro ao carregar contatos. Verifique se o WhatsApp está conectado.');
       setShowContacts(false);
    } finally {
       setIsLoadingContacts(false);
    }
  }

  function handleSelectContact(contact: any) {
    if (contact.name && contact.name !== 'Desconhecido') {
        form.setValue('name', contact.name);
    }
    let phoneStr = contact.number;
    if (phoneStr.startsWith('55')) phoneStr = phoneStr.slice(2);
    form.setValue('phone', maskPhone(phoneStr));
    setPhoneStatus('valid');
    setShowContacts(false);
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
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!isEditing && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-muted/30 p-4 rounded-lg border border-dashed border-primary/20 gap-4">
              <div>
                 <h3 className="font-medium">Cadastro Rápido via WhatsApp</h3>
                 <p className="text-sm text-muted-foreground">Importe os dados de um contato já conectado na sua instância.</p>
              </div>
              <Button type="button" variant="secondary" onClick={loadContacts} disabled={isLoadingContacts}>
                 <Users className="size-4 mr-2" />
                 {isLoadingContacts ? 'Carregando...' : 'Buscar Contatos'}
              </Button>
          </div>
        )}

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
                <div className="flex gap-2">
                  <FormControl>
                    <MaskedInput
                      mask={maskPhone}
                      placeholder="(11) 99999-9999"
                      {...field}
                      onChange={(e) => {
                         field.onChange(e);
                         setPhoneStatus('idle');
                      }}
                    />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={validatePhone}
                    disabled={isValidatingPhone}
                    title="Validar WhatsApp"
                  >
                     {isValidatingPhone ? <span className="animate-spin text-xs">...</span> : 
                       phoneStatus === 'valid' ? <CheckCircle2 className="size-4 text-emerald-500" /> :
                       phoneStatus === 'invalid' ? <XCircle className="size-4 text-red-500" /> :
                       <Search className="size-4" />
                     }
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://exemplo.com.br" {...field} />
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

    <Dialog open={showContacts} onOpenChange={setShowContacts}>
       <DialogContent className="max-w-md">
          <DialogHeader>
             <DialogTitle>Contatos do WhatsApp</DialogTitle>
          </DialogHeader>

          <div className="px-1 pt-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contato..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 mt-2 max-h-[60vh] overflow-y-auto pr-2">
             {isLoadingContacts && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                   Buscando contatos na API...
                </div>
             )}
             {!isLoadingContacts && contacts.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                   Nenhum contato encontrado ou WhatsApp desconectado.
                </div>
             )}
             {!isLoadingContacts && contacts.length > 0 && filteredContacts.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                   Nenhum contato correspondente à busca.
                </div>
             )}
             {!isLoadingContacts && filteredContacts.map(contact => (
                <div key={contact.id} className="flex flex-row items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                   <div className="flex flex-row items-center gap-3">
                     <Avatar className="h-10 w-10">
                       <AvatarImage src={contact.profilePictureUrl || ''} />
                       <AvatarFallback className="bg-primary/10 text-primary">
                         {contact.name.charAt(0).toUpperCase()}
                       </AvatarFallback>
                     </Avatar>
                     <div className="flex flex-col">
                        <span className="font-medium text-sm">{contact.name}</span>
                        <span className="text-xs text-muted-foreground">{maskPhone(contact.number.startsWith('55') ? contact.number.slice(2) : contact.number) || contact.number}</span>
                     </div>
                   </div>
                   <Button size="sm" variant="secondary" onClick={() => handleSelectContact(contact)}>
                      Selecionar
                   </Button>
                </div>
             ))}
          </div>
       </DialogContent>
    </Dialog>
    </>
  );
}
