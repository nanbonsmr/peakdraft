import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

// Admin email - you can add more emails here
const ADMIN_EMAILS = ['nanbondev@gmail.com'];

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  subscription_plan: string;
  words_used: number;
  words_limit: number;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: { id: string; email: string; firstName?: string; lastName?: string; imageUrl?: string } | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  isSignedIn: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const userEmail = clerkUser?.emailAddresses[0]?.emailAddress || '';
  const isAdmin = ADMIN_EMAILS.includes(userEmail.toLowerCase());

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (data && !error) {
      setProfile(data);
    }
    return { data, error };
  };

  const createProfile = async (userId: string, displayName: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        display_name: displayName,
        subscription_plan: 'free',
        words_limit: 500,
        words_used: 0,
      })
      .select()
      .single();

    if (data && !error) {
      setProfile(data);
    }
    return { data, error };
  };

  const refreshProfile = async () => {
    if (clerkUser) {
      await fetchProfile(clerkUser.id);
    }
  };

  useEffect(() => {
    const syncUserProfile = async () => {
      if (isLoaded) {
        if (isSignedIn && clerkUser) {
          // Try to fetch existing profile
          const { data: existingProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', clerkUser.id)
            .single();

          if (existingProfile && !error) {
            setProfile(existingProfile);
          } else if (error?.code === 'PGRST116') {
            // Profile doesn't exist, create one
            const displayName = clerkUser.firstName 
              ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
              : clerkUser.emailAddresses[0]?.emailAddress || 'User';
            await createProfile(clerkUser.id, displayName);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    };

    syncUserProfile();
  }, [isLoaded, isSignedIn, clerkUser]);

  const user = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    firstName: clerkUser.firstName || undefined,
    lastName: clerkUser.lastName || undefined,
    imageUrl: clerkUser.imageUrl,
  } : null;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading: !isLoaded || loading,
      refreshProfile,
      isSignedIn: isSignedIn || false,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
