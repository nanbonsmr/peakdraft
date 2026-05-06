import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, ArrowRight, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function PublicNavbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/free-tools', label: 'Free AI Tools' },
    { href: '/tools', label: 'Utility Tools' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/contact', label: 'Contact' },
  ];

  const resourceLinks = [
    { href: '/blog', label: 'Blog' },
    { href: '/social-media', label: 'Social Media Tools' },
    { href: '/workflows', label: 'AI Workflows' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.png" alt="PeakDraft Logo" className="w-9 h-9 rounded-lg" />
            <span className="text-lg sm:text-xl font-bold">PeakDraft</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-1 items-center">
            {navLinks.map(link => (
              <Button key={link.label} variant="ghost" onClick={() => navigate(link.href)} className="text-sm">
                {link.label}
              </Button>
            ))}
            <DropdownMenu open={resourcesOpen} onOpenChange={setResourcesOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm gap-1">
                  Resources
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                {resourceLinks.map(link => (
                  <DropdownMenuItem
                    key={link.label}
                    onClick={() => { navigate(link.href); setResourcesOpen(false); }}
                    className="cursor-pointer"
                  >
                    {link.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map(link => (
                    <Button key={link.label} variant="ghost" className="justify-start" onClick={() => { navigate(link.href); setMobileMenuOpen(false); }}>
                      {link.label}
                    </Button>
                  ))}
                  <div className="border-t border-border pt-2 mt-2">
                    <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resources</p>
                    {resourceLinks.map(link => (
                      <Button key={link.label} variant="ghost" className="justify-start w-full" onClick={() => { navigate(link.href); setMobileMenuOpen(false); }}>
                        {link.label}
                      </Button>
                    ))}
                  </div>
                  <div className="border-t border-border pt-4 mt-2 space-y-2">
                    <Button variant="outline" className="w-full" onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}>
                      Sign In
                    </Button>
                    <Button className="w-full" onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}>
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}