import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Zap, Shield, TrendingUp, Users, Star, ArrowRight, CheckCircle, PenTool } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';
import featuresShowcase from '@/assets/features-showcase.jpg';
import workflowIllustration from '@/assets/workflow-illustration.jpg';
import abstractBg from '@/assets/abstract-bg.jpg';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <PenTool className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">QuickWrite AI</span>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with 3D Animation */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium">AI-Powered Content Generation</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 animate-fade-in bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                Write Better, Faster
                <br />
                With AI Magic
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 animate-fade-in">
                Transform your ideas into compelling content in seconds. From blog posts to ad copy, 
                QuickWrite AI helps you create professional content effortlessly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in">
                <Button size="lg" onClick={() => navigate('/auth')} className="group">
                  Start Writing Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative animate-fade-in">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="AI-powered content creation interface" 
                  className="w-full h-auto object-cover"
                />
                {/* Floating Elements Animation */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-lg animate-[float_6s_ease-in-out_infinite] blur-xl" />
                  <div className="absolute top-1/3 right-1/4 w-16 h-16 sm:w-20 sm:h-20 bg-primary-glow/20 rounded-full animate-[float_8s_ease-in-out_infinite] blur-xl" style={{ animationDelay: '1s' }} />
                  <div className="absolute bottom-1/4 left-1/3 w-20 h-20 sm:w-24 sm:h-24 bg-accent/20 rounded-lg animate-[float_7s_ease-in-out_infinite] blur-xl" style={{ animationDelay: '2s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: '50K+', label: 'Active Users' },
              { value: '10M+', label: 'Words Generated' },
              { value: '99.9%', label: 'Uptime' },
              { value: '4.9/5', label: 'User Rating' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
            {/* Left Column - Image */}
            <div className="order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={featuresShowcase} 
                  alt="AI content features showcase" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Right Column - Text */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose QuickWrite AI?</h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-8">
                We combine cutting-edge AI technology with intuitive design to deliver 
                the best content creation experience.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <Card className="p-6 bg-card/50 backdrop-blur border-border/50 hover:shadow-elegant transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Advanced AI Models</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Powered by the latest language models to generate human-like, contextually relevant content.
              </p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border/50 hover:shadow-elegant transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Generate high-quality content in seconds, not hours. Boost your productivity instantly.
              </p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border/50 hover:shadow-elegant transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Secure & Private</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Your data is encrypted and never shared. We take your privacy seriously.
              </p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border/50 hover:shadow-elegant transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Continuous Improvement</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Regular updates and new features to keep you ahead of the curve.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <img src={abstractBg} alt="" className="w-full h-full object-cover" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Everything you need to create amazing content, all in one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {[
              { icon: PenTool, title: 'Blog Posts', desc: 'Create engaging blog content that ranks' },
              { icon: Sparkles, title: 'Social Media', desc: 'Craft perfect posts for all platforms' },
              { icon: Zap, title: 'Ad Copy', desc: 'Generate high-converting advertisements' },
              { icon: Users, title: 'Email Campaigns', desc: 'Write persuasive email sequences' },
              { icon: TrendingUp, title: 'Product Descriptions', desc: 'Compelling copy that sells' },
              { icon: Star, title: 'Scripts & More', desc: 'Video scripts, letters, and beyond' },
            ].map((feature, idx) => (
              <Card key={idx} className="p-6 text-center hover:shadow-elegant transition-all duration-300 hover:scale-105 bg-card/50 backdrop-blur">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Get started in three simple steps
            </p>
          </div>

          {/* Workflow Illustration */}
          <div className="max-w-4xl mx-auto mb-12">
            <img 
              src={workflowIllustration} 
              alt="QuickWrite AI workflow process" 
              className="w-full h-auto rounded-2xl shadow-xl"
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Choose Template', desc: 'Select from our library of content templates' },
              { step: '02', title: 'Enter Details', desc: 'Provide your topic and key information' },
              { step: '03', title: 'Generate & Edit', desc: 'Get AI-generated content and refine as needed' },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl font-bold text-primary/20 mb-4">{item.step}</div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Loved by Content Creators</h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              See what our users have to say about QuickWrite AI
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {[
              { name: 'Sarah Johnson', role: 'Content Marketer', text: 'QuickWrite AI has transformed how I create content. What used to take hours now takes minutes!' },
              { name: 'Michael Chen', role: 'Blogger', text: 'The quality of AI-generated content is incredible. It feels natural and engaging every time.' },
              { name: 'Emily Rodriguez', role: 'Social Media Manager', text: 'I can manage multiple clients effortlessly now. This tool is a game-changer for my business.' },
            ].map((testimonial, idx) => (
              <Card key={idx} className="p-6 bg-card/50 backdrop-blur hover:shadow-elegant transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">"{testimonial.text}"</p>
                <div>
                  <div className="text-base sm:text-lg font-bold">{testimonial.name}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Card className="max-w-4xl mx-auto p-8 sm:p-12 text-center bg-gradient-to-br from-primary/10 via-primary-glow/5 to-accent/10 border-primary/20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Ready to Transform Your Content?</h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8">
              Join thousands of content creators who are already using QuickWrite AI
            </p>
            <Button size="lg" onClick={() => navigate('/auth')} className="group w-full sm:w-auto">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <PenTool className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold">QuickWrite AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered content generation made simple and efficient.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2024 QuickWrite AI. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Add keyframe for float animation
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
`;
document.head.appendChild(style);
