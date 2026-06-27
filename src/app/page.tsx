"use client";

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft, ArrowRight,
  TrendingUp, Users, Clock, CheckCircle,
  Banknote, HeadphonesIcon, Zap, ShieldCheck,
  ChevronDown, ChevronUp, Star,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const stats = [
  { valueAr: '+500', valueEn: '500+', labelKey: 'clients', icon: Users },
  { valueAr: '+50', valueEn: '50+', labelKey: 'funded', icon: Banknote },
  { valueAr: '48', valueEn: '48', labelKey: 'time', icon: Clock },
  { valueAr: '٩٢٪', valueEn: '92%', labelKey: 'success', icon: TrendingUp },
];

export default function HomePage() {
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
  ];

  const serviceIcons = [Banknote, HeadphonesIcon, Zap, ShieldCheck];
  const serviceKeys = ['finance', 'consulting', 'fast', 'secure'] as const;

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center navy-gradient clip-diagonal overflow-hidden">
        {/* decorative circles */}
        <div className="absolute top-1/4 start-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 end-1/4 w-64 h-64 rounded-full bg-gold-DEFAULT/10 blur-2xl pointer-events-none" />
        {/* grid pattern */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0 1px,transparent 1px 64px),repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 64px)' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 w-full">
          <div className="max-w-2xl">
            {/* badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-gold-DEFAULT text-xs px-4 py-2 rounded-full mb-8 backdrop-blur-sm animate-fade-up">
              <Star className="h-3 w-3 fill-current" />
              {t.hero.badge}
            </div>

            {/* headline */}
            <h1 className="font-headline text-white text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight animate-fade-up animate-delay-100 whitespace-pre-line">
              {t.hero.title}
            </h1>

            <p className="mt-6 text-white/70 text-lg leading-relaxed max-w-lg animate-fade-up animate-delay-200">
              {t.hero.subtitle}
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-wrap gap-4 animate-fade-up animate-delay-300">
              <Link href="/apply">
                <Button className="h-14 px-8 rounded-full bg-gold-DEFAULT text-navy-900 font-bold text-base hover:bg-gold-dark shadow-gold-md gap-2.5 transition-all hover:scale-105">
                  {t.hero.cta}
                  <ArrowIcon className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#services">
                <Button variant="outline" className="h-14 px-8 rounded-full border-white/25 text-white bg-white/5 backdrop-blur-sm hover:bg-white/10 text-base">
                  {t.hero.secondary}
                </Button>
              </a>
            </div>
          </div>

          {/* floating card */}
          <div className="absolute end-8 top-1/2 -translate-y-1/2 hidden lg:block animate-fade-up animate-delay-400">
            <div className="glass rounded-3xl p-6 w-64 border border-white/20 shadow-navy-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gold-DEFAULT/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-gold-DEFAULT" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{isAr ? 'طلب مقبول' : 'Approved'}</p>
                  <p className="text-white/40 text-xs">{isAr ? 'منذ لحظات' : 'just now'}</p>
                </div>
              </div>
              <div className="space-y-2">
                {[85, 65, 90].map((w, i) => (
                  <div key={i} className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gold-DEFAULT/60" style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
              <p className="text-white/40 text-[10px] mt-3 text-center">{isAr ? 'تحليل مالي آني' : 'Real-time analysis'}</p>
            </div>
          </div>
        </div>

        {/* scroll indicator */}
        <a href="#stats" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 hover:text-white/70 transition-colors">
          <span className="text-[10px] uppercase tracking-widest">{isAr ? 'اكتشف' : 'Scroll'}</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </a>
      </section>

      {/* ─── STATS ─── */}
      <section id="stats" className="py-16 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="text-center space-y-2 p-6 rounded-2xl hover:bg-primary/3 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mx-auto">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="font-headline text-4xl font-bold text-primary stat-number">
                  {isAr ? s.valueAr : s.valueEn}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {t.stats[s.labelKey as keyof typeof t.stats]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="services" className="py-24 bg-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="text-gold-DEFAULT border-gold-DEFAULT/30 mb-4">
              {t.services.title}
            </Badge>
            <h2 className="font-headline text-4xl font-bold text-primary">{t.services.title}</h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-xl mx-auto">{t.services.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceKeys.map((key, i) => {
              const Icon = serviceIcons[i];
              return (
                <Card
                  key={key}
                  className="card-hover border-none shadow-navy-sm p-6 space-y-4 group rounded-2xl bg-white"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/8 group-hover:bg-gold-DEFAULT/20 transition-colors flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary group-hover:text-gold-dark transition-colors" />
                  </div>
                  <h3 className="font-bold text-primary text-lg">{t.services[key].title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t.services[key].desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA BAND ─── */}
      <section className="py-20 navy-gradient">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-headline text-4xl text-white font-bold mb-4">
            {isAr ? 'ابدأ رحلة التمويل اليوم' : 'Start Your Financing Journey Today'}
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            {isAr
              ? 'انضم لمئات المنشآت التي وثقت في كويك ديل وحصلت على التمويل الذي تحتاجه.'
              : 'Join hundreds of businesses that trusted Quick Deal and secured the financing they need.'}
          </p>
          <Link href="/apply">
            <Button className="h-14 px-10 rounded-full bg-gold-DEFAULT text-navy-900 font-bold text-lg hover:bg-gold-dark shadow-gold-md gap-2.5">
              {t.hero.cta}
              <ArrowIcon className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-headline text-4xl font-bold text-primary">{t.faq.title}</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={cn(
                  'border rounded-2xl overflow-hidden transition-all duration-200',
                  openFaq === i ? 'border-primary/30 shadow-navy-sm' : 'border-border hover:border-primary/20'
                )}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-start"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className={cn('font-medium text-sm', openFaq === i ? 'text-primary' : 'text-foreground')}>
                    {faq.q}
                  </span>
                  {openFaq === i
                    ? <ChevronUp className="h-4 w-4 text-gold-DEFAULT flex-shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-primary/10 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
