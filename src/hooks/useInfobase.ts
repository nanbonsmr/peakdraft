import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type InfobaseEntry = {
  id: string;
  user_id: string;
  brand_name: string;
  description: string | null;
  industry: string | null;
  target_audience: string | null;
  tone_of_voice: string | null;
  website_url: string | null;
  products_services: string | null;
  unique_selling_points: string | null;
  additional_context: string | null;
  created_at: string;
  updated_at: string;
};

export function useInfobase() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<InfobaseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeEntry, setActiveEntry] = useState<InfobaseEntry | null>(null);

  const loadEntries = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from("infobase")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) {
      setEntries(data as InfobaseEntry[]);
      if (!activeEntry && data.length > 0) {
        setActiveEntry(data[0] as InfobaseEntry);
      }
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const saveEntry = useCallback(
    async (entry: Partial<InfobaseEntry> & { brand_name: string }) => {
      if (!user) return null;

      if (entry.id) {
        const { data, error } = await supabase
          .from("infobase")
          .update({ ...entry, updated_at: new Date().toISOString() })
          .eq("id", entry.id)
          .select()
          .single();
        if (!error && data) {
          const typed = data as InfobaseEntry;
          setEntries((prev) => prev.map((e) => (e.id === typed.id ? typed : e)));
          setActiveEntry(typed);
          return typed;
        }
      } else {
        const { data, error } = await supabase
          .from("infobase")
          .insert({ ...entry, user_id: user.id })
          .select()
          .single();
        if (!error && data) {
          const typed = data as InfobaseEntry;
          setEntries((prev) => [typed, ...prev]);
          setActiveEntry(typed);
          return typed;
        }
      }
      return null;
    },
    [user]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      await supabase.from("infobase").delete().eq("id", id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (activeEntry?.id === id) {
        setActiveEntry(null);
      }
    },
    [activeEntry]
  );

  const buildBrandContext = useCallback(
    (entry: InfobaseEntry | null): string => {
      if (!entry) return "";
      const parts: string[] = [];
      parts.push(`Brand/Company: ${entry.brand_name}`);
      if (entry.description) parts.push(`About: ${entry.description}`);
      if (entry.industry) parts.push(`Industry: ${entry.industry}`);
      if (entry.target_audience) parts.push(`Target Audience: ${entry.target_audience}`);
      if (entry.tone_of_voice) parts.push(`Brand Tone: ${entry.tone_of_voice}`);
      if (entry.products_services) parts.push(`Products/Services: ${entry.products_services}`);
      if (entry.unique_selling_points) parts.push(`USPs: ${entry.unique_selling_points}`);
      if (entry.website_url) parts.push(`Website: ${entry.website_url}`);
      if (entry.additional_context) parts.push(`Additional Context: ${entry.additional_context}`);
      return parts.join("\n");
    },
    []
  );

  return {
    entries,
    activeEntry,
    setActiveEntry,
    isLoading,
    loadEntries,
    saveEntry,
    deleteEntry,
    buildBrandContext,
  };
}
