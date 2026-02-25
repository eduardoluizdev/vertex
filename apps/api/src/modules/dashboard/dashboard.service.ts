import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

const LAST_12_MONTHS = 12;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [totals, companiesCreatedAt, servicesByRecurrence, topCompanies] =
      await Promise.all([
        this.getTotals(),
        this.getCompaniesCreatedAt(),
        this.getServicesByRecurrence(),
        this.getTopCompaniesByCustomers(),
      ]);

    const companiesByMonth = this.aggregateCompaniesByMonth(companiesCreatedAt);

    return {
      totals,
      companiesByMonth,
      servicesByRecurrence: servicesByRecurrence.map((s) => ({
        recurrence: s.recurrence,
        count: s._count.id,
      })),
      topCompaniesByCustomers: topCompanies.map((c) => ({
        id: c.id,
        name: c.name,
        customersCount: c._count.customers,
      })),
    };
  }

  private async getTotals() {
    const [companies, customers, services] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.customer.count(),
      this.prisma.service.count(),
    ]);
    return { companies, customers, services };
  }

  private async getCompaniesCreatedAt() {
    const now = new Date();
    const startOfFirstMonth = new Date(
      now.getFullYear(),
      now.getMonth() - (LAST_12_MONTHS - 1),
      1,
      0,
      0,
      0,
      0,
    );

    return this.prisma.company.findMany({
      where: { createdAt: { gte: startOfFirstMonth } },
      select: { createdAt: true },
    });
  }

  private aggregateCompaniesByMonth(
    companies: { createdAt: Date }[],
  ): { month: string; count: number }[] {
    const now = new Date();
    const buckets = new Map<string, number>();

    // Last 12 months including current month
    for (let i = 0; i < LAST_12_MONTHS; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - (LAST_12_MONTHS - 1) + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets.set(key, 0);
    }

    for (const c of companies) {
      const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  }

  private async getServicesByRecurrence() {
    return this.prisma.service.groupBy({
      by: ['recurrence'],
      _count: { id: true },
    });
  }

  private async getTopCompaniesByCustomers() {
    return this.prisma.company.findMany({
      take: 5,
      orderBy: { customers: { _count: 'desc' } },
      select: {
        id: true,
        name: true,
        _count: { select: { customers: true } },
      },
    });
  }

  async getCompanyStats(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const [totals, customersCreatedAt, servicesByRecurrence, proposalsByStatus] = await Promise.all([
      this.getCompanyTotals(companyId),
      this.getCustomersCreatedAt(companyId),
      this.getServicesByRecurrenceForCompany(companyId),
      this.getProposalsByStatusForCompany(companyId),
    ]);

    const customersByMonth = this.aggregateByMonth(customersCreatedAt);

    return {
      totals,
      customersByMonth,
      servicesByRecurrence: servicesByRecurrence.map((s) => ({
        recurrence: s.recurrence,
        count: s._count.id,
      })),
      proposalsByStatus: proposalsByStatus.map((p) => ({
        status: p.status,
        count: p._count.id,
      })),
    };
  }

  private async getCompanyTotals(companyId: string) {
    const [customers, services] = await Promise.all([
      this.prisma.customer.count({ where: { companyId } }),
      this.prisma.service.count({ where: { companyId } }),
    ]);
    return { customers, services };
  }

  private async getCustomersCreatedAt(companyId: string) {
    const now = new Date();
    const startOfFirstMonth = new Date(
      now.getFullYear(),
      now.getMonth() - (LAST_12_MONTHS - 1),
      1,
      0,
      0,
      0,
      0,
    );
    return this.prisma.customer.findMany({
      where: { companyId, createdAt: { gte: startOfFirstMonth } },
      select: { createdAt: true },
    });
  }

  private aggregateByMonth(
    items: { createdAt: Date }[],
  ): { month: string; count: number }[] {
    const now = new Date();
    const buckets = new Map<string, number>();
    for (let i = 0; i < LAST_12_MONTHS; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - (LAST_12_MONTHS - 1) + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets.set(key, 0);
    }
    for (const item of items) {
      const key = `${item.createdAt.getFullYear()}-${String(item.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
    }
    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  }

  private async getServicesByRecurrenceForCompany(companyId: string) {
    return this.prisma.service.groupBy({
      by: ['recurrence'],
      where: { companyId },
      _count: { id: true },
    });
  }

  private async getProposalsByStatusForCompany(companyId: string) {
    return this.prisma.proposal.groupBy({
      by: ['status'],
      where: { companyId },
      _count: { id: true },
    });
  }
}
