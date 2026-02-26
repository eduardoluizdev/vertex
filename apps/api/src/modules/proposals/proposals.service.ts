import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { EasypanelService } from '../easypanel/easypanel.service';

const PROPOSAL_PROVIDER = 'proposal';

@Injectable()
export class ProposalsService {
  private readonly logger = new Logger(ProposalsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
    private readonly easypanelService: EasypanelService,
  ) {}

  private async nextNumber(companyId: string): Promise<number> {
    const last = await this.prisma.proposal.findFirst({
      where: { companyId },
      orderBy: { number: 'desc' },
      select: { number: true },
    });
    return (last?.number ?? 0) + 1;
  }

  private calcTotal(items: { quantity: number; unitPrice: number }[]): number {
    return items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  }

  private async generateAsaasPaymentLink(
    companyId: string,
    title: string,
    value: number,
    description: string,
  ): Promise<{ url: string; id: string } | null> {
    const integration = await this.prisma.integrationConfig.findFirst({
      where: { provider: 'asaas', companyId },
    });
    const cfg = (integration?.config as any) ?? {};
    const apiKey = cfg?.apiKey;
    const isSandbox = cfg?.isSandbox ?? false;

    if (!apiKey) return null;

    const baseUrl = isSandbox ? 'https://sandbox.asaas.com/api/v3' : 'https://api.asaas.com/v3';

    try {
      // paymentLinks don't require a customer ID — the customer opens the URL and chooses
      // billingType UNDEFINED lets them pick: PIX, credit card or boleto
      const response = await fetch(`${baseUrl}/paymentLinks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', access_token: apiKey },
        body: JSON.stringify({
          billingType: 'UNDEFINED',
          chargeType: 'DETACHED',
          name: title,
          description,
          value,
          dueDateLimitDays: 10,
        }),
      });

      if (!response.ok) {
        let errData;
        try { errData = await response.json(); } catch {}
        this.logger.error(`Error creating Asaas payment link: ${JSON.stringify(errData)}`);
        return null;
      }

      const data = await response.json();
      this.logger.log(`Asaas payment link created: id=${data.id} url=${data.url}`);
      return { url: data.url, id: data.id };
    } catch (err: any) {
      this.logger.error(`Failed to generate Asaas payment link: ${err.message}`);
      return null;
    }
  }



  private async generateAbacatePayBillingLink(
    companyId: string,
    customerId: string,
    totalValue: number,
    description: string,
  ): Promise<{ url: string; id: string } | null> {
    const integration = await this.prisma.integrationConfig.findFirst({
      where: { provider: 'abacatepay', companyId },
    });
    const cfg = (integration?.config as any) ?? {};
    const apiKey = cfg?.apiKey;
    const isSandbox = cfg?.isSandbox ?? false;

    if (!apiKey) return null;

    // Get customer data
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      this.logger.error(`Customer not found: ${customerId}`);
      return null;
    }

    // Get the proposal web URL for returnUrl/completionUrl
    const proposalIntegration = await this.prisma.integrationConfig.findFirst({
      where: { provider: PROPOSAL_PROVIDER, companyId },
    });
    const proposalCfg = (proposalIntegration?.config ?? {}) as Record<string, string>;
    const webUrl = proposalCfg.webUrl || 'https://app.vertexhub.com.br';

    const baseUrl = 'https://api.abacatepay.com/v1';
    const priceInCents = Math.round(totalValue * 100);

    this.logger.log(`Creating AbacatePay billing link: amount=${priceInCents} cents, devMode=${isSandbox}`);

    try {
      const response = await fetch(`${baseUrl}/billing/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          frequency: 'ONE_TIME',
          methods: ['PIX', 'CARD'],
          devMode: isSandbox,
          products: [{
            externalId: `proposal-${Date.now()}`,
            name: description,
            quantity: 1,
            price: priceInCents,
          }],
          returnUrl: `${webUrl}/propostas`,
          completionUrl: `${webUrl}/propostas`,
          customer: {
            email: customer.email,
            name: customer.name,
            ...(customer.phone && { cellphone: customer.phone }),
            ...(customer.document && { taxId: customer.document }),
          },
        }),
      });

      if (!response.ok) {
        let errData;
        try { errData = await response.json(); } catch {}
        this.logger.error(`Error creating AbacatePay billing link: ${JSON.stringify(errData)}`);
        return null;
      }

      const json = await response.json();
      const data = json.data;
      if (!data?.url || !data?.id) {
        this.logger.error(`AbacatePay billing response missing url or id: ${JSON.stringify(json)}`);
        return null;
      }

      this.logger.log(`AbacatePay billing link created: id=${data.id} url=${data.url}`);
      return { url: data.url, id: data.id };
    } catch (err: any) {
      this.logger.error(`Failed to create AbacatePay billing link: ${err.message}`);
      return null;
    }
  }
  async create(companyId: string, dto: any) {
    const number = await this.nextNumber(companyId);
    const items = dto.items ?? [];
    const totalValue = this.calcTotal(items);

    let asaasPaymentUrl: string | null = null;
    let asaasPaymentId: string | null = null;
    let asaasBrCode: string | null = null;
    let asaasBrCodeBase64: string | null = null;
    let abacatePayUrl: string | null = null;
    let abacatePayId: string | null = null;
    let abacatePayBrCode: string | null = null;
    let abacatePayBrCodeBase64: string | null = null;

    if (totalValue > 0 && dto.paymentProvider && dto.paymentProvider !== 'none') {
      if (dto.paymentProvider === 'asaas') {
        const asaasResult = await this.generateAsaasPaymentLink(
          companyId,
          `Proposta #${number} - ${dto.title}`,
          totalValue,
          `Pagamento da proposta #${number}`,
        );
        if (asaasResult) {
          asaasPaymentId = asaasResult.id;
          asaasPaymentUrl = asaasResult.url;
        }
      } else if (dto.paymentProvider === 'abacatepay') {
        const billingResult = await this.generateAbacatePayBillingLink(
          companyId,
          dto.customerId,
          totalValue,
          `Proposta #${number} - ${dto.title}`
        );
        if (billingResult) {
          abacatePayId = billingResult.id;
          abacatePayUrl = billingResult.url;
        }
      }
    }

    return this.prisma.proposal.create({
      data: {
        number,
        title: dto.title,
        status: (dto.status as any) ?? 'DRAFT',
        proposalDate: dto.proposalDate ? new Date(dto.proposalDate) : new Date(),
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : null,
        notes: dto.notes,
        totalValue,
        asaasPaymentUrl,
        asaasPaymentId,
        asaasBrCode,
        asaasBrCodeBase64,
        abacatePayUrl,
        abacatePayId,
        abacatePayBrCode,
        abacatePayBrCodeBase64,
        customerId: dto.customerId,
        companyId,
        items: {
          create: items.map((item: any) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true, customer: true },
    });
  }

  async findAll(
    companyId: string,
    filters?: {
      customerId?: string;
      status?: string;
      followUpDate?: string;
    },
  ) {
    const where: any = { companyId };

    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.status) where.status = filters.status;
    if (filters?.followUpDate) {
      const date = new Date(filters.followUpDate);
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.followUpDate = { gte: start, lte: end };
    }

    return this.prisma.proposal.findMany({
      where,
      include: { customer: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findFollowUpToday(companyId: string) {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return this.prisma.proposal.findMany({
      where: {
        companyId,
        followUpDate: { gte: start, lte: end },
      },
      include: { customer: true },
      orderBy: { followUpDate: 'asc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const proposal = await this.prisma.proposal.findFirst({
      where: { id, companyId },
      include: { items: true, customer: true, company: true },
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    return proposal;
  }

  async findByToken(token: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { publicToken: token },
      include: { items: true, customer: true, company: true },
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    return proposal;
  }

  async update(companyId: string, id: string, dto: any) {
    const proposal = await this.findOne(companyId, id);
    if (proposal.status === 'APPROVED' || proposal.status === 'REJECTED') {
      throw new BadRequestException('Não é possível alterar uma proposta já aprovada ou reprovada.');
    }

    const items = dto.items ?? [];
    const totalValue = items.length > 0 ? this.calcTotal(items) : undefined;

    let asaasPaymentUrl = proposal.asaasPaymentUrl;
    let asaasPaymentId = proposal.asaasPaymentId;
    let asaasBrCode = (proposal as any).asaasBrCode as string | null;
    let asaasBrCodeBase64 = (proposal as any).asaasBrCodeBase64 as string | null;
    let abacatePayUrl = proposal.abacatePayUrl;
    let abacatePayId = proposal.abacatePayId;
    let abacatePayBrCode = (proposal as any).abacatePayBrCode as string | null;
    let abacatePayBrCodeBase64 = (proposal as any).abacatePayBrCodeBase64 as string | null;

    const currentProvider = proposal.abacatePayId ? 'abacatepay' : proposal.asaasPaymentId ? 'asaas' : 'none';
    const forceRegenerate = dto.paymentProvider !== undefined && dto.paymentProvider !== currentProvider;

    if ((totalValue !== undefined && totalValue !== proposal.totalValue) || forceRegenerate) {
      asaasPaymentUrl = null;
      asaasPaymentId = null;
      asaasBrCode = null;
      asaasBrCodeBase64 = null;
      abacatePayUrl = null;
      abacatePayId = null;
      abacatePayBrCode = null;
      abacatePayBrCodeBase64 = null;

      const targetProvider = dto.paymentProvider !== undefined ? dto.paymentProvider : currentProvider;
      const targetValue = totalValue !== undefined ? totalValue : proposal.totalValue;

      if (targetValue > 0 && targetProvider !== 'none') {
        if (targetProvider === 'asaas') {
          const asaasResult = await this.generateAsaasPaymentLink(
            companyId,
            `Proposta #${proposal.number} - ${dto.title || proposal.title}`,
            targetValue,
            `Pagamento da proposta #${proposal.number}`,
          );
          if (asaasResult) {
            asaasPaymentId = asaasResult.id;
            asaasPaymentUrl = asaasResult.url;
          }
        } else if (targetProvider === 'abacatepay') {
          const billingResult = await this.generateAbacatePayBillingLink(
            companyId,
            dto.customerId || proposal.customerId,
            targetValue,
            `Proposta #${proposal.number} - ${dto.title || proposal.title}`
          );
          if (billingResult) {
            abacatePayId = billingResult.id;
            abacatePayUrl = billingResult.url;
          }
        }
      }
    }

    return this.prisma.proposal.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.status && { status: dto.status as any }),
        ...(dto.proposalDate && { proposalDate: new Date(dto.proposalDate) }),
        ...(dto.followUpDate !== undefined && {
          followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : null,
        }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.customerId && { customerId: dto.customerId }),
        ...(totalValue !== undefined && { totalValue }),
        ...(asaasPaymentUrl !== undefined && { asaasPaymentUrl }),
        ...(asaasPaymentId !== undefined && { asaasPaymentId }),
        asaasBrCode,
        asaasBrCodeBase64,
        ...(abacatePayUrl !== undefined && { abacatePayUrl }),
        ...(abacatePayId !== undefined && { abacatePayId }),
        abacatePayBrCode,
        abacatePayBrCodeBase64,
        ...(items.length > 0 && {
          items: {
            deleteMany: {},
            create: items.map((item: any) => ({
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
            })),
          },
        }),
      },
      include: { items: true, customer: true },
    });
  }

  async updateStatus(companyId: string, id: string, status: string) {
    const proposal = await this.findOne(companyId, id);
    return this.prisma.proposal.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async updateStatusByToken(token: string, status: string) {
    const proposal = await this.findByToken(token);
    if (proposal.status === 'APPROVED' || proposal.status === 'REJECTED') {
      throw new BadRequestException('Esta proposta já foi aprovada ou reprovada.');
    }
    return this.prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: status as any },
    });
  }

  async getPaymentStatus(companyId: string, id: string): Promise<{ status: string, url: string | null, brCode?: string | null, brCodeBase64?: string | null }> {
    const proposal = await this.prisma.proposal.findFirst({
      where: { id, companyId },
    });

    if (!proposal) {
      throw new NotFoundException('Proposta não encontrada');
    }

    if (proposal.abacatePayId) {
      const integration = await this.prisma.integrationConfig.findFirst({
        where: { provider: 'abacatepay', companyId },
      });
      const cfg = (integration?.config as any) ?? {};
      const apiKey = cfg?.apiKey;

      if (!apiKey) {
        return { status: 'NOT_GENERATED', url: proposal.abacatePayUrl };
      }

      const baseUrl = 'https://api.abacatepay.com/v1';

      try {
        // abacatePayId now stores a billing ID — look it up in /billing/list
        const response = await fetch(`${baseUrl}/billing/list`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });

        if (!response.ok) {
          this.logger.warn(`AbacatePay billing list HTTP ${response.status}`);
          return { status: 'ERROR', url: proposal.abacatePayUrl };
        }

        const json = await response.json();
        const billings: any[] = json.data ?? [];
        const billing = billings.find((b: any) => b.id === proposal.abacatePayId);

        // AbacatePay billing statuses: PENDING, PAID, CANCELLED, EXPIRED
        const rawStatus: string = billing?.status ?? 'PENDING';
        // Map PAID → RECEIVED for frontend consistency
        const mappedStatus = rawStatus === 'PAID' ? 'RECEIVED' : rawStatus;

        return { status: mappedStatus, url: proposal.abacatePayUrl };
      } catch (err: any) {
        this.logger.error(`Failed to fetch AbacatePay billing status: ${err.message}`);
        return { status: 'ERROR', url: proposal.abacatePayUrl };
      }
    }



    if (proposal.asaasPaymentId) {
      const integration = await this.prisma.integrationConfig.findFirst({
        where: { provider: 'asaas', companyId },
      });
      const cfg = (integration?.config as any) ?? {};
      const apiKey = cfg?.apiKey;
      const isSandbox = cfg?.isSandbox ?? false;

      if (!apiKey) {
        return { status: 'NOT_GENERATED', url: proposal.asaasPaymentUrl };
      }

      const baseUrl = isSandbox ? 'https://sandbox.asaas.com/api/v3' : 'https://api.asaas.com/v3';

      try {
        // asaasPaymentId now stores a paymentLink ID — list payments associated with it
        const response = await fetch(
          `${baseUrl}/payments?paymentLink=${encodeURIComponent(proposal.asaasPaymentId)}`,
          { method: 'GET', headers: { access_token: apiKey } },
        );

        if (!response.ok) {
          this.logger.warn(`Asaas payment list HTTP ${response.status} for link=${proposal.asaasPaymentId}`);
          return { status: 'ERROR', url: proposal.asaasPaymentUrl };
        }

        const data = await response.json();
        const payments: any[] = data.data ?? [];

        if (payments.length === 0) {
          // No payment made yet through this link
          return { status: 'PENDING', url: proposal.asaasPaymentUrl };
        }

        // Use the most recent payment status
        const latest = payments[0];
        // Asaas statuses: PENDING, RECEIVED, CONFIRMED, OVERDUE, REFUNDED, ...
        return { status: latest.status ?? 'PENDING', url: proposal.asaasPaymentUrl };
      } catch (err: any) {
        this.logger.error(`Failed to fetch Asaas payment status: ${err.message}`);
        return { status: 'ERROR', url: proposal.asaasPaymentUrl };
      }
    }


    return { status: 'NOT_GENERATED', url: null };
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.proposal.delete({ where: { id } });
  }

  async sendWhatsapp(companyId: string, id: string, isFollowUp: boolean = false) {
    const proposal = await this.findOne(companyId, id);
    
    // Para follow-up, permite se o status estiver SENT, DRAFT, etc. 
    // Se quiser bloquear follow-up em APPROVED/REJECTED, a regra é igual.
    if (proposal.status === 'APPROVED' || proposal.status === 'REJECTED') {
      throw new BadRequestException('Não é possível reenviar mensagem para uma proposta já aprovada ou reprovada.');
    }

    if (!proposal.customer.phone) {
      throw new Error('Cliente sem número de telefone');
    }

    const tplRecord = await this.prisma.proposalWhatsappTemplate.findUnique({
      where: { companyId },
    });

    let template = '';
    if (isFollowUp) {
      template = tplRecord?.followUpTemplate || 'Olá #CLIENTE#, tudo bem? Gostaria de saber se conseguiu avaliar nossa proposta nº #PROPOSTA# no valor de R$ #VALOR#. Qualquer dúvida estou à disposição!';
    } else {
      template = tplRecord?.template || 'Olá #CLIENTE#, segue nossa proposta nº #PROPOSTA# no valor de R$ #VALOR#. Acesse: #LINK#';
    }

    const integration = await this.prisma.integrationConfig.findFirst({
      where: { provider: PROPOSAL_PROVIDER, companyId },
    });
    const cfg = (integration?.config ?? {}) as Record<string, string>;
    const webUrl = cfg.webUrl;
    if (!webUrl) {
      throw new BadRequestException(
        'URL pública não configurada. Configure em Configurações → Propostas.',
      );
    }

    const publicLink = `${webUrl}/p/${proposal.publicToken}`;
    const paymentLink = (proposal as any).abacatePayBrCode || proposal.asaasPaymentUrl || 'Pendente / Não gerado';

    const message = template
      .replace(/#PROPOSTA#/g, String(proposal.number))
      .replace(/#CLIENTE#/g, proposal.customer.name)
      .replace(/#VALOR#/g, proposal.totalValue.toFixed(2))
      .replace(/#LINK#/g, publicLink)
      .replace(/#LINK_PAGAMENTO#/g, paymentLink)
      .replace(/#EMPRESA#/g, proposal.company?.name || '');

    const rawPhone = proposal.customer.phone.replace(/\D/g, '');
    const phone =
      rawPhone.length === 10 || rawPhone.length === 11
        ? `55${rawPhone}`
        : rawPhone;

    await this.whatsappService.sendMessage(companyId, phone, message);

    if (!isFollowUp) {
      // Marcar como enviado apenas no envio original (opcional)
      await this.prisma.proposal.update({
        where: { id: proposal.id },
        data: { status: 'SENT' as any },
      });
    }

    return { ok: true };
  }

  async getWhatsappTemplate(companyId: string) {
    return this.prisma.proposalWhatsappTemplate.findUnique({
      where: { companyId },
    });
  }

  async upsertWhatsappTemplate(companyId: string, template: string, followUpTemplate?: string) {
    return this.prisma.proposalWhatsappTemplate.upsert({
      where: { companyId },
      update: { 
        template,
        ...(followUpTemplate !== undefined && { followUpTemplate }),
      },
      create: { 
        companyId, 
        template,
        ...(followUpTemplate !== undefined && { followUpTemplate }),
      },
    });
  }

  async getProposalIntegration(companyId: string) {
    const row = await this.prisma.integrationConfig.findFirst({
      where: { provider: PROPOSAL_PROVIDER, companyId },
    });
    const cfg = (row?.config ?? {}) as Record<string, string>;
    return { webUrl: cfg.webUrl ?? '' };
  }

  async upsertProposalIntegration(companyId: string, webUrl: string) {
    const existing = await this.prisma.integrationConfig.findFirst({
      where: { provider: PROPOSAL_PROVIDER, companyId },
    });
    const data = { webUrl } as any;

    try {
      if (webUrl) {
         const url = new URL(webUrl.startsWith('http') ? webUrl : `https://${webUrl}`);
         await this.easypanelService.addDomainToService('vertex', 'web', url.hostname);
      }
    } catch (e: any) {
      this.logger.error(`Error adding domain to Easypanel: ${e.message}`, e.stack);
    }
    if (existing) {
      await this.prisma.integrationConfig.update({
        where: { id: existing.id },
        data: { config: data },
      });
    } else {
      await this.prisma.integrationConfig.create({
        data: {
          provider: PROPOSAL_PROVIDER,
          companyId,
          name: 'Propostas',
          config: data,
          enabled: true,
        },
      });
    }
    return { webUrl };
  }
}
