import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Declare FastSpring global
declare global {
  interface Window {
    fastspring?: any;
  }
}

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    words: 10000,
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
  const { user, refreshProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fastspringLoaded, setFastspringLoaded] = useState(false);
  const [storeId, setStoreId] = useState<string>('');

  useEffect(() => {
    const loadFastSpring = async () => {
      try {
        // Get store configuration from edge function
        const { data, error } = await supabase.functions.invoke('get-fastspring-config');
        
        if (error) throw error;
        
        if (data?.storeId) {
          setStoreId(data.storeId);
          
          // Load FastSpring Store Builder Library
          const script = document.createElement('script');
          script.src = 'https://d1f8f9xcsvx3ha.cloudfront.net/sbl/0.8.5/fastspring-builder.min.js';
          script.async = true;
          script.type = 'text/javascript';
          script.setAttribute('data-storefront', `${data.storeId}.onfastspring.com`);
          
          script.onload = () => {
            setFastspringLoaded(true);
            console.log('FastSpring loaded successfully');
          };

          script.onerror = () => {
            console.error('Failed to load FastSpring library');
            toast.error('Failed to load payment system');
          };

          document.body.appendChild(script);

          return () => {
            if (document.body.contains(script)) {
              document.body.removeChild(script);
            }
          };
        }
      } catch (error) {
        console.error('Failed to load FastSpring config:', error);
        toast.error('Failed to initialize payment system');
      }
    };

    loadFastSpring();
  }, []);

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

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast.error('Payment failed. Please try again.');
    setIsProcessing(false);
    setSelectedPlan(null);
  };

  const handleSelectPlan = async (plan: typeof plans[0]) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    if (!fastspringLoaded) {
      toast.error('Payment system is still loading. Please try again.');
      return;
    }

    setSelectedPlan(plan.id);
    setIsProcessing(true);

    try {
      // Create session via edge function
      const { data, error } = await supabase.functions.invoke('create-fastspring-session', {
        body: {
          planId: plan.id,
          userId: user.id
        }
      });

      if (error) throw error;

      if (!data.success || !data.sessionId) {
        throw new Error('Failed to create checkout session');
      }

      console.log('Session created:', data);

      // Open FastSpring checkout with session
      if (window.fastspring) {
        window.fastspring.builder.secure(data.sessionId, data.productPath);
        
        // Set up event listeners for checkout completion
        window.fastspring.builder.on('popup.closed', () => {
          setIsProcessing(false);
          setSelectedPlan(null);
        });

        window.fastspring.builder.on('data.ready', (orderData: any) => {
          if (orderData && orderData.status === 'completed') {
            handlePaymentSuccess(orderData);
          }
        });
      } else {
        throw new Error('FastSpring not initialized');
      }

    } catch (error: any) {
      console.error('Error creating checkout:', error);
      handlePaymentError(error);
      toast.error(error.message || 'Failed to start checkout process');
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
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-300 hover:shadow-elegant ${
              plan.popular ? 'border-primary shadow-glow' : ''
            } ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
          >
            {plan.popular && (
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
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                onClick={() => handleSelectPlan(plan)}
                disabled={isProcessing || !fastspringLoaded}
              >
                {isProcessing && selectedPlan === plan.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : !fastspringLoaded ? (
                  'Loading...'
                ) : (
                  plan.popular ? 'Get Started' : 'Choose Plan'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          All plans include a 7-day free trial. Cancel anytime.
        </p>
        <p className="text-xs text-muted-foreground">
          Payments are processed securely through FastSpring
        </p>
      </div>
    </div>
  );
}
