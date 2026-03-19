import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import ImageExt from '@tiptap/extension-image';
import LinkExt from '@tiptap/extension-link';
import { useRef, useCallback } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Quote, Minus,
  Undo, Redo, Code, Link as LinkIcon, Image as ImageIcon,
  Upload, Loader2, Unlink, Youtube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlogContentEditorProps {
  content: string;
  onChange: (html: string) => void;
  className?: string;
}

export function BlogContentEditor({ content, onChange, className }: BlogContentEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ImageExt.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full mx-auto' },
      }),
      LinkExt.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline cursor-pointer' },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none min-h-[500px] p-4 focus:outline-none',
      },
    },
  });

  const uploadImage = useCallback(async (file: File) => {
    if (uploadingRef.current || !editor) return;
    uploadingRef.current = true;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      uploadingRef.current = false;
      return;
    }

    const ext = file.name.split('.').pop();
    const fileName = `content/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) {
      toast.error('Upload failed: ' + error.message);
      uploadingRef.current = false;
      return;
    }

    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);

    editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
    toast.success('Image inserted!');
    uploadingRef.current = false;
  }, [editor]);

  const handleImageUpload = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = '';
  };

  const insertImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = prompt('Enter URL:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertYouTube = () => {
    const url = prompt('Enter YouTube video URL:');
    if (!url || !editor) return;

    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\s]+)/)?.[1];
    if (!videoId) {
      toast.error('Invalid YouTube URL');
      return;
    }

    editor.chain().focus().insertContent(
      `<div data-youtube-video><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="width:100%;aspect-ratio:16/9;border-radius:8px;"></iframe></div>`
    ).run();
  };

  if (!editor) return null;

  const ToolbarButton = ({
    onClick, isActive = false, disabled = false, children, title
  }: {
    onClick: () => void; isActive?: boolean; disabled?: boolean;
    children: React.ReactNode; title: string;
  }) => (
    <Toggle
      size="sm"
      pressed={isActive}
      onPressedChange={onClick}
      disabled={disabled}
      className={cn(
        "h-8 w-8 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
        isActive && "bg-primary text-primary-foreground"
      )}
      title={title}
    >
      {children}
    </Toggle>
  );

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden bg-background", className)}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30 sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()} className="h-8 w-8 p-0" title="Undo">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()} className="h-8 w-8 p-0" title="Redo">
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code">
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote">
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="h-8 w-8 p-0" title="Horizontal Rule">
          <Minus className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Link */}
        <ToolbarButton onClick={insertLink} isActive={editor.isActive('link')} title="Insert Link">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        {editor.isActive('link') && (
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().unsetLink().run()}
            className="h-8 w-8 p-0" title="Remove Link">
            <Unlink className="h-4 w-4" />
          </Button>
        )}

        {/* Image */}
        <Button variant="ghost" size="sm" onClick={handleImageUpload} className="h-8 w-8 p-0" title="Upload Image">
          <Upload className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={insertImageUrl} className="h-8 w-8 p-0" title="Image from URL">
          <ImageIcon className="h-4 w-4" />
        </Button>

        {/* YouTube */}
        <Button variant="ghost" size="sm" onClick={insertYouTube} className="h-8 w-8 p-0" title="Embed YouTube">
          <Youtube className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
