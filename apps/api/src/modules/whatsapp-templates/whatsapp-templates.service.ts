import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class WhatsappTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, category?: string) {
    return this.prisma.whatsappTemplate.findMany({
      where: {
        companyId,
        ...(category ? { category: category as any } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(companyId: string, dto: CreateTemplateDto) {
    return this.prisma.whatsappTemplate.create({
      data: {
        name: dto.name,
        content: dto.content,
        category: dto.category as any,
        companyId,
      },
    });
  }

  async update(companyId: string, id: string, dto: Partial<CreateTemplateDto>) {
    const template = await this.prisma.whatsappTemplate.findFirst({
      where: { id, companyId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return this.prisma.whatsappTemplate.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.category !== undefined ? { category: dto.category as any } : {}),
      },
    });
  }

  async remove(companyId: string, id: string) {
    const template = await this.prisma.whatsappTemplate.findFirst({
      where: { id, companyId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    await this.prisma.whatsappTemplate.delete({ where: { id } });
  }
}
