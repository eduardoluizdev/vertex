'use client';

import { useEffect } from 'react';
import { syncSelectedCompanyCookie } from '@/app/(dashboard)/_actions/set-selected-company';

interface SyncCompanyCookieProps {
  companyId: string;
}

/**
 * Chama a Server Action para sincronizar o cookie da empresa com a URL.
 * Assim a sidebar mostra a empresa correta ao navegar para uma página de empresa.
 */
export function SyncCompanyCookie({ companyId }: SyncCompanyCookieProps) {
  useEffect(() => {
    syncSelectedCompanyCookie(companyId);
  }, [companyId]);

  return null;
}
