import { apiClient } from '@/lib/api';

export async function getWhatsappConnectionStateServer(companyId: string) {
  try {
    const response = await apiClient(`/v1/whatsapp/instance/${companyId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch WhatsApp connection state');
    }
    
    const data = await response.json().catch(() => null);
    
    return {
       status: data?.status || 'DISCONNECTED',
       qrcode: data?.qrcode || null,
       connectionState: data?.connectionState || null,
       instanceName: data?.instanceName || null,
    };
  } catch (error) {
    console.error('[getWhatsappConnectionStateServer] Error:', error);
    return null;
  }
}
