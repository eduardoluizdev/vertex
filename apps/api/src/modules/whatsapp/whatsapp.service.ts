import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private get evolutionApiUrl(): string {
    const url = this.configService.get<string>('EVOLUTION_API_URL');
    if (!url) throw new InternalServerErrorException('Configuração EVOLUTION_API_URL ausente no painel (Easypanel)');
    return url;
  }

  private get apiKey(): string {
    const key = this.configService.get<string>('EVOLUTION_API_KEY');
    if (!key) throw new InternalServerErrorException('Configuração EVOLUTION_API_KEY ausente no painel (Easypanel)');
    return key;
  }

  async createInstance(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const instanceName = `company_${companyId}`;

    try {
      const response = await fetch(`${this.evolutionApiUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS'
        }),
      });

      const data = await response.json();

      let qrcode = null;
      let status = 'CONNECTING';

      if (data.qrcode && data.qrcode.base64) {
        qrcode = data.qrcode.base64;
      }
      
      // se nao tiver qrcode no post a gente pode usar a rota de connect
      if (!qrcode) {
        try {
           const connectResponse = await fetch(`${this.evolutionApiUrl}/instance/connect/${instanceName}`, {
              headers: {
                'apikey': this.apiKey,
              },
           });
           const connectData = await connectResponse.json();
           
           if (connectData.base64) {
             qrcode = connectData.base64;
           } else if (connectData.instance?.state === 'open') {
             status = 'CONNECTED';
           }
        } catch(e) {
          // ignore error here, we will just return CONNECTING anyway
        }
      }

      const instance = await this.prisma.whatsappInstance.upsert({
        where: { companyId },
        update: {
          instanceName,
          status: status,
          qrcode: qrcode,
        },
        create: {
          companyId,
          instanceName,
          status: status,
          qrcode: qrcode,
        },
      });

      return instance;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create WhatsApp instance');
    }
  }

  async getConnectionState(companyId: string) {
    const instance = await this.prisma.whatsappInstance.findUnique({
      where: { companyId },
    });

    if (!instance) {
      return null;
    }

    try {
      const response = await fetch(`${this.evolutionApiUrl}/instance/connectionState/${instance.instanceName}`, {
        headers: {
          'apikey': this.apiKey,
        },
      });

      const data = await response.json();

      if (data && data.instance) {
        const state = data.instance.state; // e.g., 'open', 'connecting', 'close'
        const status = state === 'open' ? 'CONNECTED' : (state === 'connecting' ? 'CONNECTING' : 'DISCONNECTED');
        
        let qrcode = instance.qrcode;
        
        // Fetch new QR Code if still connecting
        if (state === 'connecting') {
           try {
               const connectResponse = await fetch(`${this.evolutionApiUrl}/instance/connect/${instance.instanceName}`, {
                  headers: {
                    'apikey': this.apiKey,
                  },
               });
               const connectData = await connectResponse.json();
               if (connectData.base64) {
                  qrcode = connectData.base64;
               }
           } catch(e) { }
        }

        await this.prisma.whatsappInstance.update({
          where: { id: instance.id },
          data: {
            connectionState: state,
            status: status,
            qrcode: qrcode,
          },
        });

        return {
          ...instance,
          connectionState: state,
          status: status,
          qrcode: qrcode,
        };
      }
      
      return instance;
    } catch (error) {
       return instance;
    }
  }

  async refreshQRCode(companyId: string) {
    const instance = await this.prisma.whatsappInstance.findUnique({
      where: { companyId },
    });

    if (!instance || instance.status !== 'CONNECTING') {
      return this.getConnectionState(companyId);
    }

    try {
      // Refreshing means disconnecting the current active socket in Evolution if any
      // but Evolution doesn't easily expose "regenerate qrcode". 
      // The best way to forcibly get a new QR code is to ask connectionState, 
      // if it's connected, return connected. If disconnected, Evolution gives a new one on connect.
      // Usually, just calling /instance/connect again drops the old pairing and gives a new QR code.
      
      const response = await fetch(`${this.evolutionApiUrl}/instance/connect/${instance.instanceName}`, {
        headers: {
          'apikey': this.apiKey,
        },
      });
      
      const data = await response.json();

      let qrcode = instance.qrcode;
      let status = instance.status;

      if (data.base64) {
        qrcode = data.base64;
      } else if (data.instance?.state === 'open') {
        status = 'CONNECTED';
      } else if (data.instance?.state === 'close') {
         status = 'DISCONNECTED';
      }

      const updatedInstance = await this.prisma.whatsappInstance.update({
        where: { id: instance.id },
        data: {
          qrcode: qrcode,
          status: status,
        },
      });

      return updatedInstance;
    } catch (error) {
      console.error('[refreshQRCode] Error:', error);
      return instance;
    }
  }

  async deleteInstance(companyId: string) {
    const instance = await this.prisma.whatsappInstance.findUnique({
      where: { companyId },
    });

    if (!instance) {
      throw new NotFoundException('Instance not found');
    }

    try {
      await fetch(`${this.evolutionApiUrl}/instance/delete/${instance.instanceName}`, {
        method: 'DELETE',
        headers: {
           apikey: this.apiKey,
        },
      });
      
      await this.prisma.whatsappInstance.delete({
        where: { id: instance.id },
      });

      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete instance');
    }
  }

  async validateNumber(companyId: string, number: string) {
    const instance = await this.prisma.whatsappInstance.findUnique({
      where: { companyId },
    });

    if (!instance || instance.status !== 'CONNECTED') {
      throw new Error('WhatsApp not connected');
    }

    try {
      const response = await fetch(`${this.evolutionApiUrl}/chat/whatsappNumbers/${instance.instanceName}`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numbers: [number] }),
      });

      const data = await response.json();
      return Array.isArray(data) && data.length > 0 ? data[0] : { exists: false };
    } catch (error) {
      console.error('[validateNumber] Error:', error);
      throw new InternalServerErrorException('Failed to validate WhatsApp number');
    }
  }

  async getContacts(companyId: string) {
    const instance = await this.prisma.whatsappInstance.findUnique({
      where: { companyId },
    });

    if (!instance || instance.status !== 'CONNECTED') {
      throw new Error('WhatsApp not connected');
    }

    try {
      const response = await fetch(`${this.evolutionApiUrl}/chat/findContacts/${instance.instanceName}`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ where: {} }),
      });

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      // Evolution API return contacts in the FindContacts method. We filter out groups, broadcasts,
      // and internal linked device IDs (@lid) which are not real phone numbers. 
      // Individual users always have the @s.whatsapp.net suffix.
      const mapped = data
        .filter((c: any) => c.id)
        .map((c: any) => {
          // Identify the raw ID (Evolution sometimes uses remoteJid, or just id)
          const rawId = c.remoteJid || c.id;
          // Extract just the phone number part (everything before the @)
          const numberPart = rawId ? rawId.split('@')[0] : '';
          // Ensure it's only digits to avoid breaking the frontend mask
          const cleanNumber = numberPart.replace(/\D/g, '');

          return {
            id: c.id,
            number: cleanNumber,
            name: c.pushName || c.name || 'Desconhecido',
            profilePictureUrl: c.profilePictureUrl || null,
            isGroup: false, // We already filtered them out
          };
        });

      // Deduplicate by ID since Evolution API might return multiple records for the same contact
      const uniqueContacts = [];
      const seenIds = new Set();
      for (const contact of mapped) {
        if (!seenIds.has(contact.id)) {
          seenIds.add(contact.id);
          uniqueContacts.push(contact);
        }
      }

      return uniqueContacts;
    } catch (error) {
       console.error('[getContacts] Error:', error);
       throw new InternalServerErrorException('Failed to get WhatsApp contacts');
    }
  }

  async sendMessage(companyId: string, number: string, text: string) {
    const instance = await this.prisma.whatsappInstance.findUnique({
      where: { companyId },
    });

    if (!instance || instance.status !== 'CONNECTED') {
      throw new Error('WhatsApp not connected');
    }

    try {
      const response = await fetch(`${this.evolutionApiUrl}/message/sendText/${instance.instanceName}`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number,
          text,
          delay: 1200,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[sendMessage] Error:', error);
      throw new InternalServerErrorException('Failed to send WhatsApp message');
    }
  }
}
