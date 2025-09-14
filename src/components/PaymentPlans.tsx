import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
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
}

export function PaymentPlans({ onSuccess }: PaymentPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const handlePaymentSuccess = async (planId: string, details: any) => {
    try {
      setIsProcessing(true);
      
      // Call edge function to verify payment and update subscription
      const { data, error } = await supabase.functions.invoke('handle-payment', {
        body: {
          userId: user?.id,
          planId,
          paymentDetails: details,
          provider: 'paypal'
        }
      });

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Payment Successful!",
        description: `You've successfully upgraded to ${plans.find(p => p.id === planId)?.name} plan.`,
      });

      onSuccess?.();
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Error",
        description: "There was an issue processing your payment. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const paypalInitialOptions = {
    clientId: process.env.NODE_ENV === 'production' 
      ? "YOUR_PAYPAL_CLIENT_ID_PROD" 
      : "YOUR_PAYPAL_CLIENT_ID_SANDBOX",
    currency: "USD",
    intent: "capture"
  };

  return (
    <PayPalScriptProvider options={paypalInitialOptions}>
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
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
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
                {selectedPlan === plan.id ? (
                  <div className="w-full space-y-4">
                    <PayPalButtons
                      style={{ layout: "vertical" }}
                      disabled={isProcessing}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [{
                            amount: {
                              value: plan.price.toString(),
                              currency_code: "USD"
                            },
                            description: `${plan.name} Plan - ${plan.words.toLocaleString()} words/month`
                          }]
                        });
                      }}
                      onApprove={async (data, actions) => {
                        if (actions.order) {
                          const details = await actions.order.capture();
                          handlePaymentSuccess(plan.id, details);
                        }
                      }}
                      onError={(err) => {
                        console.error('PayPal error:', err);
                        toast({
                          title: "Payment Error",
                          description: "There was an issue with PayPal. Please try again.",
                          variant: "destructive"
                        });
                        setSelectedPlan(null);
                      }}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedPlan(null)}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedPlan(plan.id)}
                    disabled={isProcessing}
                  >
                    {plan.popular ? 'Get Started' : 'Choose Plan'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            All plans include a 7-day free trial. Cancel anytime.
          </p>
          <p className="text-xs text-muted-foreground">
            Payments are processed securely through PayPal
          </p>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}