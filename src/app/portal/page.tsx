"use client";

import { sbCollection, sbDoc, useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, Clock, FileText, Building2, Wallet,
  MessageSquare, AlertCircle, Loader2, ArrowRight, ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { color: string; bg: string; icon: any; step: number }> = {
  Pending:        { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: Clock, step: 1 },
  'Under Review': { color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200',  icon: FileText, step: 2 },
  Completed:      { color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: CheckCircle2, step: 3 },
  Cancelled:      { color: 'text-red-600',   bg: 'bg-red-50 border-red-200',     icon: AlertCircle, step: -1 },
};

const timelineSteps = (t: any, lang: string) => [
  { label: lang === 'ar' ? 'استلام الطلب' : 'Application Received',       icon: FileText },
  { label: lang === 'ar' ? 'قيد الدراسة' : 'Under Review',                icon: Clock },
  { label: lang === 'ar' ? 'اكتمل الطلب' : 'Application Completed',       icon: CheckCircle2 },
];

export default function PortalPage() {
  const { t, lang } = useLanguage();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const appsQuery = useMemoFirebase(() => user ? sbCollection('applications', { applicantUid: user.id }) : null, [user?.id]);
  const { data: apps, isLoading } = useCollection(appsQuery);
  const app = apps?.[0];

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4 pt-20">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-headline text-2xl font-bold text-primary">
              {isAr ? 'يرجى تسجيل الدخول' : 'Please Log In'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isAr ? 'سجّل الدخول للاطلاع على حالة طلبك' : 'Sign in to view your application status'}
            </p>
            <Link href="/login">
              <Button className="rounded-full bg-primary text-white font-bold px-8 h-11 gap-2">
                {t.nav.login} <ArrowIcon className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const cfg = app ? statusConfig[app.applicationStatus] || statusConfig.Pending : null;
  const steps = timelineSteps(t, lang);
  const activeStep = cfg?.step ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-headline text-3xl font-bold text-primary">{t.portal.title}</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {isAr ? `مرحباً، ${app?.applicantName || user.email}` : `Welcome, ${app?.applicantName || user.email}`}
            </p>
          </div>

          {!app ? (
            <div className="bg-white rounded-3xl shadow-navy-sm p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg text-foreground">{t.portal.noApp}</h3>
              <Link href="/apply">
                <Button className="rounded-full bg-primary text-white font-bold px-8 h-11 gap-2 mt-2">
                  {t.portal.goApply} <ArrowIcon className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Status card */}
              <div className="bg-white rounded-3xl shadow-navy-md overflow-hidden">
                <div className="navy-gradient px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-widest">{t.portal.myApp}</p>
                      <h2 className="text-white font-headline text-2xl font-bold mt-1">{app.companyName}</h2>
                    </div>
                    <Badge className={cn('px-4 py-2 rounded-full text-sm font-bold border', cfg?.bg, cfg?.color)}>
                      {t.admin.status[app.applicationStatus as keyof typeof t.admin.status] || app.applicationStatus}
                    </Badge>
                  </div>
                </div>

                <div className="p-8">
                  {/* Timeline */}
                  {app.applicationStatus !== 'Cancelled' && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between relative">
                        <div className="absolute inset-x-0 top-5 h-0.5 bg-border" />
                        {steps.map((s, i) => {
                          const done = activeStep > i + 1;
                          const active = activeStep === i + 1;
                          return (
                            <div key={i} className="relative flex flex-col items-center gap-2 flex-1">
                              <div className={cn(
                                'w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-all',
                                done  ? 'bg-primary border-primary text-white' :
                                active ? 'bg-gold-DEFAULT border-gold-DEFAULT text-white' :
                                         'bg-white border-border text-muted-foreground'
                              )}>
                                <s.icon className="h-4 w-4" />
                              </div>
                              <span className={cn('text-[11px] font-medium text-center', active ? 'text-gold-dark' : done ? 'text-primary' : 'text-muted-foreground')}>
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Info grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InfoTile icon={Building2} label={isAr ? 'اسم المنشأة' : 'Business'} value={app.companyName} />
                    <InfoTile icon={Wallet} label={isAr ? 'الدخل السنوي' : 'Annual Income'} value={`${app.approximateAnnualIncome?.toLocaleString()} ${t.common.currency}`} />
                    <InfoTile icon={Clock} label={t.portal.submittedOn} value={new Date(app.submissionDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-SA')} />
                  </div>
                </div>
              </div>

              {/* Comments timeline */}
              {app.comments && app.comments.length > 0 && (
                <div className="bg-white rounded-3xl shadow-navy-sm overflow-hidden">
                  <div className="px-8 py-5 border-b border-border flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-primary">{isAr ? 'رسائل من الفريق' : 'Messages from Team'}</h3>
                  </div>
                  <div className="p-6 space-y-4 max-h-80 overflow-auto">
                    {app.comments.map((c: any, i: number) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                          {c.authorName?.charAt(0) || 'Q'}
                        </div>
                        <div className="bg-muted/40 rounded-2xl rounded-ss-none px-4 py-3 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-primary">{c.authorName}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(c.timestamp).toLocaleDateString(isAr ? 'ar-SA' : 'en-SA')}</span>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-muted/30 rounded-2xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm font-bold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
