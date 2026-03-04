import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const GEMINI_PROVIDER = 'gemini';

function generateSlug(headline: string): string {
  return headline
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function autoExcerpt(content: string, limit = 180): string {
  const plain = content
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/[*_`~>]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  return plain.length <= limit ? plain : plain.slice(0, limit).replace(/\s+\S*$/, '') + '…';
}

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async getGeminiApiKey(): Promise<string> {
    const row = await this.prisma.integrationConfig.findFirst({
      where: { provider: GEMINI_PROVIDER, companyId: null },
    });
    const cfg = (row?.config ?? {}) as { apiKey?: string };
    const key = cfg.apiKey ?? process.env.GEMINI_API_KEY ?? '';
    if (!key) {
      throw new BadRequestException('Chave da API Gemini não configurada. Configure em Integrações → IA (Gemini).');
    }
    return key;
  }

  async generateText(headline: string, seedContent?: string): Promise<{ content: string }> {
    const apiKey = await this.getGeminiApiKey();

    const seedSection = seedContent
      ? `\n\nUse o seguinte rascunho/notas como base e contexto para o artigo (expanda, enriqueça e formate profissionalmente):\n\n---\n${seedContent}\n---\n`
      : '';

    const prompt = `Você é um redator profissional de blog de tecnologia em português brasileiro.
Escreva um post completo e detalhado para o blog com a seguinte headline: "${headline}".${seedSection}

O post deve:
- Estar em português brasileiro
- Ter uma introdução envolvente
- Ser estruturado com seções usando headings Markdown (##, ###)
- Incluir exemplos práticos e trechos de código quando relevante
- Ter um call-to-action no final
- Usar formatação Markdown completa
- Ter entre 800 e 1200 palavras

Retorne APENAS o conteúdo Markdown do post, sem headlines extras ou comentários.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`Gemini text error: ${err}`);
      throw new BadRequestException('Erro ao gerar texto com Gemini.');
    }

    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!content) {
      throw new BadRequestException('Gemini não retornou conteúdo.');
    }

    return { content };
  }

  async generateLinkedInPost(headline: string, content: string): Promise<{ linkedinPost: string }> {
    const apiKey = await this.getGeminiApiKey();

    const prompt = `Você é um especialista em marketing de conteúdo para LinkedIn.

Com base no artigo de blog abaixo, crie um post viral para o LinkedIn em português brasileiro.

**Headline do artigo:** ${headline}

**Conteúdo do artigo:**
${content.slice(0, 3000)}

O post do LinkedIn deve:
- Começar com uma frase de gancho forte (sem "Eu" no início — use uma afirmação, pergunta ou dado)
- Ter parágrafos curtos (1-2 linhas cada) para fácil leitura no mobile
- Contar a história técnica de forma acessível
- Incluir 3-5 bullet points com os pontos principais
- Terminar com uma pergunta ou call-to-action que gere engajamento
- Ter entre 150-300 palavras
- Incluir de 5 a 8 hashtags relevantes no final
- Ser autêntico, direto e no tom de quem está construindo em público (build in public)

Retorne APENAS o texto do post, sem explicações ou comentários.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`Gemini LinkedIn error: ${err}`);
      throw new BadRequestException('Erro ao gerar post do LinkedIn.');
    }

    const data = await response.json();
    const linkedinPost = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!linkedinPost) {
      throw new BadRequestException('Gemini não retornou conteúdo.');
    }

    return { linkedinPost };
  }

  async generateImage(headline: string): Promise<{ imageBase64: string; mimeType: string }> {
    const apiKey = await this.getGeminiApiKey();

    const prompt = `Create a professional, modern blog cover image for an article titled: "${headline}".
The image should be visually appealing, suitable for a tech/business blog, with clean design,
abstract or conceptual visuals. No text overlay needed. High quality, 16:9 aspect ratio style.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { numberOfImages: 1, aspectRatio: '16:9' },
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`Gemini image error: ${err}`);
      throw new BadRequestException('Erro ao gerar imagem com Gemini.');
    }

    const data = await response.json();
    const prediction = data?.predictions?.[0];

    if (!prediction?.bytesBase64Encoded) {
      throw new BadRequestException('Gemini não retornou imagem.');
    }

    return {
      imageBase64: prediction.bytesBase64Encoded,
      mimeType: prediction.mimeType ?? 'image/png',
    };
  }

  async create(authorId: string, dto: CreatePostDto) {
    const baseSlug = dto.slug ?? generateSlug(dto.headline);

    // Ensure unique slug
    let slug = baseSlug;
    let attempt = 0;
    while (await this.prisma.blogPost.findUnique({ where: { slug } })) {
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const excerpt = dto.excerpt ?? autoExcerpt(dto.content);
    const publishedAt = dto.status === 'PUBLISHED' ? new Date() : null;

    return this.prisma.blogPost.create({
      data: {
        headline: dto.headline,
        slug,
        content: dto.content,
        excerpt,
        coverImage: dto.coverImage,
        status: dto.status ?? 'DRAFT',
        publishedAt,
        authorId,
      },
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async findAll(onlyPublished = false) {
    return this.prisma.blogPost.findMany({
      where: onlyPublished ? { status: 'PUBLISHED' } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async findRecent(limit = 4) {
    return this.prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        headline: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
        author: { select: { name: true } },
      },
    });
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { views: true } },
      },
    });
    if (!post) throw new NotFoundException('Post não encontrado.');
    const { _count, ...rest } = post;
    return { ...rest, viewCount: _count.views };
  }

  async findById(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { views: true } },
      },
    });
    if (!post) throw new NotFoundException('Post não encontrado.');
    const { _count, ...rest } = post;
    return { ...rest, viewCount: _count.views };
  }

  async registerView(postId: string, ip: string): Promise<{ viewCount: number }> {
    await this.prisma.blogPostView.upsert({
      where: { postId_ip: { postId, ip } },
      create: { postId, ip },
      update: {}, // já existe, não faz nada
    });
    const viewCount = await this.prisma.blogPostView.count({ where: { postId } });
    return { viewCount };
  }

  async update(id: string, dto: UpdatePostDto) {
    const post = await this.findById(id);

    let slug = post.slug;
    if (dto.slug) {
      slug = dto.slug;
    } else if (dto.headline && dto.headline !== post.headline) {
      slug = generateSlug(dto.headline);
      let attempt = 0;
      while (true) {
        const existing = await this.prisma.blogPost.findUnique({ where: { slug } });
        if (!existing || existing.id === id) break;
        attempt++;
        slug = `${generateSlug(dto.headline)}-${attempt}`;
      }
    }

    const publishedAt =
      dto.status === 'PUBLISHED' && post.status !== 'PUBLISHED'
        ? new Date()
        : post.publishedAt;

    const excerpt =
      dto.excerpt ?? (dto.content ? autoExcerpt(dto.content) : post.excerpt);

    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...(dto.headline && { headline: dto.headline }),
        slug,
        ...(dto.content && { content: dto.content }),
        excerpt,
        ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
        ...(dto.status && { status: dto.status }),
        publishedAt,
      },
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.blogPost.delete({ where: { id } });
  }
}
