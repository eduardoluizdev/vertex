import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';

const CATEGORY_VARS: Record<string, string[]> = {
  LEAD: ['#NOME#', '#TELEFONE#', '#EMAIL#', '#ENDERECO#', '#NICHO#', '#EMPRESA#'],
  PROPOSTA_CRIADA: ['#PROPOSTA#', '#CLIENTE#', '#VALOR#', '#LINK#', '#LINK_PAGAMENTO#', '#EMPRESA#'],
  PROPOSTA_ACEITA: ['#PROPOSTA#', '#CLIENTE#', '#VALOR#', '#LINK#', '#LINK_PAGAMENTO#', '#EMPRESA#'],
  CAMPANHA: ['#NOME#', '#EMPRESA#'],
};

const CATEGORY_LABELS: Record<string, string> = {
  LEAD: 'abordagem de lead',
  PROPOSTA_CRIADA: 'notificação de proposta criada',
  PROPOSTA_ACEITA: 'confirmação de proposta aceita',
  CAMPANHA: 'campanha de marketing',
};

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

  async generateContent(companyId: string, category: string, name: string, context?: string): Promise<{ content: string }> {
    const row = await this.prisma.integrationConfig.findFirst({
      where: { provider: 'gemini', companyId },
    });
    const cfg = (row?.config ?? {}) as { apiKey?: string };
    const apiKey = cfg.apiKey ?? '';
    if (!apiKey) {
      throw new BadRequestException('Chave da API Gemini não configurada. Configure em Integrações → IA (Gemini) da sua empresa.');
    }

    const vars = CATEGORY_VARS[category] ?? [];
    const categoryLabel = CATEGORY_LABELS[category] ?? category;
    const contextSection = context ? `\n\nContexto adicional: ${context}` : '';

    const prompt = `Você é um especialista em mensagens de WhatsApp para negócios em português brasileiro.
Crie uma mensagem de WhatsApp profissional para o template chamado "${name}" da categoria "${categoryLabel}".${contextSection}

Variáveis disponíveis (use as mais relevantes): ${vars.join(', ')}

Regras:
- Português brasileiro
- Direto, amigável e profissional
- Máximo 3 parágrafos curtos
- SEM formatação Markdown (é uma mensagem de WhatsApp)
- Pode usar emojis com moderação

Retorne APENAS o texto da mensagem, sem explicações.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024, thinkingConfig: { thinkingBudget: 0 } },
        }),
      },
    );

    if (!response.ok) {
      const errBody = await response.text();
      throw new BadRequestException(`Erro ao chamar a API do Gemini: ${errBody}`);
    }

    const data = await response.json();
    const content: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    if (!content) throw new BadRequestException('Gemini não retornou conteúdo.');
    return { content: content.trim() };
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
