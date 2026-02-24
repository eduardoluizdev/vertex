import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EasypanelService {
  private readonly logger = new Logger(EasypanelService.name);

  constructor(private readonly configService: ConfigService) {}

  private get apiUrl(): string {
    const url = this.configService.get<string>('EASYPANEL_API_URL');
    if (!url) {
      throw new Error('EASYPANEL_API_URL is not configured');
    }
    return url.replace(/\/$/, '') + '/api/trpc';
  }

  private get apiToken(): string | undefined {
    return this.configService.get<string>('EASYPANEL_API_TOKEN');
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  async addDomainToService(projectName: string, serviceName: string, domain: string): Promise<boolean> {
    if (!this.apiToken) {
      this.logger.warn('EASYPANEL_API_TOKEN is not configured. Skipping domain addition.');
      return false;
    }

    try {
      this.logger.log(`Checking if domain ${domain} is already attached to ${projectName}/${serviceName}...`);
      
      // 1. Fetch current domains
      const listPayload = encodeURIComponent(JSON.stringify({json:{projectName, serviceName}}));
      const resList = await fetch(`${this.apiUrl}/domains.listDomains?batch=1&input=${listPayload}`, {
        method: 'GET',
        headers: this.headers
      });
      
      const listData = await resList.json();
      const currentDomains = listData[0]?.result?.data?.json || [];
      
      const exists = currentDomains.some((d: any) => d.host === domain);
      if (exists) {
        this.logger.log(`Domain ${domain} is already attached.`);
        return true;
      }

      // 2. Add new domain
      this.logger.log(`Adding domain ${domain} to ${projectName}/${serviceName}...`);
      
      // Generate a unique ID similar to how Easypanel does it
      const id = Date.now().toString(36) + Math.random().toString(36).substring(2);

      const createPayload = {
        json: {
          id,
          host: domain,
          https: true,
          path: "/",
          middlewares: [],
          certificateResolver: "",
          wildcard: false,
          destinationType: "service",
          serviceDestination: {
            protocol: "http",
            port: 80,
            path: "/",
            projectName,
            serviceName
          }
        }
      };

      const resCreate = await fetch(`${this.apiUrl}/domains.createDomain`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(createPayload)
      });

      if (!resCreate.ok) {
        const errText = await resCreate.text();
        throw new Error(`Failed to create domain: ${errText}`);
      }
      
      const result = await resCreate.json();
      if (result.error) {
        throw new Error(`API Error: ${JSON.stringify(result.error)}`);
      }

      this.logger.log(`Successfully added domain ${domain} to Easypanel.`);
      return true;
    } catch (e: any) {
      this.logger.error(`Failed to add domain ${domain} to Easypanel: ${e.message}`, e.stack);
      return false;
    }
  }
}
