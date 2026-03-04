'use server';

import { apiClient } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export interface BlogPost {
  id: string;
  headline: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await apiClient('/v1/blog/admin/all', { cache: 'no-store' } as RequestInit);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    const res = await apiClient(`/v1/blog/${id}`, { cache: 'no-store' } as RequestInit);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getBlogPostBySlug(slugOrId: string): Promise<BlogPost | null> {
  try {
    const bySlug = await apiClient(`/v1/blog/slug/${slugOrId}`, { cache: 'no-store' } as RequestInit);
    if (bySlug.ok) return bySlug.json();

    const byId = await apiClient(`/v1/blog/${slugOrId}`, { cache: 'no-store' } as RequestInit);
    if (byId.ok) return byId.json();

    return null;
  } catch {
    return null;
  }
}

export async function createBlogPost(formData: {
  headline: string;
  content: string;
  coverImage?: string;
  status: 'DRAFT' | 'PUBLISHED';
}): Promise<{ success: boolean; message: string; data?: BlogPost }> {
  try {
    const res = await apiClient('/v1/blog', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: (err as any).message ?? 'Erro ao criar post.' };
    }

    const data = await res.json();
    revalidatePath('/blog');
    return { success: true, message: 'Post criado com sucesso!', data };
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}

export async function updateBlogPost(
  id: string,
  formData: {
    headline?: string;
    content?: string;
    coverImage?: string;
    status?: 'DRAFT' | 'PUBLISHED';
  },
): Promise<{ success: boolean; message: string; data?: BlogPost }> {
  try {
    const res = await apiClient(`/v1/blog/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: (err as any).message ?? 'Erro ao atualizar post.' };
    }

    const data = await res.json();
    revalidatePath('/blog');
    return { success: true, message: 'Post atualizado com sucesso!', data };
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}

export async function deleteBlogPost(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiClient(`/v1/blog/${id}`, { method: 'DELETE' });

    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: (err as any).message ?? 'Erro ao deletar post.' };
    }

    revalidatePath('/blog');
    return { success: true, message: 'Post removido com sucesso!' };
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}

export async function generateBlogText(
  headline: string,
): Promise<{ success: boolean; content?: string; message?: string }> {
  try {
    const res = await apiClient('/v1/blog/ai/generate-text', {
      method: 'POST',
      body: JSON.stringify({ headline }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: (err as any).message ?? 'Erro ao gerar texto.' };
    }

    const data = await res.json();
    return { success: true, content: data.content };
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}

export async function generateLinkedInPost(
  headline: string,
  content: string,
): Promise<{ success: boolean; linkedinPost?: string; message?: string }> {
  try {
    const res = await apiClient('/v1/blog/ai/generate-linkedin', {
      method: 'POST',
      body: JSON.stringify({ headline, content }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: (err as any).message ?? 'Erro ao gerar post.' };
    }

    const data = await res.json();
    return { success: true, linkedinPost: data.linkedinPost };
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}

export async function generateBlogImage(
  headline: string,
): Promise<{ success: boolean; imageBase64?: string; mimeType?: string; message?: string }> {
  try {
    const res = await apiClient('/v1/blog/ai/generate-image', {
      method: 'POST',
      body: JSON.stringify({ headline }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: (err as any).message ?? 'Erro ao gerar imagem.' };
    }

    const data = await res.json();
    return { success: true, imageBase64: data.imageBase64, mimeType: data.mimeType };
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}

export async function updateGeminiIntegration(
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const apiKey = formData.get('geminiApiKey') as string | null;
  if (!apiKey?.trim()) {
    return { success: false, message: 'Informe a API Key do Gemini.' };
  }

  try {
    const res = await apiClient('/v1/integrations/gemini', {
      method: 'PATCH',
      body: JSON.stringify({ config: { apiKey: apiKey.trim() } }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: (err as any).message ?? 'Erro ao salvar.' };
    }

    revalidatePath('/integracoes');
    return { success: true, message: 'API Key do Gemini salva com sucesso!' };
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}
