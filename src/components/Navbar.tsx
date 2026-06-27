"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '@/lib/utils';
import { Menu, X, Globe, LogOut, User, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { t, lang, toggleLang } = useLanguage();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAdmin = pathname?.startsWith('/admin');
  const isLight = !isAdmin && !scrolled && pathname === '/';

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const links = [
    { href: '/', label: t.nav.home },
    { href: '/apply', label: t.nav.apply },
    ...(user ? [{ href: '/portal', label: t.nav.portal }] : []),
  ];

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled || isAdmin || pathname !== '/'
          ? 'bg-white/95 backdrop-blur-md shadow-navy-sm border-b border-border'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo
            variant={isLight ? 'white' : 'default'}
            size="sm"
          />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  isLight
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-foreground/70 hover:text-primary hover:bg-primary/5',
                  pathname === link.href && (isLight ? 'text-white bg-white/15' : 'text-primary bg-primary/10')
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Lang toggle */}
            <button
              onClick={toggleLang}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                isLight
                  ? 'text-white/70 hover:text-white hover:bg-white/10 border border-white/20'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5 border border-border'
              )}
            >
              <Globe className="h-3.5 w-3.5" />
              {lang === 'ar' ? 'EN' : 'عر'}
            </button>

            {/* Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                    isLight
                      ? 'text-white border-white/25 hover:bg-white/10'
                      : 'text-primary border-primary/20 hover:bg-primary/5'
                  )}>
                    <User className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/portal">{t.nav.portal}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin">{t.nav.admin}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="h-4 w-4 me-2" />
                    {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'rounded-full text-sm',
                      isLight ? 'text-white hover:bg-white/10' : ''
                    )}
                  >
                    {t.nav.login}
                  </Button>
                </Link>
                <Link href="/apply">
                  <Button
                    size="sm"
                    className="rounded-full bg-gold-DEFAULT text-primary font-bold hover:bg-gold-dark shadow-gold-sm px-5 text-sm"
                  >
                    {t.nav.apply}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className={cn(
                'md:hidden p-2 rounded-full transition-colors',
                isLight ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-muted'
              )}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-t border-border shadow-navy-md">
          <div className="px-4 py-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border space-y-2">
              {!user ? (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl">{t.nav.login}</Button>
                  </Link>
                  <Link href="/apply" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full rounded-xl bg-gold-DEFAULT text-primary font-bold hover:bg-gold-dark">
                      {t.nav.apply}
                    </Button>
                  </Link>
                </>
              ) : (
                <Button onClick={handleLogout} variant="outline" className="w-full rounded-xl text-destructive">
                  <LogOut className="h-4 w-4 me-2" />
                  {t.nav.logout}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
