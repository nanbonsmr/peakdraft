import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: kindeUser, isLoading: kindeLoading, isAuthenticated, logout: kindeLogout } = useKindeAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const userEmail = kindeUser?.email || '';
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
    if (kindeUser?.id) {
      await fetchProfile(kindeUser.id);
    }
  };

  useEffect(() => {
    const syncUserProfile = async () => {
      if (!kindeLoading) {
        if (isAuthenticated && kindeUser) {
          // Try to fetch existing profile
          const { data: existingProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', kindeUser.id)
            .single();

          if (existingProfile && !error) {
            setProfile(existingProfile);
          } else if (error?.code === 'PGRST116') {
            // Profile doesn't exist, create one
            const displayName = kindeUser.givenName 
              ? `${kindeUser.givenName} ${kindeUser.familyName || ''}`.trim()
              : kindeUser.email || 'User';
            await createProfile(kindeUser.id, displayName);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    };

    syncUserProfile();
  }, [kindeLoading, isAuthenticated, kindeUser]);

  const user = kindeUser ? {
    id: kindeUser.id || '',
    email: kindeUser.email || '',
    firstName: kindeUser.givenName || undefined,
    lastName: kindeUser.familyName || undefined,
    imageUrl: kindeUser.picture || undefined,
  } : null;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading: kindeLoading || loading,
      refreshProfile,
      isSignedIn: isAuthenticated || false,
      isAdmin,
      logout: kindeLogout,
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
