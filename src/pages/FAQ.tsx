import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Home, Sparkles, DollarSign, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FAQ() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">Find answers to common questions about PeakDraft</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
      </div>

      {/* Features Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Features & Functionality</h2>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What types of content can PeakDraft generate?</AccordionTrigger>
            <AccordionContent>
              PeakDraft can generate a wide variety of content including blog posts, social media posts, 
              ad copy, email campaigns, product descriptions, video scripts, letters, and much more. We offer 
              over 20+ specialized templates to help you create professional content for any purpose.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>How accurate is the AI-generated content?</AccordionTrigger>
            <AccordionContent>
              Our AI uses advanced language models to produce high-quality, contextually relevant content. 
              While the content is generally accurate and well-written, we always recommend reviewing and 
              editing the output to ensure it meets your specific needs and brand voice. The AI serves as 
              a powerful starting point that significantly reduces your writing time.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Can I edit the generated content?</AccordionTrigger>
            <AccordionContent>
              Absolutely! All generated content is fully editable. You can make changes, add your personal 
              touch, and refine the output to perfectly match your requirements. We encourage users to treat 
              the AI output as a draft that you can polish and customize.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>What languages does PeakDraft support?</AccordionTrigger>
            <AccordionContent>
              PeakDraft currently supports multiple languages including English, Spanish, French, German, 
              Italian, Portuguese, and many more. You can select your preferred language when generating 
              content. We're constantly expanding our language support based on user demand.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Can I use the generated content for commercial purposes?</AccordionTrigger>
            <AccordionContent>
              Yes! All content generated with PeakDraft is yours to use however you like, including for 
              commercial purposes. You have full ownership and rights to the content you create with our platform.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>Is there a limit to how much I can generate?</AccordionTrigger>
            <AccordionContent>
              Your generation limit depends on your subscription plan. The Basic plan includes 10,000 words 
              per month, Pro includes 50,000 words, and Enterprise includes 200,000 words. If you need more, 
              you can upgrade your plan at any time.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Pricing Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Pricing & Billing</h2>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="price-1">
            <AccordionTrigger>Do you offer a free trial?</AccordionTrigger>
            <AccordionContent>
              Yes! All paid plans come with a 7-day free trial. You can explore all features and generate 
              content without entering payment information. No credit card required to start your trial.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price-2">
            <AccordionTrigger>Can I change my plan later?</AccordionTrigger>
            <AccordionContent>
              Absolutely! You can upgrade or downgrade your plan at any time from your account settings. 
              When upgrading, you'll get immediate access to new features. When downgrading, changes take 
              effect at the start of your next billing cycle.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price-3">
            <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
            <AccordionContent>
              We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal. 
              All payments are processed securely through FastSpring, our trusted payment provider.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price-4">
            <AccordionTrigger>Can I cancel my subscription anytime?</AccordionTrigger>
            <AccordionContent>
              Yes, you can cancel your subscription at any time with no cancellation fees. If you cancel, 
              you'll continue to have access until the end of your current billing period. We also offer 
              a 30-day money-back guarantee if you're not satisfied.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price-5">
            <AccordionTrigger>Do unused words roll over to the next month?</AccordionTrigger>
            <AccordionContent>
              No, unused words do not roll over to the next month. Your word count resets at the start of 
              each billing cycle. However, we recommend choosing a plan that fits your average monthly usage 
              to get the best value.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price-6">
            <AccordionTrigger>Do you offer discounts for annual subscriptions?</AccordionTrigger>
            <AccordionContent>
              Yes! We offer significant discounts for annual subscriptions. Contact our sales team for 
              information about annual pricing and custom enterprise solutions.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price-7">
            <AccordionTrigger>What is your refund policy?</AccordionTrigger>
            <AccordionContent>
              We offer a 30-day money-back guarantee on all plans. If you're not satisfied with PeakDraft 
              within the first 30 days, contact our support team for a full refund. No questions asked.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Technical Support Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Headphones className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Technical Support</h2>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="support-1">
            <AccordionTrigger>How can I contact support?</AccordionTrigger>
            <AccordionContent>
              You can reach our support team through multiple channels: email us at support@peakdraft.com, 
              use our contact form, or for Pro and Enterprise customers, access our priority support channels. 
              We typically respond within 24 hours on business days.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="support-2">
            <AccordionTrigger>What are your support hours?</AccordionTrigger>
            <AccordionContent>
              Our standard support hours are Monday-Friday, 9 AM to 6 PM EST. Pro plan users receive extended 
              support hours, and Enterprise customers have access to 24/7 dedicated support with guaranteed 
              response times.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="support-3">
            <AccordionTrigger>Do you offer phone support?</AccordionTrigger>
            <AccordionContent>
              Phone support is available for Pro and Enterprise plan subscribers. Basic plan users can access 
              support via email and our contact form. Pro customers receive priority phone support during 
              business hours, while Enterprise customers have 24/7 phone access.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="support-4">
            <AccordionTrigger>Is there a knowledge base or documentation?</AccordionTrigger>
            <AccordionContent>
              Yes! We maintain comprehensive documentation, video tutorials, and guides to help you get the 
              most out of PeakDraft. You can access these resources from your dashboard or our help center.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="support-5">
            <AccordionTrigger>Can you help with custom integrations?</AccordionTrigger>
            <AccordionContent>
              Custom integrations are available for Enterprise plan customers. Our technical team can work 
              with you to integrate PeakDraft with your existing tools and workflows. Contact our sales 
              team to discuss your specific integration needs.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="support-6">
            <AccordionTrigger>What if I encounter a bug or issue?</AccordionTrigger>
            <AccordionContent>
              If you encounter any bugs or technical issues, please report them immediately through our support 
              channels. Include details about what happened, any error messages, and steps to reproduce the issue. 
              Our team prioritizes bug fixes and will work quickly to resolve any problems.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="support-7">
            <AccordionTrigger>Do you provide training or onboarding?</AccordionTrigger>
            <AccordionContent>
              Yes! All new users receive access to our onboarding materials and video tutorials. Pro customers 
              can schedule one-on-one onboarding sessions, and Enterprise customers receive dedicated training 
              and ongoing support from a customer success manager.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Still Have Questions */}
      <Card className="p-8 text-center bg-gradient-to-br from-primary/10 via-primary-glow/5 to-accent/10">
        <h3 className="text-2xl font-bold mb-2">Still Have Questions?</h3>
        <p className="text-muted-foreground mb-6">
          Can't find the answer you're looking for? Our support team is here to help.
        </p>
        <Button onClick={() => navigate('/contact')}>
          Contact Support
        </Button>
      </Card>
    </div>
  );
}
