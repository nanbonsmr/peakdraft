import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Send, Loader2, Home, MessageCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
          <p className="text-muted-foreground text-lg">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')} className="ml-4">
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Contact Information Cards */}
        <Card className="p-6 text-center hover:shadow-elegant transition-all">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">Email Us</h3>
          <p className="text-sm text-muted-foreground">nanbonkayu@gmail.com</p>
        </Card>

        <Card className="p-6 text-center hover:shadow-elegant transition-all">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">Call Us</h3>
          <p className="text-sm text-muted-foreground">+251976892311</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
            onClick={() => window.open('https://wa.me/251976892311', '_blank')}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
        </Card>

        <Card className="p-6 text-center hover:shadow-elegant transition-all">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">Visit Us</h3>
          <p className="text-sm text-muted-foreground">Addis Ababa</p>
        </Card>
      </div>

      {/* Contact Form */}
      <Card className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Your name"
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
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
                className={errors.email ? 'border-destructive' : ''}
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
              className={errors.subject ? 'border-destructive' : ''}
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
              rows={6}
              {...register('message')}
              className={errors.message ? 'border-destructive' : ''}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full md:w-auto"
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
            <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>.
          </p>
        </form>
      </Card>

      {/* FAQ Section */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">How quickly will I receive a response?</h3>
            <p className="text-sm text-muted-foreground">
              We typically respond to all inquiries within 24 hours during business days.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Do you offer phone support?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, phone support is available for Pro and Enterprise plan subscribers.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Can I schedule a demo?</h3>
            <p className="text-sm text-muted-foreground">
              Absolutely! Mention "demo request" in your message and we'll arrange a time that works for you.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
