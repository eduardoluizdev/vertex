import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, createCustomerDto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { email: createCustomerDto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const { serviceIds, ...customerData } = createCustomerDto;

    return this.prisma.customer.create({
      data: {
        ...customerData,
        companyId,
        ...(serviceIds && {
          services: {
            connect: serviceIds.map((id) => ({ id })),
          },
        }),
      },
      include: {
        services: true,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId },
      include: {
        _count: {
          select: { services: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
      include: {
        services: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(companyId: string, id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.findOne(companyId, id);

    if (updateCustomerDto.email) {
      const existing = await this.prisma.customer.findUnique({
        where: { email: updateCustomerDto.email },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Email already registered');
      }
    }

    const { serviceIds, ...customerData } = updateCustomerDto;

    return this.prisma.customer.update({
      where: { id },
      data: {
        ...customerData,
        ...(serviceIds !== undefined && {
          services: {
            set: serviceIds.map((serviceId) => ({ id: serviceId })),
          },
        }),
      },
      include: {
        services: true,
      },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.customer.delete({ where: { id } });
  }
}
