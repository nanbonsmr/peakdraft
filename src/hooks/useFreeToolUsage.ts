import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const DAILY_FREE_LIMIT = 20;

export function useFreeToolUsage() {
  const [usageCount, setUsageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const isPremium = profile?.subscription_plan && profile.subscription_plan !== 'free';
  const remaining = isPremium ? Infinity : Math.max(0, DAILY_FREE_LIMIT - usageCount);
  const hasReachedLimit = !isPremium && usageCount >= DAILY_FREE_LIMIT;

  const loadUsage = useCallback(async () => {
    if (!user) return;
    if (isPremium) {
      setIsLoading(false);
      return;
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('free_tool_usage' as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('usage_date', today);

      if (error) throw error;
      setUsageCount(count || 0);
    } catch (err) {
      console.error('Failed to load free tool usage:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isPremium]);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  const recordUsage = useCallback(async (toolId: string): Promise<boolean> => {
    if (!user) return false;
    if (isPremium) return true; // Premium users bypass cap

    if (hasReachedLimit) {
      toast({
        title: "Daily Limit Reached",
        description: `You've used all ${DAILY_FREE_LIMIT} free generations for today. Upgrade for unlimited access!`,
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('free_tool_usage' as any)
        .insert({ user_id: user.id, tool_id: toolId } as any);

      if (error) throw error;
      setUsageCount(prev => prev + 1);
      return true;
    } catch (err) {
      console.error('Failed to record free tool usage:', err);
      return true;
    }
  }, [user, isPremium, hasReachedLimit, toast]);

  return {
    usageCount,
    remaining,
    hasReachedLimit,
    isPremium: !!isPremium,
    isLoading,
    recordUsage,
    dailyLimit: DAILY_FREE_LIMIT,
  };
}
