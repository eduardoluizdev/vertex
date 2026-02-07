import { auth } from '@/auth';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function apiClient(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const session = await auth();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (session?.accessToken) {
    (headers as Record<string, string>)['Authorization'] =
      `Bearer ${session.accessToken}`;
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
}
