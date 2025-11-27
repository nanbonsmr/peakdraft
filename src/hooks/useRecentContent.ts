import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useRecentContent(templateType: string) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [recentContent, setRecentContent] = useState<any[]>([]);

  const loadRecentContent = async () => {
    if (!profile) return;
    
    const { data } = await supabase
      .from('content_generations')
      .select('*')
      .eq('user_id', profile.user_id)
      .eq('template_type', templateType)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setRecentContent(data);
    }
  };

  const copyContentToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard."
    });
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('content_generations')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      setRecentContent(prev => prev.filter(item => item.id !== contentId));
      
      toast({
        title: "Deleted!",
        description: "Content deleted successfully."
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete content.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadRecentContent();
  }, [profile]);

  return {
    recentContent,
    loadRecentContent,
    copyContentToClipboard,
    handleDeleteContent
  };
}
