import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { MailService } from '../mail/mail.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CampaignStatus } from 'src/generated/prisma/enums';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly whatsappService: WhatsappService,
  ) {}

  async create(companyId: string, data: any) {
    return this.prisma.campaign.create({
      data: {
        name: data.name,
        subject: data.subject,
        content: data.content,
        targetAudience: data.targetAudience,
        channels: data.channels || ['EMAIL'],
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        status: data.scheduledAt ? CampaignStatus.SCHEDULED : CampaignStatus.DRAFT,
        companyId,
        ...(data.targetAudience === 'SPECIFIC_CLIENTS' && data.customerIds?.length > 0 && {
          customers: {
            connect: data.customerIds.map((id: string) => ({ id })),
          },
        }),
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.campaign.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    return this.prisma.campaign.findUniqueOrThrow({
      where: { id, companyId },
    });
  }

  async update(companyId: string, id: string, data: any) {
    return this.prisma.campaign.update({
      where: { id, companyId },
      data: {
        name: data.name,
        subject: data.subject,
        content: data.content,
        targetAudience: data.targetAudience,
        channels: data.channels || undefined,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        status: data.status,
        ...(data.targetAudience === 'SPECIFIC_CLIENTS' && data.customerIds && {
          customers: {
            set: data.customerIds.map((custId: string) => ({ id: custId })),
          },
        }),
        ...(data.targetAudience !== 'SPECIFIC_CLIENTS' && {
          customers: {
            set: [],
          },
        }),
      },
    });
  }

  async remove(companyId: string, id: string) {
    return this.prisma.campaign.delete({
      where: { id, companyId },
    });
  }

  async sendCampaign(companyId: string, id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id, companyId },
    });

    if (!campaign) throw new Error('Campaign not found');
    if (campaign.status === CampaignStatus.SENT) throw new Error('Campaign already sent');

    // Update status to sending (or just leave as is until done)
    // For mass sending, using a queue is better, but for now we iterate directly.
    
    // Filter customers based on targetAudience
    // Filter customers based on targetAudience AND companyId
    const targetAudience = campaign.targetAudience;
    let customers: any[] = [];

    if (targetAudience === 'SPECIFIC_CLIENTS') {
      const campaignWithCustomers = await this.prisma.campaign.findUnique({
        where: { id },
        include: { customers: { select: { email: true, name: true, phone: true } } }
      });
      customers = campaignWithCustomers?.customers || [];
    } else {
      let customerFilter: any = {
        companyId: companyId,
      };

      const hasEmail = campaign.channels?.includes('EMAIL') ?? true;
      const hasWhatsapp = campaign.channels?.includes('WHATSAPP');

      if (hasEmail && hasWhatsapp) {
        customerFilter.OR = [{ email: { not: '' } }, { phone: { not: null } }];
      } else if (hasEmail) {
        customerFilter.email = { not: '' };
      } else if (hasWhatsapp) {
        customerFilter.phone = { not: null };
      }

      if (targetAudience === 'ACTIVE_CLIENTS') {
        customerFilter = {
          ...customerFilter,
          services: { some: {} },
        };
      } else if (targetAudience === 'INACTIVE_CLIENTS') {
        customerFilter = {
          ...customerFilter,
          services: { none: {} },
        };
      }

      customers = await this.prisma.customer.findMany({
        where: customerFilter,
        select: { email: true, name: true, phone: true },
      });
    }

    this.logger.log(`Starting campaign ${campaign.name} for ${customers.length} customers.`);

    // Async process - don't await the loop if we want to return immediately? 
    // But better to process in background.
    this.processCampaignSending(campaign, customers);

    return { message: 'Campaign sending started' };
  }

  private async processCampaignSending(campaign: any, customers: any[]) {
    let successCount = 0;
    let failCount = 0;

    const useEmail = campaign.channels?.includes('EMAIL') ?? true;
    const useWhatsapp = campaign.channels?.includes('WHATSAPP');

    for (const customer of customers) {
      try {
        let sentAny = false;

        if (useEmail && customer.email) {
          await this.mailService.sendHtmlEmail(customer.email, campaign.subject, campaign.content, campaign.companyId);
          sentAny = true;
        }

        if (useWhatsapp && customer.phone) {
          // Strip HTML tags for WhatsApp formatting
          // Also optionally handle <br> or <p> by replacing with newlines first
          const plainTextContent = campaign.content
            .replace(/<br\s*[\/]?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<[^>]*>?/gm, '')
            .trim();
            
          await this.whatsappService.sendMessage(campaign.companyId, customer.phone, plainTextContent);
          sentAny = true;
        }

        if (sentAny) {
          successCount++;
        } else {
          failCount++;
          this.logger.warn(`Skipped customer ${customer.id}: missing contact info for selected channels`);
        }
      } catch (error) {
        failCount++;
        this.logger.error(`Failed to send campaign to ${customer.email || customer.phone}`, error);
      }
      // Simple rate limiting
      await new Promise(r => setTimeout(r, 100)); // 10 emails/sec max
    }

    await this.prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: CampaignStatus.SENT,
        sentAt: new Date(),
      },
    });

    this.logger.log(`Campaign ${campaign.name} finished. Success: ${successCount}, Fail: ${failCount}`);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledCampaigns() {
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        status: CampaignStatus.SCHEDULED,
        scheduledAt: {
          lte: new Date(),
        },
      },
    });

    for (const campaign of campaigns) {
      this.logger.log(`Processing scheduled campaign: ${campaign.name}`);
      await this.sendCampaign(campaign.companyId, campaign.id);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleExpirationNotifications() {
    this.logger.log('Checking for expiring subscriptions...');
    
    // Config: Notify 2 days before expiration
    const daysBefore = 2;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysBefore);
    
    const targetDay = targetDate.getDate();
    const targetMonth = targetDate.getMonth() + 1; // 1-indexed
    
    // Find subscriptions expiring in 'daysBefore' days
    // This logic mimics NotificationsService but targeting specific date match
    // Optimization: Filter in DB as much as possible, or fetch all active and filter.
    // Since we need to check recurrence types, let's fetch active subs
    
    const subscriptions = await this.prisma.subscription.findMany({
      include: {
        customer: true,
        service: true,
      },
      where: {
        customer: { email: { not: '' } } // Only those with email
      }
    });

    const expiring = subscriptions.filter(sub => {
       const recurrence = sub.service.recurrence;
       if (recurrence === 'MONTHLY') {
         return sub.recurrenceDay === targetDay;
       }
       if (recurrence === 'YEARLY') {
         return sub.recurrenceDay === targetDay && sub.recurrenceMonth === targetMonth;
       }
       return false;
    });

    this.logger.log(`Found ${expiring.length} expiring subscriptions.`);

    for (const sub of expiring) {
      if (!sub.customer.email) continue;
      
      const subject = `Renovação de Serviço: ${sub.service.name}`;
      const html = `
        <h1>Olá ${sub.customer.name},</h1>
        <p>Seu serviço <strong>${sub.service.name}</strong> está prestes a vencer em ${daysBefore} dias.</p>
        <p>Valor: R$ ${sub.service.price}</p>
        <p>Por favor, realize o pagamento para continuar usufruindo dos benefícios.</p>
        <p>Atenciosamente,<br/>Equipe VertexHub</p>
      `;

      try {
        await this.mailService.sendHtmlEmail(sub.customer.email, subject, html, sub.customer.companyId);
      } catch (e) {
        this.logger.error(`Failed to send expiration email to ${sub.customer.email}`, e);
      }
    }
  }
}
