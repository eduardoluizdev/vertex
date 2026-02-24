import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

const PROPOSAL_PROVIDER = 'proposal';

@Injectable()
export class ProposalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
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

  async create(companyId: string, dto: any) {
    const number = await this.nextNumber(companyId);
    const items = dto.items ?? [];
    const totalValue = this.calcTotal(items);

    return this.prisma.proposal.create({
      data: {
        number,
        title: dto.title,
        status: (dto.status as any) ?? 'DRAFT',
        proposalDate: dto.proposalDate ? new Date(dto.proposalDate) : new Date(),
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : null,
        notes: dto.notes,
        totalValue,
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
      include: { items: true, customer: true },
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
    await this.findOne(companyId, id);

    const items = dto.items ?? [];
    const totalValue = items.length > 0 ? this.calcTotal(items) : undefined;

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
    await this.findOne(companyId, id);
    return this.prisma.proposal.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async updateStatusByToken(token: string, status: string) {
    const proposal = await this.findByToken(token);
    return this.prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: status as any },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.proposal.delete({ where: { id } });
  }

  async sendWhatsapp(companyId: string, id: string) {
    const proposal = await this.findOne(companyId, id);
    if (!proposal.customer.phone) {
      throw new Error('Cliente sem número de telefone');
    }

    const tplRecord = await this.prisma.proposalWhatsappTemplate.findUnique({
      where: { companyId },
    });

    const defaultTemplate =
      'Olá #CLIENTE#, segue nossa proposta nº #PROPOSTA# no valor de R$ #VALOR#. Acesse: #LINK#';
    const template = tplRecord?.template ?? defaultTemplate;

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
    const message = template
      .replace(/#PROPOSTA#/g, String(proposal.number))
      .replace(/#CLIENTE#/g, proposal.customer.name)
      .replace(/#VALOR#/g, proposal.totalValue.toFixed(2))
      .replace(/#LINK#/g, publicLink);

    const rawPhone = proposal.customer.phone.replace(/\D/g, '');
    const phone =
      rawPhone.length === 10 || rawPhone.length === 11
        ? `55${rawPhone}`
        : rawPhone;

    await this.whatsappService.sendMessage(companyId, phone, message);

    // Marcar como enviado
    await this.prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: 'SENT' as any },
    });

    return { ok: true };
  }

  async getWhatsappTemplate(companyId: string) {
    return this.prisma.proposalWhatsappTemplate.findUnique({
      where: { companyId },
    });
  }

  async upsertWhatsappTemplate(companyId: string, template: string) {
    return this.prisma.proposalWhatsappTemplate.upsert({
      where: { companyId },
      update: { template },
      create: { companyId, template },
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
