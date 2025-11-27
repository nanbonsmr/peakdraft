import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Terms and Conditions</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">2. Use License</h2>
          <p className="text-muted-foreground">
            Permission is granted to temporarily access the service for personal, non-commercial use. This is the grant of a license, not a transfer of title.
          </p>
          <p className="text-muted-foreground mt-2">This license shall automatically terminate if you:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Violate any of these restrictions</li>
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to the service</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">3. Subscription and Payment</h2>
          <p className="text-muted-foreground">
            Some parts of the service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis (monthly or annually).
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-2">
            <li>Subscriptions automatically renew unless canceled before the renewal date</li>
            <li>Refunds are handled on a case-by-case basis</li>
            <li>We reserve the right to modify subscription fees with reasonable notice</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">4. User Accounts</h2>
          <p className="text-muted-foreground">
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">5. Content Ownership</h2>
          <p className="text-muted-foreground">
            You retain all rights to the content you create using our service. We do not claim ownership of your content. However, you grant us a license to use, store, and process your content to provide the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">6. Prohibited Uses</h2>
          <p className="text-muted-foreground">You may not use the service:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>For any unlawful purpose or in violation of any laws</li>
            <li>To transmit harmful or malicious code</li>
            <li>To harass, abuse, or harm another person</li>
            <li>To impersonate another person or entity</li>
            <li>To violate intellectual property rights</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">7. Disclaimer</h2>
          <p className="text-muted-foreground">
            The service is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, secure, or error-free.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">8. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">9. Termination</h2>
          <p className="text-muted-foreground">
            We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these terms or is harmful to other users.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">10. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify these terms at any time. We will notify users of any material changes. Your continued use of the service after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">11. Contact Information</h2>
          <p className="text-muted-foreground">
            If you have any questions about these terms, please contact us through the contact information provided on our website.
          </p>
        </section>
      </Card>
    </div>
  );
}
