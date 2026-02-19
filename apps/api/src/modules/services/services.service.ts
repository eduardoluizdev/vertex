import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, createServiceDto: CreateServiceDto) {
    const { customerIds, ...data } = createServiceDto;
    return this.prisma.service.create({
      data: {
        ...data,
        companyId,
        customers: {
          connect: (customerIds ?? []).map((id) => ({ id })),
        },
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.service.findMany({
      where: { companyId },
      include: {
        customers: {
          include: {
            customer: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, companyId },
      include: {
        customers: {
          include: {
            customer: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async update(companyId: string, id: string, updateServiceDto: UpdateServiceDto) {
    await this.findOne(companyId, id);

    const { customerIds, name, description, price, recurrence } = updateServiceDto;
    return this.prisma.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(recurrence !== undefined && { recurrence }),
        ...(customerIds !== undefined && {
          customers: {
            set: customerIds.map((id) => ({ id })),
          },
        }),
      },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.service.delete({ where: { id } });
  }
}
