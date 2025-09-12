import { BarChart3, FileText, MessageSquare, TrendingUp, Zap } from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import heroImage from "@/assets/hero-bg.jpg";

const templates = [
  {
    title: "Blog Post Generator",
    description: "Create engaging blog posts with AI assistance",
    icon: <FileText className="w-6 h-6 text-primary" />,
    href: "/templates/blog",
    examples: [
      "Write a blog post about sustainable living",
      "Create content about digital marketing trends"
    ]
  },
  {
    title: "Social Media Captions",
    description: "Generate catchy captions for your social posts",
    icon: <MessageSquare className="w-6 h-6 text-primary" />,
    href: "/templates/social",
    examples: [
      "Instagram caption for a coffee shop",
      "LinkedIn post about productivity"
    ]
  },
  {
    title: "Email Writer",
    description: "Craft professional emails in seconds",
    icon: <MessageSquare className="w-6 h-6 text-primary" />,
    href: "/templates/email",
    examples: [
      "Follow-up email after meeting",
      "Welcome email for new customers"
    ]
  },
  {
    title: "Ad Copy Maker",
    description: "Create compelling advertisements",
    icon: <Zap className="w-6 h-6 text-primary" />,
    href: "/templates/ads",
    examples: [
      "Facebook ad for fitness app",
      "Google ad for online course"
    ]
  }
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div 
        className="relative rounded-2xl overflow-hidden bg-gradient-hero p-8 text-white"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(59, 130, 246, 0.8)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to QuickWrite AI
          </h1>
          <p className="text-xl text-white/90 mb-6 max-w-2xl">
            Generate high-quality content in seconds with our AI-powered writing assistant. 
            From blog posts to social media captions, we've got you covered.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
            Start Writing Now
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Words Generated"
          value="12,847"
          description="This month"
          icon={<FileText className="w-5 h-5 text-primary" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Templates Used"
          value="23"
          description="Unique templates"
          icon={<MessageSquare className="w-5 h-5 text-primary" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Time Saved"
          value="47h"
          description="Estimated this month"
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
        />
        <StatsCard
          title="Usage Remaining"
          value="75"
          description="Words left this month"
          icon={<BarChart3 className="w-5 h-5 text-primary" />}
        />
      </div>

      {/* Usage Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Monthly Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Words Used</span>
              <span className="text-sm text-muted-foreground">425 / 500</span>
            </div>
            <Progress value={85} className="h-2" />
            <p className="text-xs text-muted-foreground">
              You have 75 words remaining this month. 
              <Button variant="link" className="p-0 h-auto text-xs">
                Upgrade to Pro
              </Button> 
              for unlimited usage.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Content Templates</h2>
            <p className="text-muted-foreground">Choose a template to get started</p>
          </div>
          <Button variant="outline">View All Templates</Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {templates.map((template) => (
            <TemplateCard key={template.title} {...template} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: "Blog Post", title: "10 Tips for Remote Work", time: "2 hours ago", words: 847 },
              { type: "Social Media", title: "Instagram Caption - Coffee", time: "5 hours ago", words: 25 },
              { type: "Email", title: "Welcome Email Template", time: "1 day ago", words: 156 },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{activity.type}</span>
                    <span>•</span>
                    <span>{activity.words} words</span>
                    <span>•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}