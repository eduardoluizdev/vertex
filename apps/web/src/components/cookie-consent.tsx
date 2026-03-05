'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'vh_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // pequeno delay para não piscar durante SSR
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-xl
        rounded-2xl border border-white/10 bg-[#111111]/95 backdrop-blur-md shadow-[0_8px_40px_rgba(0,0,0,0.6)]
        px-5 py-4 text-sm text-neutral-300"
    >
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 size-4 shrink-0 text-amber-500" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white mb-1">Usamos cookies</p>
          <p className="text-xs leading-relaxed text-neutral-400">
            Utilizamos cookies essenciais para manter você autenticado e, quando habilitado, o Google Analytics para
            entender como o site é usado. Consulte nossa{' '}
            <Link href="/privacidade" className="text-amber-500 underline underline-offset-2 hover:text-amber-400 transition-colors">
              Política de Privacidade
            </Link>{' '}
            para mais detalhes.
          </p>
        </div>
        <button
          onClick={decline}
          aria-label="Fechar aviso de cookies"
          className="mt-0.5 shrink-0 rounded-md p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={decline}
          className="h-8 rounded-lg px-4 text-xs text-neutral-400 hover:text-white hover:bg-white/10"
        >
          Recusar opcionais
        </Button>
        <Button
          size="sm"
          onClick={accept}
          className="h-8 rounded-lg px-4 text-xs font-semibold bg-amber-500 text-black hover:bg-amber-400"
        >
          Aceitar todos
        </Button>
      </div>
    </div>
  );
}
