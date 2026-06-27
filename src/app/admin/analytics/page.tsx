"use client";

import { useMemo } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useFirestore, useCollection, useMemoFirebase, useUser, sbCollection } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText, CheckCircle2, Clock, XCircle, AlertTriangle,
  TrendingUp, Users, Wallet, BarChart3, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Tiny bar chart (pure CSS) ─── */
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] text-muted-foreground font-medium">{d.value}</span>
          <div
            className={cn('w-full rounded-t-lg transition-all duration-500', d.color)}
            style={{ height: `${(d.value / max) * 90}%`, minHeight: d.value > 0 ? '4px' : '0' }}
          />
          <span className="text-[9px] text-muted-foreground text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Donut chart (SVG) ─── */
function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  const r = 42, cx = 56, cy = 56, circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 112 112" className="w-32 h-32">
      <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth="16" stroke="hsl(215 30% 95%)" />
      {segments.map((s, i) => {
        const pct = s.value / total;
        const dash = pct * circ;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" strokeWidth="16"
            stroke={s.color} strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset * circ} strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`} />
        );
        offset += pct;
        return el;
      })}
      <text x={cx} y={cy + 6} textAnchor="middle" className="text-sm font-bold fill-primary" fontSize="14" fontWeight="700">
        {total}
      </text>
    </svg>
  );
}

export default function AnalyticsPage() {
  const { t, lang } = useLanguage();
  const { user } = useUser();
  const db = useFirestore();
  const isAr = lang === 'ar';

  const appsRef = useMemoFirebase(() => user ? sbCollection('applications') : null, [user?.id]);
  const { data: apps, isLoading } = useCollection(appsRef);

  const stats = useMemo(() => {
    if (!apps) return null;
    const total = apps.length;
    const pending = apps.filter(a => a.applicationStatus === 'Pending').length;
    const underReview = apps.filter(a => a.applicationStatus === 'Under Review').length;
    const completed = apps.filter(a => a.applicationStatus === 'Completed').length;
    const cancelled = apps.filter(a => a.applicationStatus === 'Cancelled').length;
    const withObligations = apps.filter(a => a.hasObligations).length;
    const incomes = apps.map(a => a.approximateAnnualIncome || 0).filter(v => v > 0);
    const avgIncome = incomes.length ? Math.round(incomes.reduce((a, b) => a + b, 0) / incomes.length) : 0;

    // Monthly distribution (last 6 months)
    const now = new Date();
    const monthly: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = 0;
    }
    apps.forEach(a => {
      if (!a.submissionDate) return;
      const d = new Date(a.submissionDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in monthly) monthly[key]++;
    });

    // Recent 5
    const recent = [...apps]
      .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
      .slice(0, 5);

    return { total, pending, underReview, completed, cancelled, withObligations, avgIncome, monthly, recent };
  }, [apps]);

  const kpis = stats ? [
    { label: t.admin.analytics.totalApps,    value: stats.total,       icon: FileText,    color: 'bg-primary/10 text-primary' },
    { label: t.admin.analytics.pending,       value: stats.pending,     icon: Clock,       color: 'bg-amber-50 text-amber-600' },
    { label: t.admin.analytics.underReview,   value: stats.underReview, icon: TrendingUp,  color: 'bg-blue-50 text-blue-600' },
    { label: t.admin.analytics.completed,     value: stats.completed,   icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
    { label: t.admin.analytics.cancelled,     value: stats.cancelled,   icon: XCircle,     color: 'bg-red-50 text-red-600' },
    { label: t.admin.analytics.withObligations, value: stats.withObligations, icon: AlertTriangle, color: 'bg-orange-50 text-orange-600' },
  ] : [];

  const statusColors: Record<string, string> = {
    Pending: 'text-amber-600 bg-amber-50 border-amber-200',
    'Under Review': 'text-blue-600 bg-blue-50 border-blue-200',
    Completed: 'text-green-600 bg-green-50 border-green-200',
    Cancelled: 'text-red-600 bg-red-50 border-red-200',
  };

  const donutSegments = stats ? [
    { value: stats.pending,     color: '#D97706', label: t.admin.analytics.pending },
    { value: stats.underReview, color: '#2563EB', label: t.admin.analytics.underReview },
    { value: stats.completed,   color: '#16A34A', label: t.admin.analytics.completed },
    { value: stats.cancelled,   color: '#DC2626', label: t.admin.analytics.cancelled },
  ] : [];

  const monthlyBars = stats
    ? Object.entries(stats.monthly).map(([key, val]) => {
        const [y, m] = key.split('-');
        const label = new Date(Number(y), Number(m) - 1).toLocaleDateString(isAr ? 'ar-SA' : 'en-SA', { month: 'short' });
        return { label, value: val as number, color: 'bg-primary/70' };
      })
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-grow flex flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-grow p-6 md:p-8 space-y-6">
          <div>
            <h1 className="font-headline text-2xl font-bold text-primary">{t.admin.analytics.title}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {isAr ? 'نظرة شاملة على أداء الطلبات' : 'Comprehensive overview of application performance'}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
          ) : (
            <>
              {/* KPI grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {kpis.map((kpi, i) => (
                  <Card key={i} className="border-none shadow-navy-sm rounded-2xl p-4 space-y-2">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', kpi.color)}>
                      <kpi.icon className="h-4 w-4" />
                    </div>
                    <p className="font-headline text-3xl font-bold text-foreground">{kpi.value}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight">{kpi.label}</p>
                  </Card>
                ))}
              </div>

              {/* Avg income highlight */}
              {stats && stats.avgIncome > 0 && (
                <Card className="border-none shadow-navy-sm rounded-2xl p-5 navy-gradient flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-gold-DEFAULT" />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-widest">{t.admin.analytics.avgIncome}</p>
                    <p className="text-white font-headline text-2xl font-bold mt-0.5">
                      {stats.avgIncome.toLocaleString()} {t.common.currency}
                    </p>
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Donut */}
                <Card className="border-none shadow-navy-sm rounded-2xl p-6">
                  <h3 className="font-bold text-primary mb-5 flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4" />{t.admin.analytics.byStatus}
                  </h3>
                  <div className="flex items-center gap-6">
                    <DonutChart segments={donutSegments} />
                    <div className="space-y-2 flex-1">
                      {donutSegments.map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                            <span className="text-muted-foreground text-xs">{s.label}</span>
                          </div>
                          <span className="font-bold text-foreground">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Monthly bar chart */}
                <Card className="border-none shadow-navy-sm rounded-2xl p-6">
                  <h3 className="font-bold text-primary mb-5 flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />{t.admin.analytics.monthly}
                  </h3>
                  <BarChart data={monthlyBars} />
                </Card>
              </div>

              {/* Recent activity */}
              {stats && stats.recent.length > 0 && (
                <Card className="border-none shadow-navy-sm rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-primary text-sm">{t.admin.analytics.recentActivity}</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {stats.recent.map((app: any) => (
                      <div key={app.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                            {app.applicantName?.charAt(0) || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{app.applicantName}</p>
                            <p className="text-xs text-muted-foreground truncate">{app.companyName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            {new Date(app.submissionDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-SA')}
                          </span>
                          <Badge className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-medium border', statusColors[app.applicationStatus])}>
                            {t.admin.status[app.applicationStatus as keyof typeof t.admin.status] || app.applicationStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
