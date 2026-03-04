import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ApifyService } from './apify.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { CreateLeadListDto } from './dto/create-lead-list.dto';
import { LeadKanbanStage } from './dto/update-lead-stage.dto';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly apify: ApifyService,
    private readonly whatsapp: WhatsappService,
  ) {}

  async createLeadList(companyId: string, dto: CreateLeadListDto) {
    const leadList = await this.prisma.leadList.create({
      data: {
        name: dto.name,
        nicho: dto.nicho,
        cidade: dto.cidade,
        estado: dto.estado,
        pais: dto.pais,
        quantidade: dto.quantidade,
        companyId,
        status: 'PROCESSANDO',
      },
    });

    // Fire and forget — process in background
    void this.processLeadList(leadList.id, companyId, dto);

    return leadList;
  }

  private async processLeadList(leadListId: string, companyId: string, dto: CreateLeadListDto) {
    try {
      const items = await this.apify.searchGoogleMaps(
        companyId,
        dto.nicho,
        dto.cidade,
        dto.estado,
        dto.pais,
        dto.quantidade,
      );

      const leads = items.map((item) => ({
        leadListId,
        name: (item['title'] as string) ?? (item['name'] as string) ?? null,
        phone: (item['phone'] as string) ?? (item['phoneUnformatted'] as string) ?? null,
        email: (item['email'] as string) ?? ((item['emails'] as string[])?.[0]) ?? null,
        website: (item['website'] as string) ?? null,
        address: (item['address'] as string) ?? (item['fullAddress'] as string) ?? null,
        rating: typeof item['totalScore'] === 'number' ? (item['totalScore'] as number) : null,
        reviewCount: typeof item['reviewsCount'] === 'number' ? (item['reviewsCount'] as number) : null,
        category: (item['categoryName'] as string) ?? ((item['categories'] as string[])?.[0]) ?? null,
        rawData: item as object,
      }));

      if (leads.length > 0) {
        await this.prisma.lead.createMany({ data: leads });
      }

      await this.prisma.leadList.update({
        where: { id: leadListId },
        data: { status: 'CONCLUIDO' },
      });

      this.logger.log(`LeadList ${leadListId} processed: ${leads.length} leads imported`);
    } catch (error) {
      this.logger.error(`Failed to process LeadList ${leadListId}:`, error);
      await this.prisma.leadList.update({
        where: { id: leadListId },
        data: { status: 'FALHA' },
      });
    }
  }

  async findAll(companyId: string) {
    return this.prisma.leadList.findMany({
      where: { companyId },
      include: {
        _count: { select: { leads: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const leadList = await this.prisma.leadList.findFirst({
      where: { id, companyId },
      include: {
        leads: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!leadList) {
      throw new NotFoundException('Lead list not found');
    }

    return leadList;
  }

  async updateLeadStage(companyId: string, leadId: string, stage: LeadKanbanStage) {
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: leadId,
        leadList: { companyId },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return this.prisma.lead.update({
      where: { id: leadId },
      data: { stage },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.leadList.delete({ where: { id } });
  }

  async sendLeadWhatsapp(companyId: string, leadId: string, templateId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, leadList: { companyId } },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const template = await this.prisma.whatsappTemplate.findFirst({
      where: { id: templateId, companyId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const message = template.content
      .replace(/#NOME#/g, lead.name ?? '')
      .replace(/#TELEFONE#/g, lead.phone ?? '')
      .replace(/#EMAIL#/g, lead.email ?? '')
      .replace(/#ENDERECO#/g, lead.address ?? '')
      .replace(/#NICHO#/g, lead.category ?? '');

    const phone = lead.phone?.replace(/\D/g, '') ?? '';
    return this.whatsapp.sendMessage(companyId, phone, message);
  }
}
