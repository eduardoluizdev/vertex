'use client';

import React, { forwardRef, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import react-quill-new to avoid SSR issues
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill-new');
    
    try {
      // @ts-ignore
      const MagicUrl = await import('quill-magic-url');
      const Quill = RQ.Quill;
      if (Quill && MagicUrl.default) {
        Quill.register('modules/magicUrl', MagicUrl.default, true);
      }
    } catch(e) {}

    return function ForwardedQuill(props: any) {
      return <RQ {...props} />;
    };
  },
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-muted rounded-md" /> }
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RichTextEditorProps {
  markdown: string;
  onChange?: (html: string) => void;
  className?: string;
}

export const RichTextEditor = forwardRef<any, RichTextEditorProps>(
  ({ markdown, onChange, className }, ref) => {
    const quillRef = useRef<any>(null);

    // Sync ref if needed
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(quillRef.current);
        } else {
          ref.current = quillRef.current;
        }
      }
    }, [ref]);

    const imageHandler = () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();

      input.onchange = async () => {
        const file = input.files ? input.files[0] : null;
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch(`${API_URL}/storage/upload`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error('Upload failed');

          const json = await response.json();
          const quill = quillRef.current?.getEditor();
          const range = quill?.getSelection();
          if (quill && range) {
            quill.insertEmbed(range.index, 'image', json.url);
          }
        } catch (error) {
          console.error('Image upload failed:', error);
          alert('Failed to upload image');
        }
      };
    };

    const modules = useMemo(
      () => ({
        toolbar: {
          container: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ color: [] }, { background: [] }],
            ['link', 'image'],
            ['clean'],
          ],
          handlers: {
            image: imageHandler,
          },
        },
        magicUrl: true,
      }),
      []
    );

    return (
      <div className={`${className} bg-background text-foreground rounded-md`}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={markdown}
          onChange={onChange}
          modules={modules}
          className="h-[350px] pb-12"
        />
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
