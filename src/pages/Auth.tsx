import { SignIn, SignUp, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool, Sparkles, ArrowLeft, Zap, Shield, Globe } from 'lucide-react';

export default function Auth() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('signin');

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/app', { replace: true });
    }
  }, [isSignedIn, isLoaded, navigate]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-full blur-3xl"></div>
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
            <div className="p-3 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl shadow-lg shadow-violet-500/30">
              <PenTool className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">quickwriteapp</h1>
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
          © 2024 quickwriteapp. All rights reserved.
        </p>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile back button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="lg:hidden mb-6 text-white/80 hover:text-white hover:bg-white/10 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg">
                <PenTool className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">quickwriteapp</h1>
            </div>
            <p className="text-white/60 text-sm">AI-powered content generation</p>
          </div>

          <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/20">
            <CardHeader className="text-center pb-2">
              <CardTitle className="flex items-center justify-center gap-2 text-white text-2xl">
                <Sparkles className="h-5 w-5 text-violet-400" />
                {activeTab === 'signin' ? 'Welcome Back' : 'Get Started'}
              </CardTitle>
              <CardDescription className="text-white/60">
                {activeTab === 'signin' 
                  ? 'Sign in to continue creating amazing content' 
                  : 'Create your account and start writing'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-white/10 p-1">
                  <TabsTrigger 
                    value="signin" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white text-white/70 transition-all duration-300"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white text-white/70 transition-all duration-300"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="flex justify-center">
                  <SignIn 
                    routing="hash"
                    signUpUrl="#"
                    afterSignInUrl="/app"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "shadow-none border-0 bg-transparent p-0",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        socialButtonsBlockButton: "border border-white/20 hover:bg-white/10 text-white bg-white/5 transition-all duration-200",
                        socialButtonsBlockButtonText: "text-white font-medium",
                        formButtonPrimary: "bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 transition-all duration-200",
                        footerAction: "hidden",
                        formFieldInput: "bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-violet-400 focus:ring-violet-400/20",
                        formFieldLabel: "text-white/80",
                        identityPreviewText: "text-white",
                        identityPreviewEditButton: "text-violet-400 hover:text-violet-300",
                        dividerLine: "bg-white/20",
                        dividerText: "text-white/50",
                        formFieldInputShowPasswordButton: "text-white/60 hover:text-white",
                        alert: "bg-red-500/20 border-red-500/30 text-red-200",
                        alertText: "text-red-200",
                      }
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="signup" className="flex justify-center">
                  <SignUp 
                    routing="hash"
                    signInUrl="#"
                    afterSignUpUrl="/app"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "shadow-none border-0 bg-transparent p-0",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        socialButtonsBlockButton: "border border-white/20 hover:bg-white/10 text-white bg-white/5 transition-all duration-200",
                        socialButtonsBlockButtonText: "text-white font-medium",
                        formButtonPrimary: "bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 transition-all duration-200",
                        footerAction: "hidden",
                        formFieldInput: "bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-violet-400 focus:ring-violet-400/20",
                        formFieldLabel: "text-white/80",
                        identityPreviewText: "text-white",
                        identityPreviewEditButton: "text-violet-400 hover:text-violet-300",
                        dividerLine: "bg-white/20",
                        dividerText: "text-white/50",
                        formFieldInputShowPasswordButton: "text-white/60 hover:text-white",
                        alert: "bg-red-500/20 border-red-500/30 text-red-200",
                        alertText: "text-red-200",
                      }
                    }}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="text-center text-white/40 text-xs mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
