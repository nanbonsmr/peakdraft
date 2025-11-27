import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          <p className="text-muted-foreground">
            We collect information you provide directly to us, including your name, email address, and payment information when you create an account or make a purchase.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
          <p className="text-muted-foreground">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze trends and usage</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">3. Information Sharing</h2>
          <p className="text-muted-foreground">
            We do not share your personal information with third parties except as described in this policy. We may share information with service providers who perform services on our behalf, such as payment processing.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">4. Data Security</h2>
          <p className="text-muted-foreground">
            We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access. All payment information is processed securely through our payment provider.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">5. Your Rights</h2>
          <p className="text-muted-foreground">
            You have the right to access, update, or delete your personal information at any time. You can do this through your account settings or by contacting us directly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">6. Cookies</h2>
          <p className="text-muted-foreground">
            We use cookies and similar tracking technologies to track activity on our service and hold certain information to improve and analyze our service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">7. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">8. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about this privacy policy, please contact us through the contact information provided on our website.
          </p>
        </section>
      </Card>
    </div>
  );
}
