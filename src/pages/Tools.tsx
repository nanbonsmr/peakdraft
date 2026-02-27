import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { PublicNavbar } from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { 
  QrCode, 
  Palette, 
  FileImage,
  Minimize2,
  Hash,
  AlignLeft,
  Type,
  Lock,
  ArrowRight,
  Link2,
  Globe,
  Mail,
  Target,
  Image,
  FileText,
  Scissors,
  Merge,
  ImageIcon,
  Shield,
  Unlock,
  Braces,
  Binary,
  Code2,
  Link,
  FileType,
  GitCompare,
  Clock,
  Ruler,
  KeyRound,
  Fingerprint,
  Key,
  ShieldCheck
} from 'lucide-react';

const tools = [
  // General Tools
  { id: 'image-compress', name: 'Image Compressor', description: 'Reduce image file size while maintaining quality', icon: Minimize2, color: 'text-blue-500' },
  { id: 'image-convert', name: 'Image Converter', description: 'Convert images between PNG, JPG, and WebP formats', icon: FileImage, color: 'text-green-500' },
  { id: 'text-case', name: 'Text Case Converter', description: 'Convert text to uppercase, lowercase, title case, and more', icon: Type, color: 'text-purple-500' },
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, sentences, and reading time', icon: Hash, color: 'text-orange-500' },
  { id: 'qr-generator', name: 'QR Code Generator', description: 'Generate QR codes from text or URLs', icon: QrCode, color: 'text-pink-500' },
  { id: 'color-converter', name: 'Color Converter', description: 'Convert colors between HEX, RGB, and HSL', icon: Palette, color: 'text-cyan-500' },
  { id: 'lorem-generator', name: 'Lorem Ipsum Generator', description: 'Generate placeholder text for your designs', icon: AlignLeft, color: 'text-yellow-500' },
  // PDF Tools
  { id: 'pdf-merge', name: 'PDF Merger', description: 'Combine multiple PDF files into one document', icon: Merge, color: 'text-red-500' },
  { id: 'pdf-split', name: 'PDF Splitter', description: 'Extract specific pages from a PDF file', icon: Scissors, color: 'text-orange-600' },
  { id: 'image-to-pdf', name: 'Image to PDF', description: 'Convert images to PDF documents', icon: FileText, color: 'text-blue-600' },
  { id: 'pdf-to-image', name: 'PDF to Image', description: 'Convert PDF pages to image files', icon: ImageIcon, color: 'text-green-600' },
  { id: 'pdf-password', name: 'PDF Password Protect', description: 'Encrypt PDF files with password protection', icon: Shield, color: 'text-purple-600' },
  { id: 'pdf-decrypt', name: 'PDF Decrypt', description: 'Decrypt password-protected PDF files', icon: Unlock, color: 'text-teal-600' },
  // Marketing Tools
  { id: 'utm-builder', name: 'UTM Link Builder', description: 'Create trackable campaign URLs with UTM parameters', icon: Link2, color: 'text-indigo-500' },
  { id: 'meta-tags', name: 'Meta Tag Generator', description: 'Generate SEO meta tags and Open Graph tags', icon: Globe, color: 'text-emerald-500' },
  { id: 'email-signature', name: 'Email Signature Generator', description: 'Create professional HTML email signatures', icon: Mail, color: 'text-rose-500' },
  { id: 'headline-analyzer', name: 'Headline Analyzer', description: 'Analyze and score your headlines for engagement', icon: Target, color: 'text-amber-500' },
  { id: 'social-sizes', name: 'Social Media Size Guide', description: 'Image dimensions for all social media platforms', icon: Image, color: 'text-violet-500' },
  // Developer Tools
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Format, validate, and minify JSON data', icon: Braces, color: 'text-sky-500' },
  { id: 'base64', name: 'Base64 Encoder/Decoder', description: 'Encode or decode Base64 strings', icon: Binary, color: 'text-lime-500' },
  { id: 'css-minifier', name: 'CSS Minifier', description: 'Minify CSS code to reduce file size', icon: Code2, color: 'text-fuchsia-500' },
  { id: 'slug-generator', name: 'Slug Generator', description: 'Generate URL-friendly slugs from text', icon: Link, color: 'text-teal-500' },
  // Text/Writing Tools
  { id: 'markdown-preview', name: 'Markdown Previewer', description: 'Write and preview Markdown in real time', icon: FileType, color: 'text-orange-400' },
  { id: 'text-diff', name: 'Text Diff Checker', description: 'Compare two texts and highlight differences', icon: GitCompare, color: 'text-red-400' },
  // Math/Data Tools
  { id: 'timestamp', name: 'Timestamp Converter', description: 'Convert between Unix timestamps and dates', icon: Clock, color: 'text-blue-400' },
  { id: 'unit-converter', name: 'Unit Converter', description: 'Convert length, weight, temperature, and data units', icon: Ruler, color: 'text-green-400' },
  // Security Tools
  { id: 'password-gen', name: 'Password Generator', description: 'Generate secure random passwords', icon: KeyRound, color: 'text-rose-400' },
  { id: 'hash-gen', name: 'Hash Generator', description: 'Generate SHA-1, SHA-256, SHA-384, SHA-512 hashes', icon: Fingerprint, color: 'text-purple-400' },
  { id: 'uuid-gen', name: 'UUID Generator', description: 'Generate random UUIDs (v4)', icon: Key, color: 'text-cyan-400' },
  { id: 'jwt-decoder', name: 'JWT Decoder', description: 'Decode and inspect JSON Web Tokens', icon: ShieldCheck, color: 'text-amber-400' },
];

export default function Tools() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleToolClick = (toolId: string) => {
    if (isSignedIn) {
      // User is logged in, navigate directly to the tool
      navigate(`/app/tools?tool=${toolId}`);
    } else {
      // User is not logged in, show login dialog
      setSelectedTool(toolId);
      setShowLoginDialog(true);
    }
  };

  const handleLogin = () => {
    // Store the intended tool in sessionStorage so we can redirect after login
    if (selectedTool) {
      sessionStorage.setItem('redirectAfterLogin', `/app/tools?tool=${selectedTool}`);
    }
    navigate('/auth');
  };

  return (
    <>
      <Helmet>
        <title>Free Online Utility Tools - Image Compressor, QR Generator, Developer Tools | PeakDraft</title>
        <meta name="description" content="Free online utility tools: image compressor, format converter, QR code generator, JSON formatter, Base64 encoder, password generator, hash generator, and more. All browser-based." />
        <meta name="keywords" content="image compressor, qr code generator, JSON formatter, Base64 encoder, password generator, hash generator, UUID generator, text tools, free online tools, developer tools" />
        <link rel="canonical" href="https://peakdraft.netlify.app/tools" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Free Online Utility Tools | PeakDraft" />
        <meta property="og:description" content="Image compression, QR codes, JSON formatting, password generation, and more — all free, browser-based tools." />
        <meta property="og:url" content="https://peakdraft.netlify.app/tools" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Free Online Utility Tools | PeakDraft" />
        <meta name="twitter:description" content="Free browser-based tools for images, text, development, and security." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <PublicNavbar />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4">Free for All Users</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Free Online Tools</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful utilities for images, text, and more. Sign in to access all tools in your dashboard.
              </p>
            </div>
          </section>

          {/* Tools Section */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                  <Card 
                    key={tool.id} 
                    className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-primary/50 group"
                    onClick={() => handleToolClick(tool.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-2`}>
                          <tool.icon className={`h-6 w-6 ${tool.color}`} />
                        </div>
                        {!isSignedIn && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardTitle className="flex items-center gap-2">
                        {tool.name}
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          {!isSignedIn && (
            <section className="py-12 md:py-16 bg-muted/50">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Get Access to All Tools</h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Sign up for free to access all utility tools plus 25+ AI content generation templates.
                </p>
                <Button size="lg" onClick={() => navigate('/auth')}>
                  Sign Up Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </section>
          )}
        </main>

        <PublicFooter />
      </div>

      {/* Login Required Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Sign In Required
            </DialogTitle>
            <DialogDescription>
              Please sign in or create an account to use this tool. It's free and only takes a moment.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              By signing up, you'll also get access to:
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>✓ All utility tools</li>
              <li>✓ 25+ AI content templates</li>
              <li>✓ Task management features</li>
              <li>✓ 500 free words per month</li>
            </ul>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogin}>
              Sign In / Sign Up
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
