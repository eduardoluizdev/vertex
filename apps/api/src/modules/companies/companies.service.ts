import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto, userId: string) {
    const existing = await this.prisma.company.findUnique({
      where: { email: createCompanyDto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const company = await this.prisma.company.create({
      data: createCompanyDto,
    });

    await this.prisma.userCompany.create({
      data: { userId, companyId: company.id },
    });

    return company;
  }

  async findAll(userId: string, role: string) {
    const where =
      role === 'ADMIN' ? {} : { users: { some: { userId } } };

    return this.prisma.company.findMany({
      where,
      include: {
        _count: {
          select: { customers: true, services: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        customers: true,
        services: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (role !== 'ADMIN') {
      const access = await this.prisma.userCompany.findUnique({
        where: { userId_companyId: { userId, companyId: id } },
      });
      if (!access) {
        throw new ForbiddenException('Acesso negado a esta empresa.');
      }
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, userId: string, role: string) {
    await this.findOne(id, userId, role);

    if (updateCompanyDto.email) {
      const existing = await this.prisma.company.findUnique({
        where: { email: updateCompanyDto.email },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Email already registered');
      }
    }

    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async remove(id: string, userId: string, role: string) {
    await this.findOne(id, userId, role);
    await this.prisma.company.delete({ where: { id } });
  }
}
