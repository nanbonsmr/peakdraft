import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <RotateCcw className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Refund Policy</h1>
          </div>
          <p className="text-muted-foreground">Last updated: December 7, 2024</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
      </div>

      <Card className="p-6 space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            peakdraftapp uses Dodo Payments as our Merchant of Record for all subscription transactions. This means that when you purchase a subscription, you are purchasing from Dodo Payments, who is the authorized reseller of our services. This Refund Policy follows Dodo Payments' Consumer Terms and Conditions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Nature of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            peakdraftapp is a fully automated AI-powered content generation platform. Our service is entirely digital and software-based. <strong>No human-driven services are involved in our offering.</strong> All content generation is performed by artificial intelligence without human intervention.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Right to Cancel (14-Day Cancellation Period)</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you are a Consumer (purchasing for personal use), you have the right to cancel your subscription within <strong>14 days</strong> from the day after completion of the transaction, without giving any reason.
          </p>
          
          <h3 className="text-lg font-medium mt-4">2.1 How to Cancel</h3>
          <p className="text-muted-foreground leading-relaxed">
            To cancel your order, contact us at nanbonkayu@gmail.com or through our Contact page. To meet the cancellation deadline, it is sufficient that you send your cancellation request before the expiration of the 14-day period.
          </p>

          <h3 className="text-lg font-medium mt-4">2.2 Effect of Cancellation</h3>
          <p className="text-muted-foreground leading-relaxed">
            If you cancel within the 14-day period:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>We will reimburse all payments received from you</li>
            <li>Reimbursement will be made without undue delay, and not later than 14 days after we are informed of your decision to cancel</li>
            <li>We will use the same payment method you used for the initial transaction</li>
            <li>You will not incur any fees as a result of the reimbursement</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Refunds</h2>
          <p className="text-muted-foreground leading-relaxed">
            Refunds are processed through Dodo Payments, our Merchant of Record. If you wish to request a refund, please contact us and we will process your request in accordance with Dodo Payments' refund policy.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            This policy does not affect your statutory rights as a Consumer in relation to products which are not as described, faulty, or not fit for purpose.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Subscriptions</h2>
          <p className="text-muted-foreground leading-relaxed">
            Paid subscriptions automatically renew until cancelled. You will be notified if the price of your subscription increases.
          </p>
          
          <h3 className="text-lg font-medium mt-4">4.1 Cancelling Your Subscription</h3>
          <p className="text-muted-foreground leading-relaxed">
            To cancel your subscription, contact us at least 48 hours before the end of the current billing period. Provide your order number and the email address used to purchase. Your cancellation will take effect at the next payment date.
          </p>

          <h3 className="text-lg font-medium mt-4">4.2 Free Trials</h3>
          <p className="text-muted-foreground leading-relaxed">
            If you signed up for a free trial, you must cancel before the trial period expires to avoid being charged.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Technical Issues</h2>
          <p className="text-muted-foreground leading-relaxed">
            If technical problems prevent or unreasonably delay delivery of the service, your remedy is either replacement of the service or refund of the price paid.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Refund Timeline</h2>
          <p className="text-muted-foreground leading-relaxed">
            Once a refund is approved, reimbursement will be made within 14 days using the same payment method used for the original transaction. Actual processing time may vary depending on your financial institution.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this Refund Policy or need to request a refund, please contact us:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li><strong>Email:</strong> nanbonkayu@gmail.com</li>
            <li><strong>Contact Page:</strong> Visit our Contact page on the website</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            When contacting us, please include your order number and account email.
          </p>
        </section>

        <section className="space-y-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            peakdraftapp uses Dodo Payments as the Merchant of Record for all transactions. For Dodo Payments' complete terms and conditions, please visit{' '}
            <a 
              href="https://www.dodopayments.com/legal/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Dodo Payments' Consumer Terms
            </a>.
          </p>
        </section>
      </Card>
    </div>
  );
}
