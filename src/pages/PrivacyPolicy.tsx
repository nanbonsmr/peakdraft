import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground">Last updated: November 27, 2024</p>
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
            Welcome to QuickWrite AI ("Company," "we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered content generation platform and task management services (collectively, the "Service").
          </p>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using our Service, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service. We encourage you to read this Privacy Policy carefully to understand our views and practices regarding your personal data and how we will treat it.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            We collect several types of information from and about users of our Service, including information by which you may be personally identified. The categories of information we collect include:
          </p>
          
          <h3 className="text-lg font-medium mt-4">1.1 Personal Information</h3>
          <p className="text-muted-foreground leading-relaxed">
            When you register for an account, subscribe to our services, or contact us, we may collect the following personal information:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Full name and display name</li>
            <li>Email address</li>
            <li>Billing address and payment information (processed securely through our payment provider)</li>
            <li>Phone number (optional)</li>
            <li>Company or organization name (optional)</li>
            <li>Profile picture or avatar (optional)</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">1.2 Usage Information</h3>
          <p className="text-muted-foreground leading-relaxed">
            We automatically collect certain information when you access or use our Service, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Device information (type, operating system, browser type and version)</li>
            <li>IP address and approximate geographic location</li>
            <li>Pages visited and features used within the Service</li>
            <li>Time and date of your visits</li>
            <li>Referring website or source</li>
            <li>Content generation history and templates used</li>
            <li>Task management data and productivity metrics</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">1.3 Content Data</h3>
          <p className="text-muted-foreground leading-relaxed">
            When you use our AI content generation features, we process and temporarily store the prompts you provide and the content generated. This includes topics, keywords, tone preferences, and any other inputs you provide to customize your content. We retain your generated content history to allow you to access and reuse your previous work.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use the information we collect for various purposes essential to providing and improving our Service. These purposes include:
          </p>
          
          <h3 className="text-lg font-medium mt-4">2.1 Service Delivery</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Creating and managing your user account</li>
            <li>Processing your AI content generation requests</li>
            <li>Providing task management and productivity features</li>
            <li>Storing and displaying your content history</li>
            <li>Processing payments and managing subscriptions</li>
            <li>Sending transactional communications (receipts, confirmations, updates)</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">2.2 Service Improvement</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Analyzing usage patterns to improve our AI models and templates</li>
            <li>Identifying and fixing technical issues and bugs</li>
            <li>Developing new features and services based on user needs</li>
            <li>Conducting research and analytics to enhance user experience</li>
            <li>Personalizing content recommendations and suggestions</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">2.3 Communication</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Responding to your inquiries, comments, and support requests</li>
            <li>Sending important notices about the Service (security alerts, policy changes)</li>
            <li>Providing customer support and technical assistance</li>
            <li>Sending marketing communications (with your consent, where required)</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">2.4 Legal and Security</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Complying with legal obligations and regulatory requirements</li>
            <li>Enforcing our Terms of Service and other agreements</li>
            <li>Protecting against fraud, abuse, and unauthorized access</li>
            <li>Investigating and preventing security incidents</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Information Sharing and Disclosure</h2>
          <p className="text-muted-foreground leading-relaxed">
            We value your privacy and do not sell, rent, or trade your personal information to third parties for their marketing purposes. However, we may share your information in the following limited circumstances:
          </p>
          
          <h3 className="text-lg font-medium mt-4">3.1 Service Providers</h3>
          <p className="text-muted-foreground leading-relaxed">
            We engage trusted third-party companies and individuals to perform services on our behalf, including payment processing, data analytics, email delivery, hosting services, customer support, and marketing assistance. These service providers have access to your personal information only to perform these tasks and are obligated to protect your information.
          </p>

          <h3 className="text-lg font-medium mt-4">3.2 Legal Requirements</h3>
          <p className="text-muted-foreground leading-relaxed">
            We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency). This includes complying with legal processes, enforcing our policies, responding to claims that content violates the rights of third parties, or protecting the rights, property, or safety of QuickWrite AI, our users, or the public.
          </p>

          <h3 className="text-lg font-medium mt-4">3.3 Business Transfers</h3>
          <p className="text-muted-foreground leading-relaxed">
            If QuickWrite AI is involved in a merger, acquisition, asset sale, or bankruptcy, your personal information may be transferred as part of that transaction. We will provide notice before your personal information becomes subject to a different privacy policy.
          </p>

          <h3 className="text-lg font-medium mt-4">3.4 With Your Consent</h3>
          <p className="text-muted-foreground leading-relaxed">
            We may share your information for other purposes with your explicit consent or at your direction.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement robust security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Our security practices include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li><strong>Encryption:</strong> All data transmitted between your device and our servers is encrypted using industry-standard TLS/SSL protocols. Sensitive data at rest is also encrypted.</li>
            <li><strong>Access Controls:</strong> We restrict access to personal information to employees, contractors, and agents who need that information to process it on our behalf.</li>
            <li><strong>Secure Infrastructure:</strong> Our services are hosted on secure cloud infrastructure with regular security audits and penetration testing.</li>
            <li><strong>Payment Security:</strong> All payment information is processed by PCI-DSS compliant payment processors. We do not store complete credit card numbers on our servers.</li>
            <li><strong>Regular Monitoring:</strong> We continuously monitor our systems for potential vulnerabilities and attacks.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            While we strive to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security, but we are committed to implementing and maintaining appropriate technical and organizational measures.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. The criteria used to determine our retention periods include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>The duration of your active account and subscription</li>
            <li>Whether there is a legal obligation to which we are subject (e.g., tax records)</li>
            <li>Whether retention is advisable in light of our legal position (e.g., statutes of limitations)</li>
            <li>Your content history is retained to provide you with access to your generated content</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            When your account is deleted, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal, regulatory, or legitimate business purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Your Rights and Choices</h2>
          <p className="text-muted-foreground leading-relaxed">
            Depending on your location, you may have certain rights regarding your personal information. These rights may include:
          </p>
          
          <h3 className="text-lg font-medium mt-4">6.1 Access and Portability</h3>
          <p className="text-muted-foreground leading-relaxed">
            You have the right to request a copy of the personal information we hold about you. You can access most of your information directly through your account settings. For a complete data export, please contact us.
          </p>

          <h3 className="text-lg font-medium mt-4">6.2 Correction</h3>
          <p className="text-muted-foreground leading-relaxed">
            You have the right to request that we correct inaccurate or incomplete personal information. You can update most of your information through your account settings.
          </p>

          <h3 className="text-lg font-medium mt-4">6.3 Deletion</h3>
          <p className="text-muted-foreground leading-relaxed">
            You have the right to request deletion of your personal information, subject to certain exceptions. You can delete your account through your settings, or contact us to request deletion.
          </p>

          <h3 className="text-lg font-medium mt-4">6.4 Opt-Out</h3>
          <p className="text-muted-foreground leading-relaxed">
            You can opt out of receiving marketing communications from us by clicking the "unsubscribe" link in our emails or by updating your communication preferences in your account settings.
          </p>

          <h3 className="text-lg font-medium mt-4">6.5 GDPR Rights (European Users)</h3>
          <p className="text-muted-foreground leading-relaxed">
            If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR), including the right to restrict processing, object to processing, and lodge a complaint with a supervisory authority.
          </p>

          <h3 className="text-lg font-medium mt-4">6.6 CCPA Rights (California Residents)</h3>
          <p className="text-muted-foreground leading-relaxed">
            If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete your information, and the right to opt out of the sale of your information. We do not sell personal information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Cookies and Tracking Technologies</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use cookies and similar tracking technologies to collect and store information about your interactions with our Service. These technologies help us provide a better user experience, analyze usage patterns, and deliver personalized content.
          </p>
          
          <h3 className="text-lg font-medium mt-4">7.1 Types of Cookies We Use</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li><strong>Essential Cookies:</strong> Required for the Service to function properly (authentication, security, preferences).</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Service to improve functionality.</li>
            <li><strong>Functionality Cookies:</strong> Remember your preferences and settings for a personalized experience.</li>
            <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign effectiveness (with consent).</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">7.2 Managing Cookies</h3>
          <p className="text-muted-foreground leading-relaxed">
            Most web browsers allow you to control cookies through their settings. You can typically set your browser to refuse all or some cookies, or to alert you when cookies are being sent. However, disabling cookies may affect the functionality of our Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">8. International Data Transfers</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your information may be transferred to, stored, and processed in countries other than your country of residence. These countries may have data protection laws that differ from your country. When we transfer your information internationally, we implement appropriate safeguards, such as standard contractual clauses approved by relevant authorities, to ensure your information receives adequate protection.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">9. Children's Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our Service is not intended for children under the age of 16. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. If we discover that we have collected personal information from a child under 16, we will take steps to delete that information promptly.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">10. Third-Party Links and Services</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our Service may contain links to third-party websites, services, or applications that are not operated by us. This Privacy Policy does not apply to third-party services, and we are not responsible for their privacy practices. We encourage you to review the privacy policies of any third-party services you access through our Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">11. Changes to This Privacy Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. When we make material changes, we will notify you by updating the "Last updated" date at the top of this policy and, where appropriate, by sending you a notification via email or through the Service.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information. Your continued use of the Service after any changes to this Privacy Policy constitutes your acceptance of the updated policy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">12. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <div className="bg-muted/50 p-4 rounded-lg mt-4">
            <p className="font-medium">QuickWrite AI</p>
            <p className="text-muted-foreground">Email: privacy@quickwriteai.com</p>
            <p className="text-muted-foreground">Address: 123 AI Street, Tech City, TC 12345</p>
            <p className="text-muted-foreground">Phone: +1 (555) 123-4567</p>
          </div>
          <p className="text-muted-foreground leading-relaxed mt-4">
            We will respond to your inquiry within 30 days. For data protection inquiries from European residents, you may also contact our Data Protection Officer at dpo@quickwriteai.com.
          </p>
        </section>
      </Card>
    </div>
  );
}
