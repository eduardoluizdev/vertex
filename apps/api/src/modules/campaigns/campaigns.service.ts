import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { MailService } from '../mail/mail.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CampaignStatus } from 'src/generated/prisma/enums';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async create(data: any) {
    return this.prisma.campaign.create({
      data: {
        name: data.name,
        subject: data.subject,
        content: data.content,
        targetAudience: data.targetAudience, // Add targetAudience
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        status: data.scheduledAt ? CampaignStatus.SCHEDULED : CampaignStatus.DRAFT,
      },
    });
  }

  async findAll() {
    return this.prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.campaign.findUniqueOrThrow({
      where: { id },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.campaign.update({
      where: { id },
      data: {
        name: data.name,
        subject: data.subject,
        content: data.content,
        targetAudience: data.targetAudience, // Add targetAudience
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        status: data.status, // Allow manual status update if needed
      },
    });
  }

  async remove(id: string) {
    return this.prisma.campaign.delete({
      where: { id },
    });
  }

  async sendCampaign(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) throw new Error('Campaign not found');
    if (campaign.status === CampaignStatus.SENT) throw new Error('Campaign already sent');

    // Update status to sending (or just leave as is until done)
    // For mass sending, using a queue is better, but for now we iterate directly.
    
    // Filter customers based on targetAudience
    const targetAudience = campaign.targetAudience;
    let customerFilter: any = {
      email: { not: '' },
    };

    if (targetAudience === 'ACTIVE_CLIENTS') {
      // Customers with at least one active subscription (recurrenceDay is set)
      // simplified logic: check if they have services
      customerFilter = {
        ...customerFilter,
        services: { some: {} },
      };
    } else if (targetAudience === 'INACTIVE_CLIENTS') {
      // Customers with no active services
      customerFilter = {
        ...customerFilter,
        services: { none: {} },
      };
    }

    const customers = await this.prisma.customer.findMany({
      where: customerFilter,
      select: { email: true, name: true },
    });

    this.logger.log(`Starting campaign ${campaign.name} for ${customers.length} customers.`);

    // Async process - don't await the loop if we want to return immediately? 
    // But better to process in background.
    this.processCampaignSending(campaign, customers);

    return { message: 'Campaign sending started' };
  }

  private async processCampaignSending(campaign: any, customers: any[]) {
    let successCount = 0;
    let failCount = 0;

    for (const customer of customers) {
      try {
        await this.mailService.sendHtmlEmail(customer.email, campaign.subject, campaign.content);
        successCount++;
      } catch (error) {
        failCount++;
        this.logger.error(`Failed to send campaign to ${customer.email}`, error);
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
      await this.sendCampaign(campaign.id);
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
        await this.mailService.sendHtmlEmail(sub.customer.email, subject, html);
      } catch (e) {
        this.logger.error(`Failed to send expiration email to ${sub.customer.email}`, e);
      }
    }
  }
}
