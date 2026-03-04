import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ApifyClient } from 'apify-client';

@Injectable()
export class ApifyService {
  private readonly logger = new Logger(ApifyService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async getApiKey(companyId: string): Promise<string> {
    const row = await this.prisma.integrationConfig.findFirst({
      where: { provider: 'apify', companyId },
    });
    const apiKey = (row?.config as Record<string, unknown>)?.['apiKey'] as string | undefined;
    if (!apiKey || !apiKey.startsWith('apify_api_')) {
      throw new BadRequestException(
        'API Key do Apify não configurada para esta empresa. Configure em Integrações → Automações.',
      );
    }
    return apiKey;
  }

  async searchGoogleMaps(
    companyId: string,
    nicho: string,
    cidade: string,
    estado: string,
    pais: string,
    quantidade: number,
  ): Promise<Record<string, unknown>[]> {
    const token = await this.getApiKey(companyId);
    const client = new ApifyClient({ token });

    const input = {
      searchStringsArray: [nicho],
      locationQuery: `${cidade}, ${estado}, ${pais}`,
      maxCrawledPlacesPerSearch: quantidade,
      language: 'pt-BR',
      searchMatching: 'all',
      placeMinimumStars: '',
      website: 'allPlaces',
      skipClosedPlaces: false,
      scrapeContacts: true,
      scrapeReviewsPersonalData: true,
    };

    this.logger.log(`Starting Apify search: "${nicho}" in "${cidade}, ${estado}, ${pais}" (max: ${quantidade})`);

    const run = await client.actor('nwua9Gu5YrADL7ZDj').call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (items.length > 0) {
      this.logger.log('=== APIFY FIRST ITEM STRUCTURE (for typing) ===');
      console.dir(items[0], { depth: null });
      this.logger.log('===============================================');
    }

    this.logger.log(`Apify returned ${items.length} results`);
    return items as Record<string, unknown>[];
  }
}
