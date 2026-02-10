import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.vertexhub.dev';

export async function fetchClient(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const session = await getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
}
