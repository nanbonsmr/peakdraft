import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Send, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { PublicNavbar } from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(100, { message: "Name must be less than 100 characters" }),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  subject: z.string().trim().min(1, { message: "Subject is required" }).max(200, { message: "Subject must be less than 200 characters" }),
  message: z.string().trim().min(10, { message: "Message must be at least 10 characters" }).max(2000, { message: "Message must be less than 2000 characters" })
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message
        }
      });

      if (error) throw error;

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 px-4 overflow-hidden pt-24">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">We're here to help</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Get in <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about PeakDraft? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card
              className="group p-6 text-center hover:shadow-elegant transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 bg-gradient-to-br from-background to-muted/30"
              onClick={() => window.location.href = 'mailto:nanbondev@gmail.com'}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Email Us</h3>
              <p className="text-sm text-muted-foreground">nanbondev@gmail.com</p>
            </Card>

            <Card 
              className="group p-6 text-center hover:shadow-elegant transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 bg-gradient-to-br from-background to-muted/30"
              onClick={() => window.location.href = 'tel:+2576892311'}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Phone className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Call Us</h3>
              <p className="text-sm text-muted-foreground">+2576892311</p>
            </Card>

            <Card className="group p-6 text-center hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-background to-muted/30">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Visit Us</h3>
              <p className="text-sm text-muted-foreground">Addis Ababa, Ethiopia</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12 sm:py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Form */}
            <Card className="lg:col-span-3 p-6 sm:p-8 border-2 shadow-elegant">
              <h2 className="text-2xl font-bold mb-2">Send Us a Message</h2>
              <p className="text-muted-foreground mb-6">Fill out the form below and we'll get back to you shortly.</p>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      {...register('name')}
                      className={`h-12 ${errors.name ? 'border-destructive' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      {...register('email')}
                      className={`h-12 ${errors.email ? 'border-destructive' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="How can we help you?"
                    {...register('subject')}
                    className={`h-12 ${errors.subject ? 'border-destructive' : ''}`}
                  />
                  {errors.subject && (
                    <p className="text-sm text-destructive">{errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    {...register('message')}
                    className={errors.message ? 'border-destructive' : ''}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground">
                  * Required fields. By submitting this form, you agree to our{' '}
                  <Link to="/privacy" className="underline hover:text-primary transition-colors">Privacy Policy</Link>.
                </p>
              </form>
            </Card>

            {/* FAQ Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 border-2 bg-gradient-to-br from-primary/5 to-background">
                <h3 className="text-xl font-bold mb-4">Quick Answers</h3>
                <div className="space-y-5">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">How quickly will I receive a response?</h4>
                    <p className="text-sm text-muted-foreground">
                      We typically respond within 24 hours during business days.
                    </p>
                  </div>
                  <div className="border-t border-border/50 pt-4">
                    <h4 className="font-semibold text-sm mb-1">Do you offer phone support?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes, phone support is available for Pro and Enterprise subscribers.
                    </p>
                  </div>
                  <div className="border-t border-border/50 pt-4">
                    <h4 className="font-semibold text-sm mb-1">Can I schedule a demo?</h4>
                    <p className="text-sm text-muted-foreground">
                      Absolutely! Mention "demo request" in your message and we'll arrange a time.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-2 bg-gradient-to-br from-accent/10 to-background">
                <h3 className="text-lg font-bold mb-3">Need immediate help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Check out our comprehensive FAQ section for instant answers to common questions.
                </p>
                <Button variant="outline" onClick={() => navigate('/faq')} className="w-full">
                  View FAQ
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
