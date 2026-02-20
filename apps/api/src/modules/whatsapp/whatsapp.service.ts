import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class WhatsappService {
  private readonly evolutionApiUrl = process.env.EVOLUTION_API_URL!;
  private readonly apiKey = process.env.EVOLUTION_API_KEY!;

  constructor(private readonly prisma: PrismaService) {}

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
}
