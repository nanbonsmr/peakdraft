import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowLeft, Zap, Shield, Globe, LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';
import FloatingParticles from '@/components/FloatingParticles';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const { isSignedIn, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isSignedIn) {
      navigate('/app', { replace: true });
    }
  }, [isSignedIn, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          navigate('/app', { replace: true });
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account created!",
            description: "Please check your email to confirm your account.",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_1px_1px,rgba(156,146,172,0.15)_1px,transparent_0)] bg-[length:40px_40px]"></div>
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[450px] lg:w-[600px] h-[300px] sm:h-[450px] lg:h-[600px] bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-full blur-3xl"></div>
        <FloatingParticles />
      </div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-between p-12">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="text-white/80 hover:text-white hover:bg-white/10 -ml-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="PeakDraft Logo" className="w-14 h-14 rounded-xl shadow-lg" />
            <h1 className="text-3xl font-bold text-white">PeakDraft</h1>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Write Better Content<br />
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">10x Faster</span>
            </h2>
            <p className="text-lg text-white/60 max-w-md">
              Harness the power of AI to create compelling content that converts. Join thousands of creators already transforming their workflow.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-white/80">
              <div className="p-2 bg-white/10 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-400" />
              </div>
              <span>Generate content in seconds, not hours</span>
            </div>
            <div className="flex items-center gap-4 text-white/80">
              <div className="p-2 bg-white/10 rounded-lg">
                <Shield className="h-5 w-5 text-green-400" />
              </div>
              <span>Enterprise-grade security & privacy</span>
            </div>
            <div className="flex items-center gap-4 text-white/80">
              <div className="p-2 bg-white/10 rounded-lg">
                <Globe className="h-5 w-5 text-blue-400" />
              </div>
              <span>Support for 50+ languages</span>
            </div>
          </div>
        </div>

        <p className="text-white/40 text-sm">
          © 2024 PeakDraft. All rights reserved.
        </p>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-6 sm:p-6 relative z-10">
        <div className="w-full max-w-[360px] sm:max-w-md">
          {/* Mobile back button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="lg:hidden mb-4 sm:mb-6 text-white/80 hover:text-white hover:bg-white/10 -ml-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
              <img src="/favicon.png" alt="PeakDraft Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
              <h1 className="text-lg sm:text-xl font-bold text-white">PeakDraft</h1>
            </div>
            <p className="text-white/60 text-xs sm:text-sm">AI-powered content generation</p>
          </div>

          <Card className="border border-white/10 bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_80px_rgba(139,92,246,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-xl sm:rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-2 px-4 sm:px-6 pt-4 sm:pt-6 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />
              <CardTitle className="flex items-center justify-center gap-2 text-white text-xl sm:text-2xl relative z-10">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <CardDescription className="text-white/70 relative z-10 text-xs sm:text-sm">
                {isLogin ? 'Sign in to your account' : 'Sign up to get started'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3 sm:pt-4 px-4 sm:px-6 pb-4 sm:pb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-500/5 to-transparent pointer-events-none" />
              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-white/80">Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="Your name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/80">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 transition-all duration-200"
                  size="lg"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : isLogin ? (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-white/50">or</span>
                  </div>
                </div>

                <Button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  variant="outline"
                  className="w-full border-white/20 hover:bg-white/10 text-white bg-white/5 transition-all duration-200"
                  size="lg"
                >
                  {isLogin ? (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In Instead
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-white/40 text-[10px] sm:text-xs mt-4 sm:mt-6 px-2">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
