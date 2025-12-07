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
            QuickWrite AI uses Paddle.com as our Merchant of Record for all subscription transactions. This means that when you purchase a subscription, you are purchasing from Paddle, who is the authorized reseller of our services. This Refund Policy is based on Paddle's Consumer Terms and Conditions and outlines the terms under which refunds may be granted.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            By subscribing to our services, you acknowledge that you have read, understood, and agree to be bound by this Refund Policy along with Paddle's terms of service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Consumer Right to Cancel</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you are a Consumer (purchasing for personal use), you have the right to cancel your subscription within 14 days from the day after completion of the transaction, without giving any reason. To meet the cancellation deadline, it is sufficient that you send your cancellation request before the expiration of the 14-day period.
          </p>
          
          <h3 className="text-lg font-medium mt-4">1.1 How to Cancel</h3>
          <p className="text-muted-foreground leading-relaxed">
            To cancel your order, you must inform us of your decision. You can do this by:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Contacting our support team through our Contact page</li>
            <li>Emailing us at support@quickwriteai.com</li>
            <li>Making any clear, unambiguous statement of your intention to cancel</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            <strong>Important:</strong> For subscription services, your right to cancel applies only following the initial subscription and not upon each automatic renewal.
          </p>

          <h3 className="text-lg font-medium mt-4">1.2 Effect of Cancellation</h3>
          <p className="text-muted-foreground leading-relaxed">
            If you cancel within the permitted period:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>We will reimburse all payments received from you</li>
            <li>Reimbursement will be made without undue delay, and not later than 14 days after we are informed of your decision to cancel</li>
            <li>We will use the same payment method you used for the initial transaction</li>
            <li>You will not incur any fees as a result of the reimbursement</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">1.3 Exception to the Right to Cancel</h3>
          <p className="text-muted-foreground leading-relaxed">
            Your right to cancel does not apply to the supply of Digital Content that you have started to download, stream, or otherwise acquire, and to Products which you have had the benefit of. By using QuickWrite AI's content generation features, you acknowledge that you have begun receiving the digital service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Refund Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            Refunds are provided at the sole discretion of Paddle (our payment processor) and are evaluated on a case-by-case basis. Refund requests may be refused in certain circumstances.
          </p>
          
          <h3 className="text-lg font-medium mt-4">2.1 Grounds for Refund Refusal</h3>
          <p className="text-muted-foreground leading-relaxed">
            A refund request may be refused if there is evidence of:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Fraud or fraudulent activity</li>
            <li>Refund abuse</li>
            <li>Other manipulative behaviour</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">2.2 Your Consumer Rights</h3>
          <p className="text-muted-foreground leading-relaxed">
            This refund policy does not affect your statutory rights as a Consumer in relation to products which are not as described, faulty, or not fit for purpose.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Subscriptions</h2>
          <p className="text-muted-foreground leading-relaxed">
            QuickWrite AI offers subscription-based access to our AI content generation platform. Here's what you need to know about subscription management:
          </p>
          
          <h3 className="text-lg font-medium mt-4">3.1 Automatic Renewal</h3>
          <p className="text-muted-foreground leading-relaxed">
            Paid subscriptions automatically renew until cancelled. You will be notified if the price of your subscription increases, and your consent will be sought to continue where required.
          </p>

          <h3 className="text-lg font-medium mt-4">3.2 Cancelling Your Subscription</h3>
          <p className="text-muted-foreground leading-relaxed">
            To cancel your subscription:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Contact us at least 48 hours before the end of the current billing period</li>
            <li>Provide your order number and the email address used to purchase</li>
            <li>Your cancellation will take effect at the next payment date</li>
            <li><strong>There are no refunds on unused subscription periods</strong></li>
          </ul>

          <h3 className="text-lg font-medium mt-4">3.3 Free Trials</h3>
          <p className="text-muted-foreground leading-relaxed">
            If you signed up for a free trial, you must cancel before the trial period expires to avoid being charged. If you decide to unsubscribe before charging begins, cancel before the trial expiration date.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            If we cannot charge your payment method for any reason (such as expiration or insufficient funds) and you have not cancelled, you remain responsible for any uncollected amounts.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Pre-Orders</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you pre-order any product or service, you will be charged upfront. You can request a refund for any reason until the content is delivered, after which the standard refund policy applies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Technical Issues</h2>
          <p className="text-muted-foreground leading-relaxed">
            If technical problems prevent or unreasonably delay delivery of the service, your exclusive and sole remedy is either replacement of the service or refund of the price paid, as determined by Paddle.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Sales Tax Refunds</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have been charged sales tax (including VAT, GST, or other applicable taxes) on your purchase and are registered for sales tax in the country of purchase, you may be entitled to a refund of the sales tax amount if permitted by applicable laws.
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>You must contact us within 60 days after completing the purchase to be eligible</li>
            <li>A valid sales tax code for your country must be provided</li>
            <li>Requests received after 60 days from the transaction date will not be processed</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Wire Transfer Payments</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you paid via wire transfer:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>It is your responsibility to provide correct payment details and order information</li>
            <li>Wire transfer payments are not protected under the Consumer Credit Act</li>
            <li>These payments are generally not eligible for refunds</li>
            <li>For transactions above $100/£100/€100 (including sales tax), you may be entitled to a refund at Paddle's discretion</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">8. Chargebacks</h2>
          <p className="text-muted-foreground leading-relaxed">
            We strongly encourage you to contact us directly before initiating a chargeback with your bank or credit card company. Most issues can be resolved quickly and amicably through our support team.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            If fraudulent activities are suspected, your usage of our services may be cancelled and blocked without notice. Details may be passed on to relevant authorities for law enforcement and financial crime prevention purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">9. Refund Timeline</h2>
          <p className="text-muted-foreground leading-relaxed">
            Once a refund is approved:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Reimbursement will be made within 14 days of the cancellation decision</li>
            <li>The same payment method used for the original transaction will be used</li>
            <li>Actual processing time may vary depending on your financial institution</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">10. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting to our website. If you accept such modifications, they will be incorporated into this agreement and apply to the purchase of any further services. The refund policy in effect at the time of your purchase will apply to that transaction.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">11. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong>For Consumers in the United States:</strong> This policy and all transactions shall be governed by the laws of the State of New York, including its Uniform Commercial Code.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>For all other Consumers:</strong> This policy and all transactions shall be governed by the laws of England, except to the extent amended by mandatory provisions of the law of your country of residence.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">12. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this Refund Policy or need to request a refund, please contact us:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li><strong>Email:</strong> support@quickwriteai.com</li>
            <li><strong>Contact Page:</strong> Visit our Contact page on the website</li>
            <li><strong>Response Time:</strong> We aim to respond to all inquiries within 24-48 hours</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            When contacting us, please include your order number, account email, and a detailed explanation of your request.
          </p>
        </section>

        <section className="space-y-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            QuickWrite AI uses Paddle.com as the Merchant of Record for all transactions. For Paddle's complete terms and conditions, please visit{' '}
            <a 
              href="https://www.paddle.com/legal/invoiced-consumer-terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Paddle's Consumer Terms
            </a>.
          </p>
        </section>
      </Card>
    </div>
  );
}
