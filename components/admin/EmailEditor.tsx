'use client';

/**
 * Three-tab email body editor: Visual (TipTap WYSIWYG), HTML (raw
 * source textarea), Preview (live iframe).
 *
 * The two edit modes share a single `value` prop. When the user
 * switches from Visual → HTML, TipTap's innerHTML is serialized out.
 * When they switch HTML → Visual, the textarea value is parsed back
 * into TipTap. Both tabs write back to the parent via `onChange`.
 *
 * Email HTML typically uses table layouts + inline styles that TipTap
 * will simplify when it round-trips. For structural edits the admin
 * should prefer the HTML tab. Visual mode is best for copy changes.
 */

import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Code as CodeIcon, Eye, Pencil, Paintbrush } from 'lucide-react';

type Mode = 'visual' | 'html' | 'preview';

interface Props {
  value: string;
  onChange: (next: string) => void;
  /** Variables substituted into the preview iframe (sample values). */
  previewVars?: Record<string, string>;
}

export default function EmailEditor({ value, onChange, previewVars = {} }: Props) {
  const [mode, setMode] = useState<Mode>('visual');
  // Keep a local copy of the HTML source so typing in the HTML textarea
  // doesn't cause a full TipTap re-render per keystroke. We sync up on
  // tab switch.
  const [htmlDraft, setHtmlDraft] = useState(value);
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      const html = editor.getHTML();
      setHtmlDraft(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none min-h-[340px] p-4 focus:outline-none ' +
          'bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-[#F4ECD8]',
      },
    },
  });

  // When the parent's value changes from outside this editor (e.g. the
  // user loaded a different template), sync it in.
  useEffect(() => {
    if (!editor) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    setHtmlDraft(value);
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  function switchMode(next: Mode) {
    if (next === mode) return;
    // Going from HTML back to Visual: push the draft into the editor.
    if (mode === 'html' && next === 'visual' && editor) {
      editor.commands.setContent(htmlDraft, { emitUpdate: false });
      onChange(htmlDraft);
    }
    // Going from Visual to anything else: serialize out.
    if (mode === 'visual' && editor) {
      const serialized = editor.getHTML();
      setHtmlDraft(serialized);
    }
    setMode(next);
  }

  function setLink() {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = prompt('Link URL:', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }

  // Expand {{var}} placeholders in the preview using sample values
  // from `previewVars`. Missing variables render as their literal
  // placeholder so the admin can see which variables are unfilled.
  function renderPreviewHtml(src: string): string {
    return src.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, name) => {
      return previewVars[name] ?? match;
    });
  }

  return (
    <div className="border border-gray-300 dark:border-[#D4A017]/30">
      {/* Tab strip */}
      <div className="flex border-b border-gray-300 dark:border-[#D4A017]/30 bg-gray-50 dark:bg-[#0A0A0A]">
        <TabButton active={mode === 'visual'} onClick={() => switchMode('visual')} icon={<Pencil className="h-3 w-3" />}>
          Visual
        </TabButton>
        <TabButton active={mode === 'html'} onClick={() => switchMode('html')} icon={<CodeIcon className="h-3 w-3" />}>
          HTML
        </TabButton>
        <TabButton active={mode === 'preview'} onClick={() => switchMode('preview')} icon={<Eye className="h-3 w-3" />}>
          Preview
        </TabButton>
      </div>

      {/* Visual — TipTap toolbar + editor */}
      {mode === 'visual' && editor && (
        <>
          <div className="flex gap-1 p-2 border-b border-gray-300 dark:border-[#D4A017]/20 bg-gray-50 dark:bg-[#0A0A0A] flex-wrap">
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="Bold (Cmd+B)"
            >
              <Bold className="h-3.5 w-3.5" />
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="Italic (Cmd+I)"
            >
              <Italic className="h-3.5 w-3.5" />
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="Bullet list"
            >
              <List className="h-3.5 w-3.5" />
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title="Numbered list"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </ToolbarBtn>
            <ToolbarBtn onClick={setLink} active={editor.isActive('link')} title="Insert/edit link">
              <LinkIcon className="h-3.5 w-3.5" />
            </ToolbarBtn>
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-[#F4ECD8]/50 font-mono px-2">
              <Paintbrush className="h-3 w-3" />
              Visual mode simplifies email HTML. Use the HTML tab for layout.
            </span>
          </div>
          <EditorContent editor={editor} />
        </>
      )}

      {/* HTML — raw source textarea */}
      {mode === 'html' && (
        <textarea
          value={htmlDraft}
          onChange={(e) => {
            setHtmlDraft(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full min-h-[420px] p-3 bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-[#F4ECD8] text-xs font-mono focus:outline-none resize-y"
          spellCheck={false}
        />
      )}

      {/* Preview — live iframe with sample variables filled in */}
      {mode === 'preview' && (
        <div className="p-3 bg-gray-100 dark:bg-[#0A0A0A]">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/50 mb-2">
            Preview rendered with sample variable values. Unfilled variables show as &#x7B;&#x7B;name&#x7D;&#x7D;.
          </p>
          <iframe
            srcDoc={renderPreviewHtml(value)}
            title="Email preview"
            className="w-full min-h-[480px] bg-white border border-gray-300 dark:border-[#D4A017]/20"
            sandbox=""
          />
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
        active
          ? 'border-[#D4A017] text-[#D4A017] bg-white dark:bg-[#111]'
          : 'border-transparent text-gray-600 dark:text-[#F4ECD8]/60 hover:text-gray-900 dark:hover:text-[#F4ECD8]'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function ToolbarBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded border ${
        active
          ? 'bg-[#D4A017]/20 border-[#D4A017] text-[#D4A017]'
          : 'border-transparent text-gray-700 dark:text-[#F4ECD8]/70 hover:bg-gray-200 dark:hover:bg-[#222]'
      }`}
    >
      {children}
    </button>
  );
}
