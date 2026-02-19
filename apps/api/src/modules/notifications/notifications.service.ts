import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Recurrence } from 'src/generated/prisma/enums';


@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getExpiringServices(companyId: string) {
    const today = new Date();
    
    // Target dates: Tomorrow and Day After Tomorrow
    const targets = [1, 2].map((offset) => {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      return {
        date,
        day: date.getDate(),
        month: date.getMonth() + 1, // 1-indexed for comparison with potential 1-indexed DB storage
        year: date.getFullYear(),
      };
    });

    // We need to fetch subscriptions that match these days/months
    // For Monthly: matches day
    // For Yearly: matches day AND month
    
    // Prisma query might be complex with ORs on JSON or relations if we try to filter everything in DB entirely 
    // especially with the cross-relation check on Service.recurrence.
    // However, we can filter by companyId mainly and then filter in memory if the dataset isn't huge, 
    // OR construct a careful query.
    
    // Given the likely scale, let's try to filter as much as possible in DB.
    // We can fetch all active subscriptions for the company and filter in JS for precision and simplicity 
    // regarding the different recurrence types.
    
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        customer: {
          companyId,
        },
      },
      include: {
        customer: true,
        service: true,
      },
    });

    const expiring = subscriptions.filter((sub) => {
      // Check against each target date
      return targets.some((target) => {
        if (sub.service.recurrence === Recurrence.MONTHLY) {
          // Check if day matches
          return sub.recurrenceDay === target.day;
        }
        
        if (sub.service.recurrence === Recurrence.YEARLY) {
          // Check if day and month match
          return (
            sub.recurrenceDay === target.day &&
            sub.recurrenceMonth === target.month
          );
        }
        
        // For Weekly/Daily, logic would be different, but user request implies "renewed" which usually fits monthly/yearly.
        // If we want to support Weekly, we'd check day of week. 
        // Let's stick to the prompt's context which often implies monthly bills.
        // But if 'Daily', it expires every day? 'Weekly' matches day of week?
        // Let's assume Monthly/Yearly for now as per schema emphasis on recurrenceDay/Month.
        
        return false;
      });
    });

    // Map to a friendly response format
    return expiring.map((sub) => {
       // Find which target matched to calculate "renewing in"
       const matchedTarget = targets.find(t => {
         if (sub.service.recurrence === Recurrence.MONTHLY) return sub.recurrenceDay === t.day;
         if (sub.service.recurrence === Recurrence.YEARLY) return sub.recurrenceDay === t.day && sub.recurrenceMonth === t.month;
         return false;
       });
       
       const daysUntil = matchedTarget ? matchedTarget.date.getDate() - today.getDate() : 0; // rough approx, actually better to use difference in ms or just return the date.

       const renewalDate = matchedTarget!.date;

       return {
         id: sub.id,
         customerName: sub.customer.name,
         customerId: sub.customer.id,
         serviceName: sub.service.name,
         servicePrice: sub.service.price,
         renewalDate: renewalDate.toISOString(),
         daysUntil: Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
       };
    });
  }
}
