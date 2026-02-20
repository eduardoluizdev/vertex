'use client';

import {
  MDXEditor,
  MDXEditorMethods,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CodeToggle,
  CreateLink,
  InsertImage,
  imagePlugin,
  linkPlugin,
  linkDialogPlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { forwardRef } from 'react';

// API URL should be in env, defaulting for dev
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RichTextEditorProps {
  markdown: string;
  onChange?: (markdown: string) => void;
  className?: string;
}

export const RichTextEditor = forwardRef<MDXEditorMethods, RichTextEditorProps>(
  ({ markdown, onChange, className }, ref) => {
    async function imageUploadHandler(image: File) {
      const formData = new FormData();
      formData.append('file', image);
      
      const response = await fetch(`${API_URL}/storage/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const json = (await response.json()) as { url: string };
      return json.url;
    }

    return (
      <div className={`${className} mdx-editor-wrapper dark:prose-invert`}>
        <MDXEditor
          ref={ref}
          markdown={markdown}
          onChange={onChange}         
          contentEditableClassName="prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-2"
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            imagePlugin({
              imageUploadHandler,
            }),
            markdownShortcutPlugin(),
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <CodeToggle />
                  <BlockTypeSelect />
                  <CreateLink />
                  <InsertImage />
                </>
              ),
            }),
          ]}
        />
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
