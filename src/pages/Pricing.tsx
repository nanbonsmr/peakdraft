import React from 'react';
import { PaymentPlans } from '@/components/PaymentPlans';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

const comparisonFeatures = [
  { category: 'Content Generation', features: [
    { name: 'Words per month', basic: '10,000', pro: '50,000', enterprise: '200,000' },
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

export default function Pricing() {
  const navigate = useNavigate();

  const handlePaymentSuccess = () => {
    navigate('/app');
  };

  const renderValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mx-auto" />
      ) : (
        <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mx-auto" />
      );
    }
    return <span className="text-xs sm:text-sm">{value}</span>;
  };

  // Mobile card view for comparison
  const MobileComparisonCard = ({ planName, planKey }: { planName: string; planKey: 'basic' | 'pro' | 'enterprise' }) => (
    <Card className={`p-4 ${planKey === 'pro' ? 'border-primary' : ''}`}>
      <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
        {planName}
        {planKey === 'pro' && (
          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Popular</span>
        )}
      </h4>
      {comparisonFeatures.map((section, sectionIdx) => (
        <div key={sectionIdx} className="mb-4">
          <h5 className="text-sm font-medium text-muted-foreground mb-2">{section.category}</h5>
          <ul className="space-y-2">
            {section.features.map((feature, featureIdx) => (
              <li key={featureIdx} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{feature.name}</span>
                <span className="font-medium">{renderValue(feature[planKey])}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 px-4 sm:px-6">
      {/* Header */}
      <div className="space-y-1 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing & Pricing</h2>
        <p className="text-muted-foreground text-sm sm:text-lg">
          Choose the plan that works best for you and upgrade your content creation experience.
        </p>
      </div>
      
      <PaymentPlans onSuccess={handlePaymentSuccess} />

      {/* Comparison Table */}
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold">Detailed Plan Comparison</h3>
          <p className="text-muted-foreground text-sm sm:text-base">
            Compare all features across our plans to find the perfect fit
          </p>
        </div>

        {/* Desktop Table - Hidden on mobile */}
        <Card className="overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold min-w-[200px]">Features</th>
                  <th className="text-center p-4 font-semibold min-w-[120px]">Basic</th>
                  <th className="text-center p-4 font-semibold min-w-[120px]">
                    <div className="flex items-center justify-center gap-2">
                      Pro
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Popular</span>
                    </div>
                  </th>
                  <th className="text-center p-4 font-semibold min-w-[120px]">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((section, sectionIdx) => (
                  <React.Fragment key={`section-${sectionIdx}`}>
                    <tr className="bg-muted/30">
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
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Mobile Cards - Shown only on mobile */}
        <div className="md:hidden space-y-4">
          <MobileComparisonCard planName="Basic" planKey="basic" />
          <MobileComparisonCard planName="Pro" planKey="pro" />
          <MobileComparisonCard planName="Enterprise" planKey="enterprise" />
        </div>

        {/* Additional Info */}
        <Card className="p-4 sm:p-6 bg-muted/30">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
            <div>
              <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">30-Day Money Back</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Not satisfied? Get a full refund within 30 days, no questions asked.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Cancel Anytime</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                No long-term contracts. Cancel your subscription at any time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Need Help Choosing?</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                <a href="/contact" className="text-primary hover:underline">Contact us</a> and we'll help you find the right plan.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
