import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

declare global {
  interface Window {
    Paddle?: any;
  }
}

export function PaymentPlans({ onSuccess, discount = 0 }: PaymentPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paddleLoaded, setPaddleLoaded] = useState(false);
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const calculateDiscountedPrice = (originalPrice: number) => {
    return originalPrice * (1 - discount / 100);
  };

  useEffect(() => {
    // Load Paddle.js script
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = async () => {
      // Get client token from edge function
      try {
        const { data, error } = await supabase.functions.invoke('get-paddle-token');
        if (error) throw error;
        
        if (window.Paddle && data?.clientToken) {
          window.Paddle.Initialize({
            token: data.clientToken,
            eventCallback: (event: any) => {
              if (event.name === 'checkout.completed') {
                handlePaymentSuccess(event.data);
              } else if (event.name === 'checkout.error') {
                handlePaymentError(event.data);
              }
            }
          });
          setPaddleLoaded(true);
        }
      } catch (error) {
        console.error('Failed to initialize Paddle:', error);
        toast({
          title: "Initialization Error",
          description: "Failed to load payment system. Please refresh the page.",
          variant: "destructive"
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePaymentSuccess = async (data: any) => {
    try {
      setIsProcessing(true);
      
      console.log('Payment success:', data);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      await refreshProfile();
      
      toast({
        title: "Payment Successful!",
        description: `You've successfully upgraded to your new plan.`,
      });

      onSuccess?.();
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "There was an issue processing your payment. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Paddle error:', error);
    toast({
      title: "Payment Error",
      description: "There was an issue with the payment. Please try again.",
      variant: "destructive"
    });
    setIsProcessing(false);
    setSelectedPlan(null);
  };

  const handleSelectPlan = async (plan: typeof plans[0]) => {
    if (!paddleLoaded || !window.Paddle) {
      toast({
        title: "Not Ready",
        description: "Payment system is still loading. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase a plan.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setSelectedPlan(plan.id);

    try {
      // Create a checkout session via edge function
      const { data, error } = await supabase.functions.invoke('create-paddle-checkout', {
        body: {
          planId: plan.id,
          userId: user.id,
          amount: calculateDiscountedPrice(plan.price),
          discount: discount
        }
      });

      if (error) {
        // Handle edge function errors
        const errorMessage = data?.error || error.message || "Failed to start checkout";
        throw new Error(errorMessage);
      }

      if (data?.priceId) {
        // Open Paddle checkout
        window.Paddle.Checkout.open({
          items: [{
            priceId: data.priceId,
            quantity: 1
          }],
          customData: {
            userId: user.id,
            planId: plan.id
          }
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      // Extract meaningful error message
      let errorMessage = "Failed to start checkout. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Checkout Error",
        description: errorMessage,
        variant: "destructive",
        duration: 6000
      });
      setSelectedPlan(null);
    } finally {
      setIsProcessing(false);
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
                disabled={isProcessing || !paddleLoaded}
              >
                {isProcessing && selectedPlan === plan.id 
                  ? 'Processing...' 
                  : !paddleLoaded 
                  ? 'Loading...' 
                  : plan.popular 
                  ? 'Get Started' 
                  : 'Choose Plan'}
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
          Payments are processed securely through Paddle
        </p>
      </div>
    </div>
  );
}
