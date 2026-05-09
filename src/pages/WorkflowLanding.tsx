import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PublicNavbar } from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { SectionReveal } from '@/components/landing/SectionReveal';
import {
  ArrowRight, Workflow, Sparkles, Zap, Layers, Calendar, Repeat, Wand2,
  CheckCircle, Bot, FileStack, Library, BarChart3, Shield, Clock, Users,
  GitBranch, Rocket, Target, Globe, Star, Brain, PlayCircle, Save, Send,
  Image as ImageIcon, Palette,
} from 'lucide-react';

const siteUrl = 'https://peakdraft.lovable.app';

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PeakDraft Workflows - AI Content Automation",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Build, save and re-run multi-step AI content workflows. Chain 25+ templates, schedule recurring runs, and repurpose content in one click.",
  "url": `${siteUrl}/workflows`,
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "publisher": { "@type": "Organization", "name": "PeakDraft", "url": siteUrl },
};

const features = [
  { icon: Brain, title: 'AI Smart Suggestions', description: 'Get context-aware next-step recommendations powered by Gemini. The AI reads your content and suggests the perfect repurpose actions.' },
  { icon: GitBranch, title: 'Multi-Step Chains', description: 'Build sequential pipelines that pass output between steps. Generate a blog → extract hooks → create LinkedIn posts → write tweets — all automatic.' },
  { icon: Wand2, title: 'Inline AI Actions', description: 'Trigger Summarize, Rewrite, Expand, Translate and 40+ template actions on any text without leaving your editor.' },
  { icon: Calendar, title: 'Templates & Scheduling', description: 'Save recipes once, run forever. Schedule daily, weekly or monthly automated workflow runs.' },
  { icon: Library, title: '25+ Template Actions', description: 'Plug any PeakDraft template into a workflow step — Blog, Ad Copy, Hashtags, LinkedIn, Newsletters, Scripts, Product Descriptions and more.' },
  { icon: FileStack, title: 'Bulk Export & Save', description: 'Send results straight to Editor, save to your Infobase, or bulk-export everything as Markdown, DOCX, or PDF.' },
  { icon: Bot, title: 'Brand Context Toggle', description: 'Inject your Infobase brand voice into any step with a per-action toggle. Stay on-brand across every output.' },
  { icon: BarChart3, title: 'Word Usage Tracking', description: 'Every step counts toward your plan transparently. Live word meter with smart limit enforcement that pauses chains gracefully.' },
  { icon: ImageIcon, title: 'Hero Image Generator', description: 'Drop an "Image Hero" step into any chain to auto-generate a cover visual from your content. 50 words per image, fully on-brand.' },
  { icon: Palette, title: 'Social Card Pack', description: 'One step → 4 perfectly sized visuals: Instagram square, 9:16 Story, Twitter banner, and 1200×630 OG card. Ship a full visual launch in seconds.' },
];

const starterRecipes = [
  { icon: Rocket, name: 'Blog Launch Kit', steps: 'Blog Post → SEO Meta → Social Snippets → Newsletter', color: 'from-purple-500 to-pink-500' },
  { icon: Target, name: 'Product Drop Bundle', steps: 'Product Description → Ad Copy → Hashtags → Image Prompts', color: 'from-blue-500 to-cyan-500' },
  { icon: Send, name: 'Newsletter Repurpose', steps: 'Newsletter → LinkedIn → Tweet Thread → Blog Outline', color: 'from-amber-500 to-orange-500' },
];

const howItWorks = [
  { step: '01', title: 'Pick a Recipe', description: 'Choose a starter template or build your own multi-step chain from scratch.' },
  { step: '02', title: 'Drop In Content', description: 'Paste a brief, link, or any source text — the workflow handles the rest.' },
  { step: '03', title: 'Run the Chain', description: 'Watch each step generate live with brand-aware context and smart routing.' },
  { step: '04', title: 'Ship Everywhere', description: 'Export to Editor, save to Infobase, or bulk-download all assets at once.' },
];

const stats = [
  { value: '25+', label: 'Template Actions', icon: Library },
  { value: '∞', label: 'Custom Recipes', icon: GitBranch },
  { value: '10x', label: 'Faster Output', icon: Zap },
  { value: '3', label: 'Starter Kits Built-In', icon: Star },
];

const benefits = [
  'Chain unlimited steps with conditional output passing',
  'AI Smart Suggestions powered by Gemini Flash',
  '25+ template actions ready to drop into any chain',
  'Schedule recurring runs (daily, weekly, monthly)',
  'Per-step brand context toggle from your Infobase',
  'Bulk export to Markdown, DOCX, PDF, or send to Editor',
  'Auto-seeded starter recipes for new accounts',
  'Transparent word counting against your plan',
  'Run the same recipe across blogs, ads, emails & more',
  'Pause-and-resume chains when limits are reached',
];

const useCases = [
  { icon: Rocket, title: 'Content Marketers', description: 'Turn one blog post into a full week of social content with a single click.' },
  { icon: Users, title: 'Agencies', description: 'Save client-specific recipes and re-run them across every brand you manage.' },
  { icon: Target, title: 'Solopreneurs', description: 'Replace your entire content team with auto-running workflows.' },
  { icon: Globe, title: 'Localization Teams', description: 'Chain translation steps to ship content in 50+ languages instantly.' },
];

export default function WorkflowLanding() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>AI Workflow Automation | Chain 25+ Templates & Schedule Runs - PeakDraft</title>
        <meta name="description" content="Build multi-step AI content workflows. Chain 25+ templates, schedule recurring runs, repurpose blogs into social posts, ads & newsletters in one click. Free to start." />
        <meta name="keywords" content="AI workflow, content automation, AI content chains, workflow templates, multi-step AI, content repurposing, AI scheduling, marketing automation, PeakDraft workflows" />
        <link rel="canonical" href={`${siteUrl}/workflows`} />
        <meta property="og:title" content="AI Workflow Automation - Chain & Schedule Content - PeakDraft" />
        <meta property="og:description" content="Build, save and re-run multi-step AI content workflows. 25+ templates, smart suggestions, scheduling and brand context — all in one place." />
        <meta property="og:url" content={`${siteUrl}/workflows`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${siteUrl}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Workflow Automation - PeakDraft" />
        <meta name="twitter:description" content="Chain 25+ AI templates into automated content workflows." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <PublicNavbar />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden py-16 sm:py-20 lg:py-28">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-purple-900/20" />
            <div className="absolute top-1/4 left-1/3 w-72 h-72 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-80 sm:h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-700" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                  <Workflow className="w-3.5 h-3.5 mr-1.5" />
                  AI Workflow Automation
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] mb-5 sm:mb-7">
                  Turn one idea into{' '}
                  <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    a hundred assets
                  </span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-7 sm:mb-9 max-w-2xl mx-auto">
                  Chain AI templates into multi-step workflows. Generate, repurpose, translate and schedule — all automatically, all on-brand.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button size="lg" onClick={() => navigate('/auth')} className="gap-2 text-base">
                    Start Building Free <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/features')} className="text-base">
                    <PlayCircle className="w-4 h-4 mr-2" /> See How It Works
                  </Button>
                </div>
              </motion.div>

              {/* Workflow visualization */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-12 sm:mt-16"
              >
                <div className="relative max-w-3xl mx-auto p-4 sm:p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl shadow-primary/10">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-2 items-center">
                    {[
                      { icon: Sparkles, label: 'Brief', tone: 'from-primary/30 to-primary/10' },
                      { icon: Layers, label: 'Blog Post', tone: 'from-purple-500/30 to-purple-500/10' },
                      { icon: Repeat, label: 'Repurpose', tone: 'from-pink-500/30 to-pink-500/10' },
                      { icon: Send, label: 'Publish', tone: 'from-amber-500/30 to-amber-500/10' },
                    ].map((node, i) => (
                      <div key={node.label} className="flex sm:flex-col items-center gap-3 sm:gap-2">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${node.tone} border border-border/50 flex items-center justify-center shrink-0`}>
                          <node.icon className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                        </div>
                        <p className="text-xs sm:text-sm font-medium">{node.label}</p>
                        {i < 3 && <ArrowRight className="hidden sm:block w-4 h-4 text-muted-foreground absolute" style={{ left: `${(i + 1) * 25 - 2}%`, top: '40%' }} />}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <SectionReveal>
          <section className="py-12 sm:py-16 border-y border-border/40 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
                {stats.map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="text-center p-3 sm:p-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <s.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">{s.value}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* Features */}
        <SectionReveal>
          <section className="py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10 sm:mb-16">
                <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Built for Speed & Scale
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">Everything you need to automate content</h2>
                <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
                  Eight powerful capabilities that turn the AI workflow into your most reliable team member.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {features.map((f, i) => (
                  <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                    <Card className="h-full group hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                      <CardContent className="p-4 sm:p-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                          <f.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">{f.title}</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{f.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* Starter Recipes */}
        <SectionReveal>
          <section className="py-16 sm:py-20 lg:py-24 bg-muted/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10 sm:mb-14">
                <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20">
                  <Library className="w-3.5 h-3.5 mr-1.5" /> Starter Recipes Included
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">Production-ready chains, day one</h2>
                <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
                  Every new account gets three battle-tested workflow recipes auto-seeded. Run them instantly or remix as your own.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {starterRecipes.map((r, i) => (
                  <motion.div key={r.name} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Card className="h-full overflow-hidden group hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                      <div className={`h-2 bg-gradient-to-r ${r.color}`} />
                      <CardContent className="p-5 sm:p-6">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <r.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">{r.name}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{r.steps}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* How it works */}
        <SectionReveal>
          <section className="py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10 sm:mb-16">
                <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20">
                  <Clock className="w-3.5 h-3.5 mr-1.5" /> Four Steps to Launch
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">From idea to omnichannel in minutes</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {howItWorks.map((item, i) => (
                  <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                      <CardContent className="p-5 sm:p-6">
                        <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary/40 to-purple-400/40 bg-clip-text text-transparent">{item.step}</span>
                        <h3 className="text-base sm:text-lg font-semibold mt-2 sm:mt-3 mb-1.5 sm:mb-2">{item.title}</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{item.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* Benefits */}
        <SectionReveal>
          <section className="py-16 sm:py-20 lg:py-24 bg-muted/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                <div>
                  <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Why Workflows
                  </Badge>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">The unfair advantage in your stack</h2>
                  <p className="text-muted-foreground text-sm sm:text-lg mb-6">
                    Stop copy-pasting between tools. Workflows wire your favorite PeakDraft templates into one continuous, repeatable engine.
                  </p>
                  <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
                    Try Workflows Free <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2.5 sm:space-y-3">
                  {benefits.map((b, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="flex items-start gap-3 p-3 rounded-lg bg-card/40 border border-border/40">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base">{b}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* Use cases */}
        <SectionReveal>
          <section className="py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10 sm:mb-14">
                <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20">
                  <Users className="w-3.5 h-3.5 mr-1.5" /> Built For Every Team
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">Who runs PeakDraft Workflows</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {useCases.map((u, i) => (
                  <motion.div key={u.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                    <Card className="h-full hover:border-primary/40 transition-colors">
                      <CardContent className="p-5 sm:p-6 text-center">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <u.icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg mb-1.5">{u.title}</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{u.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* FAQ */}
        <SectionReveal>
          <section className="py-16 sm:py-20 lg:py-24 bg-muted/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
              <div className="text-center mb-10">
                <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20">
                  <Shield className="w-3.5 h-3.5 mr-1.5" /> FAQ
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold">Common questions</h2>
              </div>
              <div className="space-y-4">
                {[
                  { q: 'Do workflow steps count toward my plan?', a: 'Yes — every AI generation inside a workflow counts transparently against your word allowance, with live tracking and graceful pause when limits are reached.' },
                  { q: 'Can I share recipes with my team?', a: 'Save any chain as a reusable template in your library. Custom recipes are accessible across every content type in your account.' },
                  { q: 'What templates can I drop into a step?', a: 'All 25+ PeakDraft templates — Blog, LinkedIn, Hashtags, Ad Copy, Newsletter, Press Release, Product Description, Scripts, Image Prompts, and more.' },
                  { q: 'Can I schedule workflows to run automatically?', a: 'Yes. Set daily, weekly, or monthly schedules and let your recipes run hands-free.' },
                  { q: 'Is brand voice supported?', a: 'Toggle Infobase brand context on any step to inject your tone, style, and product knowledge into outputs.' },
                ].map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <Card>
                      <CardContent className="p-5">
                        <h3 className="font-semibold mb-1.5">{f.q}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{f.a}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* CTA */}
        <SectionReveal>
          <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-primary/15 via-background to-purple-900/15">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Stop generating. Start <span className="bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">automating</span>.
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground mb-7 sm:mb-9">
                Join thousands of marketers and creators shipping 10× more content with PeakDraft Workflows.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/auth')} className="gap-2 text-base">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/pricing')} className="text-base">
                  View Pricing
                </Button>
              </div>
            </div>
          </section>
        </SectionReveal>
      </main>

      <PublicFooter />
    </>
  );
}
