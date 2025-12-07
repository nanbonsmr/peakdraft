import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Terms and Conditions</h1>
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
            Welcome to quickwriteapp. These Terms and Conditions ("Terms," "Agreement") constitute a legally binding agreement between you ("User," "you," or "your") and quickwriteapp ("Company," "we," "our," or "us") governing your access to and use of our AI-powered content generation platform, task management tools, and related services (collectively, the "Service").
          </p>
          <p className="text-muted-foreground leading-relaxed">
            By creating an account, accessing, or using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use the Service. We reserve the right to modify these Terms at any time, and your continued use of the Service following any changes constitutes acceptance of those changes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing and using the quickwriteapp Service, you represent and warrant that:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>You are at least 18 years of age or the age of legal majority in your jurisdiction</li>
            <li>You have the legal capacity and authority to enter into this Agreement</li>
            <li>If you are using the Service on behalf of an organization, you have the authority to bind that organization to these Terms</li>
            <li>Your use of the Service does not violate any applicable laws, regulations, or third-party rights</li>
            <li>All information you provide to us is accurate, current, and complete</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            If you do not meet these requirements or do not agree to these Terms, you are not authorized to use the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            quickwriteapp provides a fully automated AI-powered content generation platform that enables users to create various types of written content. <strong>No human-driven services are involved in our offering.</strong> All content generation is performed entirely by artificial intelligence without human intervention.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Our services include, but are not limited to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Blog posts and articles</li>
            <li>Social media content and captions</li>
            <li>Email marketing copy and newsletters</li>
            <li>Advertising copy for various platforms</li>
            <li>Product descriptions for e-commerce</li>
            <li>Professional documents (CVs, letters, scripts)</li>
            <li>AI prompt generation for image and video tools</li>
            <li>Task management and productivity tools</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            The Service utilizes artificial intelligence and machine learning technologies to generate content based on user inputs. While we strive to provide high-quality outputs, the Service is provided as a tool to assist in content creation and should not be considered a replacement for human judgment, editing, and review.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. User Accounts</h2>
          
          <h3 className="text-lg font-medium mt-4">3.1 Account Registration</h3>
          <p className="text-muted-foreground leading-relaxed">
            To access certain features of the Service, you must create an account. When creating an account, you agree to provide accurate, current, and complete information and to update such information to keep it accurate, current, and complete. You may not use false or misleading information or impersonate any person or entity.
          </p>

          <h3 className="text-lg font-medium mt-4">3.2 Account Security</h3>
          <p className="text-muted-foreground leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials, including your password. You agree to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Use a strong, unique password for your account</li>
            <li>Not share your account credentials with any third party</li>
            <li>Immediately notify us of any unauthorized access or security breach</li>
            <li>Accept responsibility for all activities that occur under your account</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            We reserve the right to disable any account at any time if we reasonably believe you have violated these Terms or if your account appears to have been compromised.
          </p>

          <h3 className="text-lg font-medium mt-4">3.3 Account Types</h3>
          <p className="text-muted-foreground leading-relaxed">
            We offer various account types and subscription plans with different features, usage limits, and pricing. The specific features and limitations of each account type are described on our pricing page and may be updated from time to time.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Subscription and Payment</h2>
          
          <h3 className="text-lg font-medium mt-4">4.1 Merchant of Record</h3>
          <p className="text-muted-foreground leading-relaxed">
            quickwriteapp uses Paddle.com as our Merchant of Record for all subscription transactions. When you purchase a subscription, you are purchasing from Paddle, who is the authorized reseller of our services.
          </p>

          <h3 className="text-lg font-medium mt-4">4.2 Subscription Plans</h3>
          <p className="text-muted-foreground leading-relaxed">
            Access to certain features of the Service requires a paid subscription. Subscription plans are offered on a monthly or annual basis, with pricing and features as described on our website. By subscribing to a paid plan, you agree to pay the applicable subscription fees.
          </p>

          <h3 className="text-lg font-medium mt-4">4.3 Billing and Payment</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Subscriptions are billed in advance on a recurring basis (monthly or annually)</li>
            <li>Payment is due at the time of subscription and at each renewal date</li>
            <li>All fees are quoted and payable in US dollars unless otherwise specified</li>
            <li>You authorize Paddle to charge your designated payment method for all applicable fees</li>
            <li>If your payment method fails, we may suspend or terminate your access to the Service</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">4.4 Automatic Renewal</h3>
          <p className="text-muted-foreground leading-relaxed">
            Subscriptions automatically renew at the end of each billing period unless you cancel before the renewal date. You will be charged the then-current subscription fee unless you cancel prior to the renewal date. You can cancel your subscription at any time through your account settings or by contacting us.
          </p>

          <h3 className="text-lg font-medium mt-4">4.5 Price Changes</h3>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify subscription fees at any time. Any price changes will be communicated to you in advance and will take effect at your next billing cycle. Your continued use of the Service after a price change constitutes acceptance of the new pricing.
          </p>

          <h3 className="text-lg font-medium mt-4">4.6 Refunds</h3>
          <p className="text-muted-foreground leading-relaxed">
            Refunds are processed in accordance with our Refund Policy and Paddle's Consumer Terms. You have a 14-day right to cancel from the date of purchase. Please see our Refund Policy page for complete details.
          </p>

          <h3 className="text-lg font-medium mt-4">4.7 Free Trials</h3>
          <p className="text-muted-foreground leading-relaxed">
            We may offer free trials of paid subscription plans. At the end of the trial period, you will be automatically charged for the subscription unless you cancel before the trial ends. Free trials are limited to one per user, and we reserve the right to revoke trial access if we detect abuse.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Use License and Restrictions</h2>
          
          <h3 className="text-lg font-medium mt-4">5.1 License Grant</h3>
          <p className="text-muted-foreground leading-relaxed">
            Subject to your compliance with these Terms and payment of applicable fees, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal or internal business purposes.
          </p>

          <h3 className="text-lg font-medium mt-4">5.2 License Restrictions</h3>
          <p className="text-muted-foreground leading-relaxed">
            You agree not to, and will not permit any third party to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Copy, modify, or create derivative works based on the Service</li>
            <li>Reverse engineer, disassemble, or decompile any part of the Service</li>
            <li>Rent, lease, loan, sell, resell, sublicense, or otherwise distribute the Service</li>
            <li>Use the Service to build a competitive product or service</li>
            <li>Use automated systems, bots, or scripts to access or interact with the Service beyond intended use</li>
            <li>Circumvent, disable, or interfere with security features of the Service</li>
            <li>Access the Service through any means other than the interfaces we provide</li>
            <li>Use the Service to train AI or machine learning models without explicit written permission</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Content Ownership and Rights</h2>
          
          <h3 className="text-lg font-medium mt-4">6.1 Your Content</h3>
          <p className="text-muted-foreground leading-relaxed">
            You retain ownership of any content you input into the Service (your prompts, topics, and other inputs) and any content generated by the Service based on your inputs ("User Content"). You are solely responsible for your User Content and the consequences of posting or publishing it.
          </p>

          <h3 className="text-lg font-medium mt-4">6.2 License to Us</h3>
          <p className="text-muted-foreground leading-relaxed">
            By using the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, store, and process your User Content solely for the purpose of providing and improving the Service. This license includes the right to use aggregated, anonymized data derived from your use of the Service for analytics and service improvement purposes.
          </p>

          <h3 className="text-lg font-medium mt-4">6.3 AI-Generated Content</h3>
          <p className="text-muted-foreground leading-relaxed">
            Content generated by our AI is created based on your inputs and the AI's training. While you own the rights to use the generated content, you acknowledge that:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Similar or identical content may be generated for other users with similar inputs</li>
            <li>The AI may produce content that exists elsewhere or resembles existing works</li>
            <li>You are responsible for reviewing and editing generated content before use</li>
            <li>We make no warranties regarding the originality, accuracy, or suitability of generated content</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">6.4 Our Intellectual Property</h3>
          <p className="text-muted-foreground leading-relaxed">
            The Service, including its original content, features, functionality, software, and technology, is owned by quickwriteapp and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. Our trademarks, logos, and service marks may not be used without our prior written consent.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Prohibited Uses</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree not to use the Service for any purpose that is unlawful or prohibited by these Terms. Prohibited uses include, but are not limited to:
          </p>
          
          <h3 className="text-lg font-medium mt-4">7.1 Illegal Activities</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Violating any applicable local, state, national, or international law or regulation</li>
            <li>Engaging in fraud, money laundering, or other financial crimes</li>
            <li>Infringing on intellectual property rights of others</li>
            <li>Distributing malware, viruses, or other harmful code</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">7.2 Harmful Content</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Generating content that promotes violence, hatred, or discrimination</li>
            <li>Creating defamatory, libelous, or harassing content</li>
            <li>Producing sexually explicit or pornographic material</li>
            <li>Generating content that exploits or endangers minors</li>
            <li>Creating fake news, misinformation, or deceptive content</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">7.3 Spam and Abuse</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Sending unsolicited bulk communications or spam</li>
            <li>Creating multiple accounts to circumvent usage limits or bans</li>
            <li>Attempting to gain unauthorized access to the Service or other accounts</li>
            <li>Interfering with or disrupting the Service or servers</li>
            <li>Scraping, data mining, or automated collection of content without permission</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">7.4 Impersonation</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Impersonating any person or entity</li>
            <li>Falsely claiming affiliation with any organization</li>
            <li>Using the Service to generate fraudulent credentials or documents</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">8. Service Availability and Modifications</h2>
          
          <h3 className="text-lg font-medium mt-4">8.1 Service Availability</h3>
          <p className="text-muted-foreground leading-relaxed">
            We strive to maintain high availability of the Service, but we do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, technical issues, or circumstances beyond our control. We will make reasonable efforts to notify users of planned maintenance in advance.
          </p>

          <h3 className="text-lg font-medium mt-4">8.2 Service Modifications</h3>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify, update, or discontinue any aspect of the Service at any time without prior notice. This includes changes to features, functionality, pricing, and availability. We are not liable to you or any third party for any modification, suspension, or discontinuation of the Service.
          </p>

          <h3 className="text-lg font-medium mt-4">8.3 Usage Limits</h3>
          <p className="text-muted-foreground leading-relaxed">
            Different subscription plans have different usage limits (e.g., word counts, template access). If you exceed your plan's limits, you may need to upgrade to a higher plan or wait until your limits reset. We reserve the right to throttle or suspend accounts that exhibit unusual or excessive usage patterns.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">9. Disclaimer of Warranties</h2>
          <p className="text-muted-foreground leading-relaxed">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Without limiting the foregoing, we do not warrant that:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>The Service will meet your specific requirements or expectations</li>
            <li>The Service will be uninterrupted, timely, secure, or error-free</li>
            <li>The results or content generated by the Service will be accurate, reliable, or complete</li>
            <li>Any errors in the Service will be corrected</li>
            <li>The generated content will be free of plagiarism or intellectual property issues</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            You acknowledge that AI-generated content may require review, editing, and fact-checking before use. You are solely responsible for evaluating and using any content generated by the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">10. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL QUICKWRITEAPP, ITS AFFILIATES, DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO YOUR USE OF OR INABILITY TO USE THE SERVICE.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS EXCEED THE AMOUNT YOU PAID TO US FOR THE SERVICE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED US DOLLARS ($100), WHICHEVER IS GREATER.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            These limitations apply even if we have been advised of the possibility of such damages. Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">11. Indemnification</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree to indemnify, defend, and hold harmless quickwriteapp and its affiliates, officers, directors, employees, agents, and licensors from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Your use of the Service</li>
            <li>Your User Content or any content you generate using the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any applicable laws or regulations</li>
            <li>Your violation of any third-party rights, including intellectual property rights</li>
            <li>Any dispute between you and a third party regarding your use of the Service</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">12. Termination</h2>
          
          <h3 className="text-lg font-medium mt-4">12.1 Termination by You</h3>
          <p className="text-muted-foreground leading-relaxed">
            You may terminate your account at any time by canceling your subscription and deleting your account through your account settings. Termination will take effect at the end of your current billing period, and you will retain access to the Service until that time.
          </p>

          <h3 className="text-lg font-medium mt-4">12.2 Termination by Us</h3>
          <p className="text-muted-foreground leading-relaxed">
            We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including but not limited to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Violation of these Terms</li>
            <li>Engaging in prohibited uses of the Service</li>
            <li>Non-payment of subscription fees</li>
            <li>Fraudulent or illegal activity</li>
            <li>Conduct that is harmful to other users or the Service</li>
            <li>At our sole discretion for any other reason</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">12.3 Effect of Termination</h3>
          <p className="text-muted-foreground leading-relaxed">
            Upon termination, your right to use the Service will immediately cease. You may lose access to your account, User Content, and generated content history. We are not obligated to retain or provide copies of your data after termination, although we may retain certain information as required by law or for legitimate business purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">13. Governing Law and Dispute Resolution</h2>
          
          <h3 className="text-lg font-medium mt-4">13.1 Governing Law</h3>
          <p className="text-muted-foreground leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
          </p>

          <h3 className="text-lg font-medium mt-4">13.2 Dispute Resolution</h3>
          <p className="text-muted-foreground leading-relaxed">
            Any dispute arising out of or relating to these Terms or the Service shall first be attempted to be resolved through good-faith negotiation between the parties. If the dispute cannot be resolved through negotiation within 30 days, either party may pursue resolution through binding arbitration in accordance with the rules of the American Arbitration Association.
          </p>

          <h3 className="text-lg font-medium mt-4">13.3 Class Action Waiver</h3>
          <p className="text-muted-foreground leading-relaxed">
            You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action. You waive any right to participate in class action lawsuits or class-wide arbitration against quickwriteapp.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">14. General Provisions</h2>
          
          <h3 className="text-lg font-medium mt-4">14.1 Entire Agreement</h3>
          <p className="text-muted-foreground leading-relaxed">
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and quickwriteapp regarding the Service and supersede all prior agreements and understandings.
          </p>

          <h3 className="text-lg font-medium mt-4">14.2 Severability</h3>
          <p className="text-muted-foreground leading-relaxed">
            If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
          </p>

          <h3 className="text-lg font-medium mt-4">14.3 Waiver</h3>
          <p className="text-muted-foreground leading-relaxed">
            Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision. Any waiver must be in writing and signed by us to be effective.
          </p>

          <h3 className="text-lg font-medium mt-4">14.4 Assignment</h3>
          <p className="text-muted-foreground leading-relaxed">
            You may not assign or transfer these Terms or your rights under these Terms without our prior written consent. We may assign our rights and obligations under these Terms without restriction.
          </p>

          <h3 className="text-lg font-medium mt-4">14.5 Notices</h3>
          <p className="text-muted-foreground leading-relaxed">
            We may provide notices to you via email, through the Service, or by other means reasonably calculated to provide you with notice. You may provide notices to us by contacting us through the methods provided below.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">15. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify these Terms at any time. When we make material changes, we will update the "Last updated" date at the top of this page and may provide additional notice through email or the Service. Your continued use of the Service after any changes indicates your acceptance of the modified Terms. If you do not agree to the modified Terms, you should discontinue your use of the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">16. Contact Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions, concerns, or feedback regarding these Terms and Conditions, please contact us at:
          </p>
          <div className="bg-muted/50 p-4 rounded-lg mt-4">
            <p className="font-medium">quickwriteapp Legal Department</p>
            <p className="text-muted-foreground">Email: nanbonkayu@gmail.com</p>
            <p className="text-muted-foreground">Address: Addis Ababa, Ethiopia</p>
            <p className="text-muted-foreground">Phone: +251976892311</p>
          </div>
          <p className="text-muted-foreground leading-relaxed mt-4">
            For general support inquiries, please visit our Contact page or email nanbonkayu@gmail.com.
          </p>
        </section>
      </Card>
    </div>
  );
}
