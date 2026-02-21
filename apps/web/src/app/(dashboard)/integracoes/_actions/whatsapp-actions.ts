'use server';

import { revalidatePath } from 'next/cache';
import { apiClient } from '@/lib/api';

export async function createWhatsappInstance(companyId: string) {
  try {
    const response = await apiClient(`/v1/whatsapp/instance/${companyId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to create WhatsApp instance');
    }

    revalidatePath('/integracoes');
    return { success: true };
  } catch (error) {
    console.error('[createWhatsappInstance] Error:', error);
    return { success: false, error: 'Erro ao criar instância do WhatsApp' };
  }
}

export async function getWhatsappConnectionState(companyId: string) {
  try {
    const response = await apiClient(`/v1/whatsapp/instance/${companyId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch WhatsApp connection state');
    }
    
    // Some routes might return 200 with an empty body if instance doesn't exist
    const data = await response.json().catch(() => null);
    
    // Explicit return of data
    return {
       status: data?.status || 'DISCONNECTED',
       qrcode: data?.qrcode || null,
       connectionState: data?.connectionState || null,
       instanceName: data?.instanceName || null,
    };
  } catch (error) {
    console.error('[getWhatsappConnectionState] Error:', error);
    return null;
  }
}

export async function deleteWhatsappInstance(companyId: string) {
  try {
    const response = await apiClient(`/v1/whatsapp/instance/${companyId}`, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 404) {
      throw new Error('Failed to delete WhatsApp instance');
    }

    revalidatePath('/integracoes');
    return { success: true };
  } catch (error) {
    console.error('[deleteWhatsappInstance] Error:', error);
    return { success: false, error: 'Erro ao desconectar o WhatsApp' };
  }
}

export async function refreshWhatsappQRCode(companyId: string) {
  try {
    const response = await apiClient(`/v1/whatsapp/instance/${companyId}/refresh`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to refresh WhatsApp QR Code');
    }

    revalidatePath('/integracoes');
    return { success: true };
  } catch (error) {
    console.error('[refreshWhatsappQRCode] Error:', error);
    return { success: false, error: 'Erro ao gerar novo QR Code' };
  }
}

