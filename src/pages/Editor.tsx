import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw, FileText, Cloud, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExportDropdown } from '@/components/ExportDropdown';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useToast } from '@/hooks/use-toast';
import { PostToLinkedInButton } from '@/components/linkedin/PostToLinkedInButton';

interface EditorState {
  content: string;
  title?: string;
  templateType?: string;
}

interface SavedDraft {
  content: string;
  title: string;
  templateType?: string;
  savedAt: number;
}

const DRAFT_STORAGE_KEY = 'editor_draft';
const AUTO_SAVE_DELAY = 2000; // 2 seconds debounce

export default function Editor() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const initialState = location.state as EditorState | null;
  
  // Check for saved draft on mount
  const getSavedDraft = useCallback((): SavedDraft | null => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
    return null;
  }, []);

  const savedDraft = getSavedDraft();
  const hasSavedDraft = savedDraft && !initialState?.content;
  
  const [content, setContent] = useState(
    initialState?.content || savedDraft?.content || ''
  );
  const [originalContent] = useState(initialState?.content || '');
  const [title, setTitle] = useState(
    initialState?.title || savedDraft?.title || 'Untitled Document'
  );
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(
    savedDraft ? new Date(savedDraft.savedAt) : null
  );
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const templateType = initialState?.templateType || savedDraft?.templateType;

  // Auto-save to localStorage
  const saveDraft = useCallback(() => {
    try {
      const draft: SavedDraft = {
        content,
        title,
        templateType,
        savedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setIsSaved(true);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }, [content, title, templateType]);

  // Debounced auto-save
  useEffect(() => {
    if (content) {
      setIsSaved(false);
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveDraft();
      }, AUTO_SAVE_DELAY);
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, title, saveDraft]);

  // Show toast if recovering from saved draft
  useEffect(() => {
    if (hasSavedDraft && savedDraft) {
      toast({
        title: "Draft recovered",
        description: `Your previous work from ${new Date(savedDraft.savedAt).toLocaleString()} has been restored.`,
      });
    }
  }, []); // Only run once on mount

  useEffect(() => {
    if (!initialState?.content && !savedDraft?.content) {
      toast({
        title: "No content to edit",
        description: "Please generate content first before using the editor.",
        variant: "destructive",
      });
      navigate('/app/templates');
    }
  }, [initialState, savedDraft, navigate, toast]);

  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    setWordCount(words);
    setCharCount(chars);
    setHasChanges(content !== originalContent);
  }, [content, originalContent]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, []);

  const handleReset = () => {
    setContent(originalContent);
    toast({
      title: "Content reset",
      description: "Your changes have been reverted to the original.",
    });
  };

  const handleSaveToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Your edited content has been copied.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleExportComplete = () => {
    clearDraft();
  };

  const getFilename = () => {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'document';
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return 'just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return lastSaved.toLocaleTimeString();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Content Editor
            </h1>
            <p className="text-sm text-muted-foreground">
              Edit and format your content before exporting
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveToClipboard}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Copy
          </Button>
          <ExportDropdown
            content={content}
            filename={getFilename()}
            disabled={!content.trim()}
          />
          <PostToLinkedInButton
            content={content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}
            source="editor"
            size="sm"
            variant="outline"
            className="gap-2"
            label="LinkedIn"
          />
        </div>
      </div>

      {/* Document Settings */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Document Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title..."
              className="max-w-md"
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              {isSaved ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-500">Saved {formatLastSaved()}</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-500">Saving...</span>
                </>
              )}
            </span>
            {hasChanges && (
              <>
                <span>•</span>
                <span className="text-muted-foreground/70">Modified from original</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rich Text Editor */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Content Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            content={content}
            onChange={setContent}
          />
        </CardContent>
      </Card>

      {/* Bottom Actions */}
      <div className="flex justify-end gap-2 pb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
        <ExportDropdown
          content={content}
          filename={getFilename()}
          disabled={!content.trim()}
        />
      </div>
    </div>
  );
}
