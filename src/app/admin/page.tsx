"use client";

import { sbCollection, sbDoc, useAuth, useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Logo } from '@/components/Logo';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, Printer, Settings2, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminPage() {
  const { t, lang } = useLanguage();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const isAr = lang === 'ar';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [printApp, setPrintApp] = useState<any>(null);

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    applicantName: true, companyName: true, applicationStatus: true,
    submissionDate: true, hasObligations: false, totalObligation: false,
    fundingEntity: false, remaining: false,
  });

  const columnLabels: Record<string, string> = {
    applicantName: t.apply.personal.name, companyName: t.apply.company.name,
    applicationStatus: t.common.status, hasObligations: t.apply.financial.hasObligations,
    totalObligation: t.apply.financial.totalObligation, fundingEntity: t.apply.financial.fundingEntity,
    remaining: t.apply.financial.remaining, submissionDate: t.common.date,
  };

  const profileRef = useMemoFirebase(() => sbDoc('staff_profiles', user?.id), [user?.id]);
  const { data: profile, isLoading: profileLoading } = useDoc(profileRef);
  const isStaff = profile?.role === 'admin' || profile?.role === 'employee';

  const appsRef = useMemoFirebase(() => (user && isStaff) ? sbCollection('applications') : null, [user?.id, isStaff]);
  const { data: applicants, isLoading } = useCollection(appsRef);

  const filtered = useMemo(() => {
    if (!applicants) return [];
    let list = applicants;
    if (statusFilter !== 'All') list = list.filter(a => a.applicationStatus === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.applicantName?.toLowerCase().includes(q) ||
        a.companyName?.toLowerCase().includes(q) ||
        a.applicantPhone?.includes(q)
      );
    }
    return list;
  }, [applicants, statusFilter, search]);

  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      let email = identifier.trim();
      if (!email.includes('@')) {
        const { data } = await auth.from('staff_profiles').select('email').eq('username', email).single();
        if (data?.email) email = data.email;
      }
      const { error } = await auth.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e: any) {
      toast({ variant: 'destructive', title: isAr ? 'خطأ' : 'Error', description: e.message.replace(/Firebase: /g, '') });
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePrint = (app: any) => {
    setPrintApp(app);
    setTimeout(() => window.print(), 150);
  };

  if (isUserLoading || (user && profileLoading)) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Login gate
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4 pt-20">
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-3xl shadow-navy-lg overflow-hidden">
              <div className="navy-gradient p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3">
                  <Lock className="h-7 w-7 text-gold-DEFAULT" />
                </div>
                <h1 className="font-headline text-xl font-bold text-white">{t.admin.login.title}</h1>
              </div>
              <div className="p-7 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">{t.admin.login.email}</Label>
                  <Input value={identifier} onChange={e => setIdentifier(e.target.value)}
                    placeholder={isAr ? 'اسم المستخدم أو البريد' : 'Username or email'}
                    className="h-11 rounded-xl" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">{t.admin.login.password}</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    className="h-11 rounded-xl" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
                <Button onClick={handleLogin} disabled={loginLoading} className="w-full h-12 rounded-xl bg-primary font-bold">
                  {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.admin.login.submit}
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="print:hidden"><Navbar /></div>

      {/* Hidden print template */}
      {printApp && (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-12 text-black text-sm">
          <div className="flex justify-between items-center border-b-2 border-primary pb-8 mb-10">
            <div className="flex items-center gap-4">
              <Logo size="lg" />
            </div>
            <div className="text-left rtl:text-right">
              <h2 className="text-xl font-bold">{isAr ? 'تفاصيل الطلب' : 'Application Details'}</h2>
              <p className="text-sm opacity-50">#{printApp.id?.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <Section title={isAr ? 'بيانات المتقدم' : 'Applicant'}>
              <Row label={isAr ? 'الاسم' : 'Name'} value={printApp.applicantName} />
              <Row label={isAr ? 'الجوال' : 'Phone'} value={printApp.applicantPhone} />
              <Row label={isAr ? 'البريد' : 'Email'} value={printApp.applicantEmail} />
            </Section>
            <Section title={isAr ? 'معلومات المنشأة' : 'Company'}>
              <Row label={isAr ? 'الاسم' : 'Name'} value={printApp.companyName} />
              <Row label={isAr ? 'السجل' : 'Registry'} value={printApp.commercialRegistryNumber} />
              <Row label={isAr ? 'تاريخ التقديم' : 'Date'} value={new Date(printApp.submissionDate).toLocaleDateString()} />
            </Section>
            <div className="col-span-2">
              <Section title={isAr ? 'المعلومات المالية' : 'Financial'}>
                <div className="grid grid-cols-3 gap-4">
                  <Row label={isAr ? 'الدخل السنوي' : 'Annual Income'} value={`${printApp.approximateAnnualIncome} ${t.common.currency}`} />
                  <Row label={isAr ? 'البنك' : 'Bank'} value={printApp.bankName} />
                  <Row label={isAr ? 'الحالة' : 'Status'} value={t.admin.status[printApp.applicationStatus as keyof typeof t.admin.status] || printApp.applicationStatus} />
                </div>
              </Section>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t flex justify-between opacity-40 text-xs">
            <span>© {isAr ? 'كويك ديل للحلول المالية' : 'Quick Deal Finance Solutions'}</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="flex-grow flex flex-col md:flex-row print:hidden">
        <AdminSidebar />
        <main className="flex-grow p-6 md:p-8 space-y-6">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="font-headline text-2xl font-bold text-primary">{t.admin.applicants}</h1>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={isAr ? 'بحث...' : 'Search...'}
                  className="h-9 rounded-full ps-9 text-sm w-48 bg-white border-border" />
              </div>
              {/* Column toggle */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full gap-1.5 h-9">
                    <Settings2 className="h-3.5 w-3.5" />
                    {isAr ? 'الأعمدة' : 'Columns'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-2">
                  {Object.keys(columnLabels).map(col => (
                    <div key={col} onClick={() => setVisibleColumns(p => ({ ...p, [col]: !p[col] }))}
                      className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg cursor-pointer">
                      <Checkbox checked={visibleColumns[col]} onCheckedChange={() => {}} />
                      <Label className="cursor-pointer text-sm">{columnLabels[col]}</Label>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="bg-muted/50 rounded-full p-1">
              {['All', 'Pending', 'Under Review', 'Completed', 'Cancelled'].map(s => (
                <TabsTrigger key={s} value={s} className="rounded-full text-xs px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  {s === 'All' ? t.common.all : t.admin.status[s as keyof typeof t.admin.status]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Table */}
          <Card className="border-none shadow-navy-sm overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    {Object.keys(columnLabels).filter(c => visibleColumns[c]).map(c => (
                      <TableHead key={c} className="text-xs font-semibold text-muted-foreground">{columnLabels[c]}</TableHead>
                    ))}
                    <TableHead className="text-xs font-semibold text-muted-foreground text-end">{t.common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={10} className="text-center py-16 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={10} className="text-center py-16 text-muted-foreground text-sm">
                      {isAr ? 'لا توجد نتائج' : 'No results found'}
                    </TableCell></TableRow>
                  ) : filtered.map(app => (
                    <TableRow key={app.id} className="hover:bg-muted/20 transition-colors">
                      {visibleColumns.applicantName && <TableCell className="font-medium text-sm">{app.applicantName}</TableCell>}
                      {visibleColumns.companyName && <TableCell className="text-sm text-muted-foreground">{app.companyName}</TableCell>}
                      {visibleColumns.applicationStatus && (
                        <TableCell>
                          <Badge className={cn('px-3 py-0.5 rounded-full text-xs font-medium border', statusColors[app.applicationStatus])}>
                            {t.admin.status[app.applicationStatus as keyof typeof t.admin.status] || app.applicationStatus}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.hasObligations && <TableCell className="text-sm">{app.hasObligations ? t.common.yes : t.common.no}</TableCell>}
                      {visibleColumns.totalObligation && <TableCell className="text-sm">{app.totalObligation || 0} {t.common.currency}</TableCell>}
                      {visibleColumns.fundingEntity && <TableCell className="text-sm">{app.fundingEntity || '—'}</TableCell>}
                      {visibleColumns.remaining && <TableCell className="text-sm">{app.remaining || 0} {t.common.currency}</TableCell>}
                      {visibleColumns.submissionDate && <TableCell className="text-sm text-muted-foreground">{new Date(app.submissionDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-SA')}</TableCell>}
                      <TableCell>
                        <div className="flex justify-end gap-1.5">
                          <Link href={`/admin/applications/${app.id}`}>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-primary hover:bg-primary/8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button size="icon" onClick={() => handlePrint(app)}
                            className="h-8 w-8 rounded-lg bg-gold-DEFAULT/10 hover:bg-gold-DEFAULT/20 text-gold-dark border border-gold-DEFAULT/20">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filtered.length > 0 && (
              <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground">
                {isAr ? `${filtered.length} طلب` : `${filtered.length} application${filtered.length !== 1 ? 's' : ''}`}
              </div>
            )}
          </Card>
        </main>
      </div>
      <div className="print:hidden"><Footer /></div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="font-bold text-primary border-b border-primary/20 pb-2 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm"><span className="opacity-50 me-2">{label}:</span><span className="font-medium">{value}</span></p>
  );
}
