'use server';

import { apiClient } from '@/lib/api';
import { Notification } from '@/types/notification';

export async function getExpiringNotifications(companyId: string): Promise<Notification[]> {
  try {
    const response = await apiClient('/notifications/expiring', {
      headers: {
        'x-company-id': companyId,
      },
      cache: 'no-store', // Ensure we always get fresh data
    });

    if (!response.ok) {
      console.error('Failed to fetch notifications:', await response.text());
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}
