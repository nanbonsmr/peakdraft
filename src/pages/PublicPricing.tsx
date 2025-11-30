import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, Zap, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    words: 50000,
    description: 'Perfect for individuals and small projects',
    features: [
      '50,000 words per month',
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
    words: 100000,
    description: 'Ideal for professionals and growing businesses',
    features: [
      '100,000 words per month',
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

const comparisonFeatures = [
  { category: 'Content Generation', features: [
    { name: 'Words per month', basic: '50,000', pro: '100,000', enterprise: '200,000' },
    { name: 'All content templates', basic: true, pro: true, enterprise: true },
    { name: 'Export formats', basic: 'Basic', pro: 'Advanced', enterprise: 'All formats' },
  ]},
  { category: 'Support & Collaboration', features: [
    { name: 'Support level', basic: 'Basic', pro: 'Priority', enterprise: '24/7 Dedicated' },
    { name: 'Response time', basic: '48 hours', pro: '24 hours', enterprise: '1 hour' },
    { name: 'Team collaboration', basic: false, pro: true, enterprise: true },
    { name: 'User seats', basic: '1', pro: '5', enterprise: 'Unlimited' },
  ]},
  { category: 'Advanced Features', features: [
    { name: 'API access', basic: false, pro: true, enterprise: true },
    { name: 'Advanced analytics', basic: false, pro: true, enterprise: true },
    { name: 'White-label options', basic: false, pro: false, enterprise: true },
    { name: 'Custom integrations', basic: false, pro: false, enterprise: true },
    { name: 'Priority processing', basic: false, pro: true, enterprise: true },
    { name: 'Dedicated account manager', basic: false, pro: false, enterprise: true },
  ]},
  { category: 'Security & Compliance', features: [
    { name: 'Data encryption', basic: true, pro: true, enterprise: true },
    { name: 'SSO/SAML', basic: false, pro: false, enterprise: true },
    { name: 'Advanced security', basic: false, pro: false, enterprise: true },
    { name: 'Custom SLA', basic: false, pro: false, enterprise: true },
  ]},
];

export default function PublicPricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const handleSelectPlan = () => {
    if (user) {
      navigate('/app/pricing');
    } else {
      navigate('/auth');
    }
  };

  const renderValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-primary mx-auto" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto space-y-16 py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for you. All plans include a 7-day free trial.
          </p>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:shadow-elegant ${
                plan.popular ? 'border-primary shadow-glow scale-105' : ''
              } ${hoveredPlan === plan.id ? 'scale-105' : ''}`}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-primary text-primary-foreground px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
                <div className="flex items-center justify-center space-x-1 mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-center space-x-2 p-3 bg-primary/5 rounded-lg">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-medium">{plan.words.toLocaleString()} words/month</span>
                </div>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  onClick={handleSelectPlan}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {user ? 'Choose Plan' : 'Start Free Trial'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            All plans include a 7-day free trial. No credit card required.
          </p>
          <p className="text-xs text-muted-foreground">
            Payments are processed securely through FastSpring
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            By subscribing, you agree to our{' '}
            <a href="/terms" className="underline hover:text-primary">Terms & Conditions</a>
            {' '}and{' '}
            <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>
          </p>
        </div>

        {/* Comparison Table */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Detailed Plan Comparison</h2>
            <p className="text-muted-foreground">
              Compare all features across our plans to find the perfect fit
            </p>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold min-w-[200px]">Features</th>
                    <th className="text-center p-4 font-semibold min-w-[150px]">Basic</th>
                    <th className="text-center p-4 font-semibold min-w-[150px]">
                      <div className="flex items-center justify-center gap-2">
                        Pro
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Popular</span>
                      </div>
                    </th>
                    <th className="text-center p-4 font-semibold min-w-[150px]">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((section, sectionIdx) => (
                    <>
                      <tr key={`section-${sectionIdx}`} className="bg-muted/30">
                        <td colSpan={4} className="p-4 font-semibold text-sm">
                          {section.category}
                        </td>
                      </tr>
                      {section.features.map((feature, featureIdx) => (
                        <tr 
                          key={`feature-${sectionIdx}-${featureIdx}`}
                          className="border-t border-border/50 hover:bg-muted/20 transition-colors"
                        >
                          <td className="p-4 text-sm">{feature.name}</td>
                          <td className="p-4 text-center">{renderValue(feature.basic)}</td>
                          <td className="p-4 text-center bg-primary/5">{renderValue(feature.pro)}</td>
                          <td className="p-4 text-center">{renderValue(feature.enterprise)}</td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="p-8 bg-muted/30">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="font-semibold mb-2">30-Day Money Back</h4>
              <p className="text-sm text-muted-foreground">
                Not satisfied? Get a full refund within 30 days, no questions asked.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Cancel Anytime</h4>
              <p className="text-sm text-muted-foreground">
                No long-term contracts. Cancel your subscription at any time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Need Help Choosing?</h4>
              <p className="text-sm text-muted-foreground">
                <a href="/contact" className="text-primary hover:underline">Contact us</a> and we'll help you find the right plan.
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <Card className="p-8 sm:p-12 text-center bg-gradient-to-br from-primary/10 via-primary-glow/5 to-accent/10 border-primary/20">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-6">
            Join thousands of content creators using QuickWrite AI
          </p>
          <Button size="lg" onClick={handleSelectPlan}>
            {user ? 'Choose Your Plan' : 'Start Your Free Trial'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
