import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BlogGenerator from '@/components/templates/BlogGenerator';
import SocialMediaGenerator from '@/components/templates/SocialMediaGenerator';
import EmailGenerator from '@/components/templates/EmailGenerator';
import AdCopyGenerator from '@/components/templates/AdCopyGenerator';
import { 
  PenTool, 
  MessageSquare, 
  Mail, 
  Megaphone,
  ArrowRight,
  Sparkles,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Crown
} from 'lucide-react';

const templates = [
  {
    id: 'blog',
    title: 'Blog Posts',
    description: 'Create engaging blog content, articles, and web copy',
    icon: PenTool,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    features: ['SEO Optimized', 'Multiple Tones', 'Custom Length'],
    usageCount: '2.1k uses'
  },
  {
    id: 'social',
    title: 'Social Media',
    description: 'Generate captivating social media posts and captions',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    features: ['Platform Specific', 'Hashtag Ready', 'Engaging CTAs'],
    usageCount: '1.8k uses'
  },
  {
    id: 'email',
    title: 'Email Writer',
    description: 'Craft professional emails, newsletters, and campaigns',
    icon: Mail,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    features: ['Subject Lines', 'Personalized', 'Call-to-Actions'],
    usageCount: '1.5k uses'
  },
  {
    id: 'ads',
    title: 'Ad Copy',
    description: 'Create compelling advertisements and marketing copy',
    icon: Megaphone,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    features: ['High Converting', 'A/B Test Ready', 'Platform Optimized'],
    usageCount: '950 uses'
  }
];

export default function Templates() {
  const location = useLocation();
  const currentTemplate = location.pathname.split('/')[2];
  const { profile } = useAuth();
  const [recentContent, setRecentContent] = useState<any[]>([]);

  const loadRecentContent = async (templateType: string) => {
    if (!profile) return;
    
    const { data } = await supabase
      .from('content_generations')
      .select('*')
      .eq('user_id', profile.user_id)
      .eq('template_type', templateType)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setRecentContent(data);
    }
  };

  useEffect(() => {
    if (currentTemplate && currentTemplate !== 'templates' && profile) {
      loadRecentContent(currentTemplate);
    }
  }, [currentTemplate, profile]);

  if (currentTemplate && currentTemplate !== 'templates') {
    const template = templates.find(t => t.id === currentTemplate);
    
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentTemplate === 'blog' && <BlogGenerator />}
            {currentTemplate === 'social' && <SocialMediaGenerator />}
            {currentTemplate === 'email' && <EmailGenerator />}
            {currentTemplate === 'ads' && <AdCopyGenerator />}
          </div>

          {/* Recent Creations Sidebar */}
          <div>
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-violet-500/10 via-violet-500/5 to-transparent">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-violet-500/20 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  Recent {template?.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentContent.length > 0 ? (
                    recentContent.map((content, index) => (
                      <div key={index} className="group flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-2xl hover:from-muted/50 hover:to-muted/20 transition-all duration-300 border border-muted-foreground/10">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${template?.bgColor} ${template?.color}`}>
                            {template && <template.icon className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-sm truncate max-w-32" title={content.prompt}>
                              {content.prompt}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="font-medium">{content.word_count} words</span>
                              <span>•</span>
                              <span>{new Date(content.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <Clock className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-6 bg-muted/30 rounded-3xl mb-4 mx-auto w-fit">
                        {template && <template.icon className="h-12 w-12 text-muted-foreground mx-auto" />}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No {template?.title?.toLowerCase()} yet</h3>
                      <p className="text-muted-foreground text-sm">
                        Create your first {template?.title?.toLowerCase()} content to see it here!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Content Templates</h2>
        <p className="text-muted-foreground">
          Choose from our collection of AI-powered content generation templates.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="group hover:shadow-elegant transition-all duration-200 cursor-pointer">
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 ${template.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                <template.icon className={`w-6 h-6 ${template.color}`} />
              </div>
              <CardTitle className="text-lg">{template.title}</CardTitle>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span className="font-medium">{template.usageCount}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {template.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button className="w-full group-hover:shadow-sm" asChild>
                <a href={`/templates/${template.id}`}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Use Template
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Popular Templates Section */}
      <Card className="bg-gradient-subtle border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Most Popular This Week
          </CardTitle>
          <CardDescription>
            Templates that are trending among content creators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.slice(0, 2).map((template, index) => (
              <div key={template.id} className="flex items-center gap-4 p-4 bg-background rounded-lg">
                <div className={`w-10 h-10 ${template.bgColor} rounded-lg flex items-center justify-center`}>
                  <template.icon className={`w-5 h-5 ${template.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{template.title}</h4>
                  <p className="text-sm text-muted-foreground">{template.usageCount}</p>
                </div>
                <Badge variant={index === 0 ? 'default' : 'secondary'}>
                  #{index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}