'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Save,
  Globe,
  FileText,
  Linkedin,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  createBlogPost,
  updateBlogPost,
  generateBlogText,
  generateBlogImage,
  generateLinkedInPost,
  type BlogPost,
} from '@/actions/blog-actions';

interface PostEditorProps {
  post?: BlogPost;
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const isEditing = !!post;

  const [headline, setHeadline] = useState(post?.headline ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? '');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>(post?.status ?? 'DRAFT');
  const [previewMode, setPreviewMode] = useState(false);

  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const [linkedinPost, setLinkedinPost] = useState('');
  const [copied, setCopied] = useState(false);

  const [isSaving, startSave] = useTransition();
  const [isGeneratingText, startGenerateText] = useTransition();
  const [isGeneratingImage, startGenerateImage] = useTransition();
  const [isGeneratingLinkedin, startGenerateLinkedin] = useTransition();

  function handleSave(newStatus?: 'DRAFT' | 'PUBLISHED') {
    const finalStatus = newStatus ?? status;
    setResult(null);
    startSave(async () => {
      const payload = { headline, content, coverImage: coverImage || undefined, status: finalStatus };
      const res = isEditing
        ? await updateBlogPost(post!.id, payload)
        : await createBlogPost(payload);

      setResult({ success: res.success, message: res.message });
      if (res.success) {
        setStatus(finalStatus);
        if (!isEditing && res.data) {
          router.push(`/blog-admin/${res.data.id}/editar`);
        }
      }
    });
  }

  function handleGenerateText() {
    if (!headline.trim()) {
      setResult({ success: false, message: 'Informe a headline antes de gerar o texto.' });
      return;
    }
    setResult(null);
    startGenerateText(async () => {
      const res = await generateBlogText(headline);
      if (res.success && res.content) {
        setContent(res.content);
      } else {
        setResult({ success: false, message: res.message ?? 'Erro ao gerar texto.' });
      }
    });
  }

  function handleGenerateImage() {
    if (!headline.trim()) {
      setResult({ success: false, message: 'Informe a headline antes de gerar a imagem.' });
      return;
    }
    setResult(null);
    startGenerateImage(async () => {
      const res = await generateBlogImage(headline);
      if (res.success && res.imageBase64 && res.mimeType) {
        setCoverImage(`data:${res.mimeType};base64,${res.imageBase64}`);
      } else {
        setResult({ success: false, message: res.message ?? 'Erro ao gerar imagem.' });
      }
    });
  }

  function handleGenerateLinkedin() {
    if (!content.trim()) {
      setResult({ success: false, message: 'Escreva o conteúdo do post antes de gerar o LinkedIn.' });
      return;
    }
    setResult(null);
    startGenerateLinkedin(async () => {
      const res = await generateLinkedInPost(headline, content);
      if (res.success && res.linkedinPost) {
        setLinkedinPost(res.linkedinPost);
      } else {
        setResult({ success: false, message: res.message ?? 'Erro ao gerar post do LinkedIn.' });
      }
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(linkedinPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isLoading = isSaving || isGeneratingText || isGeneratingImage || isGeneratingLinkedin;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main editor */}
      <div className="lg:col-span-2 space-y-6">
        {/* Headline */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Headline do Post</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Ex: Como automatizar captação de leads com IA"
            className="w-full rounded-xl border border-input bg-input/30 px-4 py-3 text-lg font-semibold placeholder:text-muted-foreground/50 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* AI Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateText}
            disabled={isLoading}
            className="gap-2 border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
          >
            {isGeneratingText ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Gerar texto com Gemini
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateImage}
            disabled={isLoading}
            className="gap-2 border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
          >
            {isGeneratingImage ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImageIcon className="size-4" />
            )}
            Gerar capa com Gemini
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-2 ml-auto"
          >
            {previewMode ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {previewMode ? 'Editar' : 'Preview'}
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Conteúdo (Markdown)</label>
          {previewMode ? (
            <div className="min-h-[400px] rounded-xl border border-border bg-card p-6 prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">{content || 'Nenhum conteúdo ainda.'}</pre>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva o conteúdo em Markdown ou gere com IA..."
              rows={20}
              className="w-full rounded-xl border border-input bg-input/30 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-y"
            />
          )}
        </div>

        {/* Feedback */}
        {result && (
          <div
            className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${
              result.success
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                : 'border-red-500/20 bg-red-500/10 text-red-400'
            }`}
          >
            {result.success ? (
              <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="size-4 mt-0.5 shrink-0" />
            )}
            {result.message}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Cover Image */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <ImageIcon className="size-4 text-muted-foreground" />
            Imagem de Capa
          </h3>
          {coverImage ? (
            <div className="space-y-2">
              <img
                src={coverImage}
                alt="Capa"
                className="w-full rounded-lg object-cover aspect-video"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCoverImage('')}
                className="text-red-400 hover:text-red-500 hover:bg-red-500/10 w-full"
              >
                Remover imagem
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border h-32 text-muted-foreground text-sm gap-2">
              <ImageIcon className="size-6 opacity-30" />
              <span>Nenhuma imagem</span>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">URL da imagem (opcional)</label>
            <input
              type="url"
              value={coverImage.startsWith('data:') ? '' : coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-xs outline-none transition-all focus:border-primary/50"
            />
          </div>
        </div>

        {/* Publish */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Globe className="size-4 text-muted-foreground" />
            Publicação
          </h3>
          <div className="space-y-2">
            <Button
              onClick={() => handleSave('PUBLISHED')}
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isSaving && status === 'PUBLISHED' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Globe className="size-4" />
              )}
              Publicar
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave('DRAFT')}
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isSaving && status === 'DRAFT' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Salvar como Rascunho
            </Button>
          </div>
          <div
            className={`text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 font-medium ${
              status === 'PUBLISHED'
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-amber-500/10 text-amber-500'
            }`}
          >
            <div className={`size-1.5 rounded-full ${status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
          </div>
        </div>

        {/* LinkedIn Generator */}
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <Linkedin className="size-4 text-sky-400" />
              Post para LinkedIn
            </h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleGenerateLinkedin}
              disabled={isLoading}
              className="gap-1.5 border-sky-500/30 text-sky-400 hover:bg-sky-500/10 h-7 text-xs"
            >
              {isGeneratingLinkedin ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              {isGeneratingLinkedin ? 'Gerando...' : 'Gerar'}
            </Button>
          </div>

          {linkedinPost ? (
            <div className="space-y-2">
              <textarea
                value={linkedinPost}
                onChange={(e) => setLinkedinPost(e.target.value)}
                rows={10}
                className="w-full rounded-lg border border-sky-500/20 bg-background/50 px-3 py-2 text-xs leading-relaxed outline-none focus:border-sky-500/40 resize-none"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="w-full gap-2 border-sky-500/30 text-sky-400 hover:bg-sky-500/10 h-8 text-xs"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? 'Copiado!' : 'Copiar texto'}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Gere um post otimizado para o LinkedIn baseado no conteúdo do artigo.
            </p>
          )}
        </div>

        {/* Tips */}
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-xs text-muted-foreground space-y-2">
          <p className="font-medium text-violet-400 flex items-center gap-1.5">
            <Sparkles className="size-3.5" />
            Dicas do editor
          </p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Escreva a headline primeiro para usar a IA</li>
            <li>Use <code className="font-mono">## Seção</code> para subtítulos</li>
            <li>Use <code className="font-mono">**negrito**</code> e <code className="font-mono">*itálico*</code></li>
            <li>Use <code className="font-mono">```code```</code> para código</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
