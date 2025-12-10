import { SignIn, SignUp, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool, Sparkles } from 'lucide-react';

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')} 
          className="mb-6"
        >
          ← Return to Home Page
        </Button>
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <PenTool className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">quickwriteapp</h1>
          </div>
          <p className="text-muted-foreground">
            Generate amazing content with AI-powered writing tools
          </p>
        </div>

        <Card className="border-elegant shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Get Started
            </CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
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
                      socialButtonsBlockButton: "border border-border hover:bg-muted text-foreground",
                      socialButtonsBlockButtonText: "text-foreground",
                      formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                      footerAction: "hidden",
                      formFieldInput: "bg-background border-border",
                      formFieldLabel: "text-foreground",
                      identityPreviewText: "text-foreground",
                      identityPreviewEditButton: "text-primary",
                      dividerLine: "bg-border",
                      dividerText: "text-muted-foreground",
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
                      socialButtonsBlockButton: "border border-border hover:bg-muted text-foreground",
                      socialButtonsBlockButtonText: "text-foreground",
                      formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                      footerAction: "hidden",
                      formFieldInput: "bg-background border-border",
                      formFieldLabel: "text-foreground",
                      identityPreviewText: "text-foreground",
                      identityPreviewEditButton: "text-primary",
                      dividerLine: "bg-border",
                      dividerText: "text-muted-foreground",
                    }
                  }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
