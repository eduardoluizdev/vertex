'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2, Save, Package, PenLine, ExternalLink, Loader2, CreditCard, Copy, Check, QrCode, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { createProposal, updateProposal, getPaymentStatus } from '../_actions/proposal-actions';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'SENT', label: 'Enviado' },
  { value: 'APPROVED', label: 'Aprovado' },
  { value: 'REJECTED', label: 'Reprovado' },
];

interface ProposalItem {
  id?: string;
  /** 'catalog' = selecionado do catálogo; 'custom' = item livre */
  mode: 'catalog' | 'custom';
  serviceId?: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  // Raw string values for inputs — avoids React controlled number input bug with decimals
  quantityRaw: string;
  unitPriceRaw: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
}

interface ProposalFormProps {
  proposal?: any;
  customers: any[];
  services: Service[];
}

export function ProposalForm({ proposal, customers, services }: ProposalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(proposal?.title ?? '');
  const [status, setStatus] = useState(proposal?.status ?? 'DRAFT');
  const [customerId, setCustomerId] = useState(proposal?.customerId ?? '');
  const [proposalDate, setProposalDate] = useState(
    proposal?.proposalDate
      ? format(new Date(proposal.proposalDate), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd'),
  );
  const [followUpDate, setFollowUpDate] = useState(
    proposal?.followUpDate
      ? format(new Date(proposal.followUpDate), 'yyyy-MM-dd')
      : '',
  );
  const [notes, setNotes] = useState(proposal?.notes ?? '');

  const initialProvider = proposal?.abacatePayId ? 'abacatepay' : proposal?.asaasPaymentId ? 'asaas' : 'none';
  const [paymentProvider, setPaymentProvider] = useState<string>(initialProvider);

  // Initialise items — existing items = custom (free-text), preserving saved data
  const [items, setItems] = useState<ProposalItem[]>(
    proposal?.items?.map((i: any) => ({
      id: i.id,
      mode: 'custom' as const,
      name: i.name,
      description: i.description ?? '',
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      quantityRaw: String(i.quantity),
      unitPriceRaw: String(i.unitPrice),
    })) ?? [],
  );

  const [paymentStatus, setPaymentStatus] = useState<{ status: string; url: string | null; brCode?: string | null; brCodeBase64?: string | null } | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [copiedBrCode, setCopiedBrCode] = useState(false);

  const copyBrCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedBrCode(true);
    setTimeout(() => setCopiedBrCode(false), 2000);
  }, []);

  useEffect(() => {
    if (proposal?.id && proposal.totalValue > 0) {
      setLoadingPayment(true);
      getPaymentStatus(proposal.id)
        .then(res => {
          if (res) setPaymentStatus(res);
        })
        .finally(() => setLoadingPayment(false));
    }
  }, [proposal?.id, proposal?.totalValue]);

  // ── Item helpers ──────────────────────────────────────────────────────────

  const addCatalogItem = () => {
    setItems((prev) => [
      ...prev,
      { mode: 'catalog', serviceId: '', name: '', description: '', quantity: 1, unitPrice: 0, quantityRaw: '1', unitPriceRaw: '' },
    ]);
  };

  const addCustomItem = () => {
    setItems((prev) => [
      ...prev,
      { mode: 'custom', name: '', description: '', quantity: 1, unitPrice: 0, quantityRaw: '1', unitPriceRaw: '' },
    ]);
  };

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateItem = (idx: number, patch: Partial<ProposalItem>) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  /** When a service is selected from the catalogue, auto-fill fields */
  const handleServiceSelect = (idx: number, serviceId: string) => {
    const svc = services.find((s) => s.id === serviceId);
    if (!svc) return;
    updateItem(idx, {
      serviceId,
      name: svc.name,
      description: svc.description ?? '',
      unitPrice: svc.price,
      unitPriceRaw: String(svc.price),
    });
  };

  const totalValue = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0,
  );

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customerId) { toast.error('Selecione um cliente'); return; }
    if (items.some((i) => !i.name.trim())) {
      toast.error('Preencha o nome de todos os itens');
      return;
    }

    setLoading(true);
    try {
      const data = {
        title,
        status,
        customerId,
        paymentProvider,
        proposalDate: proposalDate || undefined,
        followUpDate: followUpDate || undefined,
        notes: notes || undefined,
        items: items.map((item) => ({
          ...(item.id && { id: item.id }),
          name: item.name,
          description: item.description || undefined,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      };

      if (proposal?.id) {
        await updateProposal(proposal.id, data);
        toast.success('Proposta atualizada!');
      } else {
        await createProposal(data);
        toast.success('Proposta criada!');
      }
      router.push('/propostas');
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao salvar proposta');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Main fields ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da Proposta</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Proposta de consultoria de marketing"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cliente *</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select 
              value={status} 
              onValueChange={setStatus}
              disabled={proposal?.status === 'APPROVED' || proposal?.status === 'REJECTED'}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proposalDate">Data da Proposta</Label>
            <Input
              id="proposalDate"
              type="date"
              value={proposalDate}
              onChange={(e) => setProposalDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="followUpDate">Data de Follow-Up</Label>
            <Input
              id="followUpDate"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Método de Pagamento</Label>
            <Select value={paymentProvider} onValueChange={setPaymentProvider} disabled={proposal?.status === 'APPROVED' || proposal?.status === 'REJECTED'}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="asaas">Asaas</SelectItem>
                <SelectItem value="abacatepay">AbacatePay</SelectItem>
              </SelectContent>
            </Select>
            {paymentProvider === 'asaas' && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 mt-1">
                <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
                  <span className="font-semibold">Asaas:</span> será gerado um link onde o cliente escolhe entre <span className="font-semibold">PIX, cartão ou boleto</span>. Valor mínimo: <span className="font-semibold">R$ 5,00</span>.
                </div>
              </div>
            )}
            {paymentProvider === 'abacatepay' && (
              <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 mt-1">
                <AlertTriangle className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                <div className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
                  <span className="font-semibold">AbacatePay:</span> será gerado um link onde o cliente escolhe entre <span className="font-semibold">PIX ou cartão</span>. <span className="text-emerald-500/70">(Cartão em beta)</span>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              rows={3}
              placeholder="Observações adicionais..."
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Payment Info ── */}
      {proposal?.id && (paymentStatus || loadingPayment) && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="size-5 text-green-500" />
              <CardTitle className="text-base">Pagamento Gerado</CardTitle>
            </div>
            <CardDescription>
              Status e dados de cobrança.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPayment ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Carregando status...
              </div>
            ) : paymentStatus?.status === 'NOT_GENERATED' ? (
              <p className="text-sm text-muted-foreground">O link de pagamento não foi gerado ou nenhuma integração de pagamentos está configurada no momento da criação.</p>
            ) : paymentStatus?.status === 'ERROR' ? (
              <p className="text-sm text-red-500 font-medium">Erro ao carregar o status do pagamento.</p>
            ) : (
              <div className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between gap-4 p-4 border rounded-xl bg-background">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Status Atual</div>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      paymentStatus?.status === 'RECEIVED' || paymentStatus?.status === 'CONFIRMED'
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                        : paymentStatus?.status === 'PENDING'
                        ? 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                        : paymentStatus?.status === 'EXPIRED'
                        ? 'border-red-500/20 bg-red-500/10 text-red-500'
                        : 'border-zinc-500/20 bg-zinc-500/10 text-zinc-500'
                    }`}>
                      {paymentStatus?.status === 'RECEIVED' || paymentStatus?.status === 'CONFIRMED' ? '✓ Pago' :
                       paymentStatus?.status === 'PENDING' ? '⏳ Aguardando Pagamento' :
                       paymentStatus?.status === 'EXPIRED' ? '✗ Expirado' :
                       paymentStatus?.status}
                    </div>
                  </div>
                  {paymentStatus?.url && (
                    <Button variant="outline" size="sm" asChild className="gap-2">
                      <a href={paymentStatus.url} target="_blank" rel="noopener noreferrer">
                        Abrir Link <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  )}
                </div>

                {/* AbacatePay PIX QRCode */}
                {paymentStatus?.brCode && (
                  <div className="rounded-xl border border-border bg-background p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <QrCode className="size-4 text-emerald-500" />
                      <span className="text-sm font-semibold">PIX — QR Code {proposal?.asaasPaymentId ? 'Asaas' : 'AbacatePay'}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      {/* QR Code image */}
                      {paymentStatus.brCodeBase64 && (
                        <div className="shrink-0">
                          <img
                            src={paymentStatus.brCodeBase64}
                            alt="QR Code PIX"
                            className="w-40 h-40 rounded-lg border border-border"
                          />
                        </div>
                      )}

                      {/* Copia-e-cola */}
                      <div className="flex-1 w-full space-y-2">
                        <p className="text-xs text-muted-foreground">Código copia e cola (PIX):</p>
                        <div className="relative">
                          <textarea
                            readOnly
                            value={paymentStatus.brCode}
                            rows={4}
                            className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 font-mono text-xs text-foreground/80 resize-none"
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => copyBrCode(paymentStatus.brCode!)}
                          className="gap-2 w-full"
                        >
                          {copiedBrCode
                            ? <><Check className="size-3.5 text-emerald-400" /> Copiado!</>
                            : <><Copy className="size-3.5" /> Copiar código PIX</>
                          }
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Items ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base">Itens da Proposta</CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCatalogItem}
              title="Adicionar produto/serviço cadastrado"
            >
              <Package className="h-4 w-4 mr-1.5" />
              Do catálogo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomItem}
              title="Adicionar item personalizado"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Novo item
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {items.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Nenhum item adicionado</p>
              <p className="text-xs mt-1">
                Use <strong>"Do catálogo"</strong> para selecionar um serviço já cadastrado,
                ou <strong>"Novo item"</strong> para digitar livremente.
              </p>
            </div>
          )}

          {items.map((item, idx) => (
            <div
              key={idx}
              className="border rounded-xl overflow-hidden"
            >
              {/* Row header: catalog selector OR custom label */}
              {item.mode === 'catalog' ? (
                <div className="flex items-center gap-2 px-3 pt-3">
                  <Package className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1">
                    <Select
                      value={item.serviceId ?? ''}
                      onValueChange={(val) => handleServiceSelect(idx, val)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Selecione um serviço/produto cadastrado..." />
                      </SelectTrigger>
                      <SelectContent>
                        {services.length === 0 && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            Nenhum serviço cadastrado
                          </div>
                        )}
                        {services.map((svc) => (
                          <SelectItem key={svc.id} value={svc.id}>
                            <span className="font-medium">{svc.name}</span>
                            <span className="ml-2 text-muted-foreground">
                              R$ {svc.price.toFixed(2)}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(idx)}
                    className="text-destructive hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 pt-3">
                  <PenLine className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground flex-1">Item personalizado</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(idx)}
                    className="text-destructive hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Fields grid */}
              <div className="grid grid-cols-12 gap-2 px-3 pb-3 pt-2 items-end">
                {/* Nome */}
                <div className="col-span-12 md:col-span-5 space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {item.mode === 'catalog' ? 'Nome (editável)' : 'Nome *'}
                  </Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(idx, { name: e.target.value })}
                    placeholder="Nome do produto ou serviço"
                    required
                  />
                </div>

                {/* Descrição */}
                <div className="col-span-12 md:col-span-3 space-y-1">
                  <Label className="text-xs text-muted-foreground">Descrição</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(idx, { description: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>

                {/* Quantidade */}
                <div className="col-span-5 md:col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground">Qtd.</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={item.quantityRaw}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (/^\d*$/.test(raw)) {
                        updateItem(idx, { quantityRaw: raw, quantity: parseInt(raw) || 0 });
                      }
                    }}
                  />
                </div>

                {/* Valor Unitário */}
                <div className="col-span-5 md:col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground">Val. Unit. (R$)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={item.unitPriceRaw}
                    onChange={(e) => {
                      const raw = e.target.value.replace(',', '.');
                      if (/^\d*\.?\d*$/.test(raw) || raw === '') {
                        updateItem(idx, { unitPriceRaw: raw, unitPrice: parseFloat(raw) || 0 });
                      }
                    }}
                    placeholder="0.00"
                  />
                </div>

                {/* Subtotal */}
                <div className="col-span-2 space-y-1 flex flex-col items-end">
                  <Label className="text-xs text-muted-foreground">Total</Label>
                  <span className="text-sm font-semibold py-2">
                    R$ {((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {items.length > 0 && (
            <div className="flex justify-end pt-2 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">
                  R$ {totalValue.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push('/propostas')}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Salvando...' : proposal?.id ? 'Salvar Alterações' : 'Criar Proposta'}
        </Button>
      </div>
    </form>
  );
}
