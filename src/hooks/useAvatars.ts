import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Avatar {
  id: string;
  name: string;
  prompt: string;
  description: string | null;
  image_url: string;
  is_default: boolean;
}

export function useAvatars() {
  const { profile } = useAuth();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profile) { setAvatars([]); setLoading(false); return; }
    const { data } = await supabase
      .from('avatars')
      .select('id, name, prompt, description, image_url, is_default')
      .eq('user_id', profile.user_id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    setAvatars((data as Avatar[]) || []);
    setLoading(false);
  }, [profile]);

  useEffect(() => { refresh(); }, [refresh]);

  const defaultAvatar = avatars.find(a => a.is_default) || avatars[0] || null;

  const buildAvatarContext = (a?: Avatar | null) => {
    const av = a ?? defaultAvatar;
    if (!av) return '';
    return `\n\nAvatar/Persona context — when the content references "I", "me", or features a person, use this avatar consistently:\nName: ${av.name}\nDescription: ${av.description || av.prompt}`;
  };

  return { avatars, loading, defaultAvatar, refresh, buildAvatarContext };
}
