import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, UserCircle2, Plus, Trash2, Star, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export interface AvatarRecord {
  id: string;
  user_id: string;
  name: string;
  prompt: string;
  description: string | null;
  image_url: string;
  reference_url: string | null;
  is_default: boolean;
  created_at: string;
}

export default function Avatars() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [avatars, setAvatars] = useState<AvatarRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('avatars')
      .select('*')
      .eq('user_id', profile.user_id)
      .order('created_at', { ascending: false });
    if (!error) setAvatars((data as AvatarRecord[]) || []);
    setLoading(false);
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const base64ToBlob = (base64: string): Blob => {
    const parts = base64.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
    const raw = atob(parts[1]);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return new Blob([arr], { type: mime });
  };

  const uploadToStorage = async (blob: Blob, suffix: string): Promise<string> => {
    if (!profile) throw new Error('Not authenticated');
    const fileName = `${profile.user_id}/${Date.now()}-${suffix}.png`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, { contentType: 'image/png', upsert: false });
    if (error) throw error;
    return supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
  };

  const handleReferenceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Reference image must be under 5MB', variant: 'destructive' });
      return;
    }
    setReferenceFile(file);
    setReferencePreview(await fileToBase64(file));
  };

  const handleCreate = async () => {
    if (!name.trim() || !prompt.trim() || !profile) {
      toast({ title: 'Missing info', description: 'Avatar needs a name and a prompt.', variant: 'destructive' });
      return;
    }
    if ((profile.words_used || 0) >= (profile.words_limit || 500)) {
      toast({ title: 'Limit reached', description: 'Upgrade your plan to create avatars.', variant: 'destructive' });
      navigate('/app/pricing');
      return;
    }

    setGenerating(true);
    try {
      let referenceUrl: string | null = null;
      if (referenceFile) {
        const refBase64 = await fileToBase64(referenceFile);
        referenceUrl = await uploadToStorage(base64ToBlob(refBase64), 'ref');
      }

      const fullPrompt = referenceUrl
        ? `Create a consistent character/avatar portrait inspired by the reference image. ${prompt}. Studio quality, clean background, suitable as a reusable brand avatar.`
        : `Create a consistent character/avatar portrait. ${prompt}. Studio quality, clean background, suitable as a reusable brand avatar.`;

      const body: Record<string, unknown> = {
        prompt: fullPrompt,
        template_type: 'logo',
        style_preset: 'professional',
      };
      if (referenceUrl) {
        body.mode = 'edit';
        body.source_image_url = referenceUrl;
        body.edit_instruction = `Transform this into a polished avatar portrait: ${prompt}`;
      }

      const { data, error } = await supabase.functions.invoke('generate-image', { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const imageUrl = await uploadToStorage(base64ToBlob(data.image_url), 'avatar');
      const description = (data.description as string)?.slice(0, 500) || prompt;

      const { error: insErr } = await supabase.from('avatars').insert({
        user_id: profile.user_id,
        name: name.trim(),
        prompt,
        description,
        image_url: imageUrl,
        reference_url: referenceUrl,
        is_default: avatars.length === 0,
      });
      if (insErr) throw insErr;

      await supabase.rpc('update_word_usage', { user_uuid: profile.user_id, words_to_add: 50 });
      await refreshProfile();

      toast({ title: 'Avatar created!', description: 'You can now use it in posts and image generation.' });
      setOpen(false);
      setName(''); setPrompt(''); setReferenceFile(null); setReferencePreview(null);
      await load();
    } catch (err: any) {
      toast({ title: 'Avatar creation failed', description: err.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const setDefault = async (id: string) => {
    if (!profile) return;
    await supabase.from('avatars').update({ is_default: false }).eq('user_id', profile.user_id);
    await supabase.from('avatars').update({ is_default: true }).eq('id', id);
    toast({ title: 'Default avatar updated' });
    await load();
  };

  const remove = async (a: AvatarRecord) => {
    try {
      const url = new URL(a.image_url);
      const path = url.pathname.split('/avatars/')[1];
      if (path) await supabase.storage.from('avatars').remove([decodeURIComponent(path)]);
      await supabase.from('avatars').delete().eq('id', a.id);
      toast({ title: 'Avatar deleted' });
      await load();
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Avatars - Reusable AI Personas | PeakDraft</title>
        <meta name="description" content="Create AI-generated avatars from a prompt or reference photo. Reuse consistent avatars across your social posts, image generation, and workflows." />
      </Helmet>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20">
                <UserCircle2 className="h-6 w-6 text-primary" />
              </div>
              Avatars
              <Badge variant="secondary" className="bg-amber-500/15 text-amber-400 border-amber-500/20">New</Badge>
            </h1>
            <p className="text-muted-foreground/80 mt-1.5 text-sm">
              Create a reusable AI persona once. Use it in posts, image generation, and workflows.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Avatar
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : avatars.length === 0 ? (
          <Card className="border-dashed border-border/40 bg-background/40 backdrop-blur-sm">
            <CardContent className="py-16 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <UserCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">No avatars yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Describe a person, character, or mascot and we'll generate a consistent avatar for reuse.
                </p>
              </div>
              <Button onClick={() => setOpen(true)} className="gap-2"><Sparkles className="h-4 w-4" /> Create your first avatar</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {avatars.map((a) => (
              <Card key={a.id} className="overflow-hidden border-border/30 bg-background/60 backdrop-blur-sm group">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img src={a.image_url} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {a.is_default && (
                    <Badge className="absolute top-2 left-2 bg-amber-500 text-amber-50 border-0 gap-1">
                      <Star className="h-3 w-3 fill-current" /> Default
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold truncate">{a.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{a.prompt}</p>
                  </div>
                  <div className="flex gap-2">
                    {!a.is_default && (
                      <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => setDefault(a.id)}>
                        <Star className="h-3.5 w-3.5" /> Set default
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(a)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" /> Where avatars are used</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1.5">
            <p>• <span className="text-foreground font-medium">Image Generation</span> — pick an avatar to keep your character consistent across visuals.</p>
            <p>• <span className="text-foreground font-medium">Social Media + Post templates</span> — your default avatar context is auto-injected.</p>
            <p>• <span className="text-foreground font-medium">Workflow Hero / Social Pack</span> — generated visuals will feature your default avatar.</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Create an Avatar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Avatar name</label>
              <Input placeholder="e.g. Brand Mascot, Founder Portrait" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Describe the avatar</label>
              <Textarea
                placeholder="e.g. A friendly young woman with curly red hair, freckles, wearing a denim jacket, warm smile, soft natural lighting"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Reference photo (optional)</label>
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-dashed border-border hover:border-primary/40 text-sm text-muted-foreground hover:text-foreground transition">
                  <Upload className="h-4 w-4" /> {referenceFile ? referenceFile.name : 'Upload a photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleReferenceChange} />
                </label>
                {referencePreview && (
                  <img src={referencePreview} alt="ref" className="w-12 h-12 rounded-md object-cover border border-border" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">If provided, we'll stylize the photo into your avatar.</p>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
              Cost: <span className="font-semibold text-foreground">50 words</span> per avatar (same as image generation).
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={generating}>Cancel</Button>
            <Button onClick={handleCreate} disabled={generating} className="gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? 'Generating…' : 'Generate Avatar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
