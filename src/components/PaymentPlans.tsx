import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Declare Paddle global
declare global {
  interface Window {
    Paddle?: any;
  }
}

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    words: 10000,
    tier: 1,
    description: 'Perfect for individuals and small projects',
    features: [
      '10,000 words per month',
      'All content templates',
      'Basic support',
      'Export to multiple formats'
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    words: 50000,
    tier: 2,
    description: 'Ideal for professionals and growing businesses',
    features: [
      '50,000 words per month',
      'All content templates',
      'Priority support',
      'API access',
      'Team collaboration',
      'Advanced analytics'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    words: 200000,
    tier: 3,
    description: 'For large teams and agencies',
    features: [
      '200,000 words per month',
      'All content templates',
      '24/7 dedicated support',
      'Full API access',
      'White-label options',
      'Custom integrations',
      'Advanced security'
    ],
    popular: false
  }
];

interface PaymentPlansProps {
  onSuccess?: () => void;
  discount?: number;
}

export function PaymentPlans({ onSuccess, discount = 0 }: PaymentPlansProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paddleLoaded, setPaddleLoaded] = useState(false);

  useEffect(() => {
    const loadPaddle = async () => {
      try {
        // Load Paddle.js script
        if (!document.getElementById('paddle-js')) {
          const script = document.createElement('script');
          script.id = 'paddle-js';
          script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
          script.async = true;
          
          script.onload = () => {
            console.log('Paddle script loaded');
            // Initialize Paddle after script loads
            initializePaddle();
          };

          script.onerror = (error) => {
            console.error('Failed to load Paddle script:', error);
            toast.error('Failed to load payment system');
          };

          document.head.appendChild(script);
        } else if (window.Paddle) {
          initializePaddle();
        }
      } catch (error) {
        console.error('Failed to load Paddle:', error);
        toast.error('Failed to initialize payment system');
      }
    };

    const initializePaddle = async () => {
      try {
        // Get client token from edge function
        const { data, error } = await supabase.functions.invoke('create-paddle-checkout', {
          body: { planId: 'basic', userId: user?.id || 'init' }
        });

        if (data?.clientToken && window.Paddle) {
          // Determine environment based on client token prefix
          const isLive = data.clientToken.startsWith('live_');
          
          // Set environment BEFORE initializing (required for Paddle v2)
          window.Paddle.Environment.set(isLive ? 'production' : 'sandbox');
          
          window.Paddle.Initialize({
            token: data.clientToken,
            eventCallback: (event: any) => {
              console.log('Paddle event:', event);
              if (event.name === 'checkout.completed') {
                handlePaymentSuccess(event.data);
              } else if (event.name === 'checkout.closed') {
                setIsProcessing(false);
                setSelectedPlan(null);
              } else if (event.name === 'checkout.error') {
                console.error('Paddle checkout error:', event);
                toast.error('Payment error. Please try again.');
                setIsProcessing(false);
                setSelectedPlan(null);
              }
            }
          });
          setPaddleLoaded(true);
          console.log('Paddle initialized successfully, environment:', isLive ? 'production' : 'sandbox');
        }
      } catch (error) {
        console.error('Failed to initialize Paddle:', error);
      }
    };

    if (user) {
      loadPaddle();
    }
  }, [user]);

  const calculateDiscountedPrice = (originalPrice: number) => {
    if (discount > 0) {
      return originalPrice * (1 - discount / 100);
    }
    return originalPrice;
  };

  const handlePaymentSuccess = async (data: any) => {
    console.log('Payment successful:', data);
    toast.success('Payment successful! Your subscription is now active.');
    
    await refreshProfile();
    
    if (onSuccess) {
      onSuccess();
    }
    
    setIsProcessing(false);
    setSelectedPlan(null);
  };

  const handleSelectPlan = async (plan: typeof plans[0]) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    if (!paddleLoaded || !window.Paddle) {
      toast.error('Payment system is still loading. Please try again.');
      return;
    }

    setSelectedPlan(plan.id);
    setIsProcessing(true);

    try {
      // Get checkout data from edge function
      const { data, error } = await supabase.functions.invoke('create-paddle-checkout', {
        body: {
          planId: plan.id,
          userId: user.id
        }
      });

      if (error) throw error;

      if (!data.success || !data.priceId) {
        throw new Error('Failed to create checkout session');
      }

      console.log('Opening Paddle checkout with data:', JSON.stringify(data, null, 2));

      // Open Paddle checkout with proper error handling
      try {
        await window.Paddle.Checkout.open({
          items: [{ priceId: data.priceId, quantity: 1 }],
          customer: {
            email: data.customerEmail
          },
          customData: data.customData,
          settings: {
            displayMode: 'overlay',
            theme: 'light',
            locale: 'en',
            allowLogout: false
          }
        });
      } catch (checkoutError: any) {
        console.error('Paddle Checkout.open error:', checkoutError);
        toast.error(checkoutError?.message || 'Failed to open checkout');
        setIsProcessing(false);
        setSelectedPlan(null);
      }

    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast.error(error.message || 'Failed to start checkout process');
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please log in to view pricing plans</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Choose Your Plan
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Unlock the full potential of AI-powered content generation with our flexible pricing plans
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const currentPlan = profile?.subscription_plan?.toLowerCase();
          const isCurrentPlan = currentPlan === plan.id;
          const currentPlanTier = plans.find(p => p.id === currentPlan)?.tier || 0;
          const isUpgrade = plan.tier > currentPlanTier;
          const isDowngrade = plan.tier < currentPlanTier && currentPlanTier > 0;
          
          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:shadow-elegant ${
                plan.popular ? 'border-primary shadow-glow' : ''
              } ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''} ${
                isCurrentPlan ? 'border-green-500 bg-green-500/5' : ''
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-4 py-1">
                    <Check className="w-3 h-3 mr-1" />
                    Current Plan
                  </Badge>
                </div>
              )}
              {!isCurrentPlan && plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-primary text-primary-foreground px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                <div className="flex items-center justify-center space-x-1">
                  {discount > 0 && (
                    <span className="text-lg line-through text-muted-foreground">${plan.price}</span>
                  )}
                  <span className="text-3xl font-bold">${calculateDiscountedPrice(plan.price).toFixed(2)}</span>
                  <span className="text-muted-foreground">/month</span>
                  {discount > 0 && (
                    <Badge variant="secondary" className="ml-2">{discount}% OFF</Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-center space-x-2 p-3 bg-primary/5 rounded-lg">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-medium">{plan.words.toLocaleString()} words/month</span>
                </div>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button 
                  className={`w-full transition-opacity ${
                    isCurrentPlan 
                      ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                      : isDowngrade 
                        ? 'bg-orange-500 hover:bg-orange-600' 
                        : 'bg-gradient-primary hover:opacity-90'
                  }`}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isProcessing || !paddleLoaded || isCurrentPlan}
                >
                  {isProcessing && selectedPlan === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : !paddleLoaded ? (
                    'Loading...'
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : isUpgrade ? (
                    <>
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Upgrade
                    </>
                  ) : isDowngrade ? (
                    <>
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Downgrade
                    </>
                  ) : (
                    plan.popular ? 'Get Started' : 'Choose Plan'
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          All plans include a 7-day free trial. Cancel anytime.
        </p>
        <p className="text-xs text-muted-foreground">
          Payments are processed securely through Paddle
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          By subscribing, you agree to our{' '}
          <a href="/terms" className="underline hover:text-primary">Terms & Conditions</a>
          {' '}and{' '}
          <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
