"use client";

import { sbCollection, sbDoc, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Logo } from '@/components/Logo';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, ArrowRight, MessageSquare, User, Building2, Wallet,
  Clock, Send, Printer, Loader2, ShieldAlert, ChevronDown,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function ApplicationDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, lang } = useLanguage();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const isAr = lang === 'ar';
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const appRef = useMemoFirebase(() => sbDoc('applications', id as string), [id]);
  const { data: app, isLoading } = useDoc(appRef);

  const profileRef = useMemoFirebase(() => sbDoc('staff_profiles', user?.id), [user?.id]);
  const { data: profile } = useDoc(profileRef);

  const cleanError = (e: any) => String(e?.message || e);

  const handleAddComment = async () => {
    if (!commentText.trim() || !user || !profile) return;
    setSubmittingComment(true);
    try {
      const { data: cur } = await db.from('applications').select('comments').eq('id', id).single();
      const newCmts = [...(cur?.comments || []), { authorName: profile.name, authorUid: user.id, text: commentText, timestamp: new Date().toISOString() }];
      const { error: ce } = await db.from('applications').update({ comments: newCmts }).eq('id', id);
      if (ce) throw ce;
      setCommentText('');
      toast({ title: isAr ? 'تمت إضافة الملاحظة' : 'Note added' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: isAr ? 'خطأ' : 'Error', description: cleanError(e) });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!app || newStatus === app.applicationStatus) return;
    setUpdatingStatus(true);
    try {
      const { error: se } = await db.from('applications').update({ applicationStatus: newStatus }).eq('id', id);
      if (se) throw se;
      toast({ title: isAr ? 'تم تحديث الحالة' : 'Status updated' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: isAr ? 'خطأ' : 'Error', description: cleanError(e) });
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  if (!app) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{isAr ? 'الطلب غير موجود' : 'Application not found'}</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="print:hidden"><Navbar /></div>

      {/* Print layout */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-10 text-sm">
        <div className="flex justify-between items-center border-b-2 border-primary pb-6 mb-8">
          <Logo size="lg" />
          <div className="text-end">
            <h2 className="text-lg font-bold">{isAr ? 'تفاصيل الطلب' : 'Application Details'}</h2>
            <p className="text-xs opacity-40">#{app.id?.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 mb-8">
          <PrintSection title={isAr ? 'بيانات المتقدم' : 'Applicant'}>
            <PrintRow label={isAr ? 'الاسم' : 'Name'} value={app.applicantName} />
            <PrintRow label={isAr ? 'الجوال' : 'Phone'} value={app.applicantPhone} />
            <PrintRow label={isAr ? 'البريد' : 'Email'} value={app.applicantEmail} />
          </PrintSection>
          <PrintSection title={isAr ? 'معلومات المنشأة' : 'Company'}>
            <PrintRow label={isAr ? 'الاسم' : 'Name'} value={app.companyName} />
            <PrintRow label={isAr ? 'السجل' : 'Registry'} value={app.commercialRegistryNumber} />
            <PrintRow label={isAr ? 'عمر السجل' : 'Age'} value={`${app.registryAgeYears} ${isAr ? 'سنة' : 'yrs'}`} />
          </PrintSection>
          <PrintSection title={isAr ? 'المعلومات المالية' : 'Financial'} className="col-span-2">
            <div className="grid grid-cols-3 gap-6">
              <PrintRow label={isAr ? 'الدخل السنوي' : 'Annual'} value={`${app.approximateAnnualIncome} ${t.common.currency}`} />
              <PrintRow label={isAr ? 'البنك' : 'Bank'} value={app.bankName} />
              <PrintRow label={isAr ? 'الحالة' : 'Status'} value={t.admin.status[app.applicationStatus as keyof typeof t.admin.status] || app.applicationStatus} />
            </div>
          </PrintSection>
        </div>
        {app.hasObligations && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
            <h3 className="font-bold text-amber-700 mb-3">{isAr ? 'الالتزامات القائمة' : 'Existing Obligations'}</h3>
            <div className="grid grid-cols-3 gap-4">
              <PrintRow label={isAr ? 'جهة التمويل' : 'Entity'} value={app.fundingEntity} />
              <PrintRow label={isAr ? 'الإجمالي' : 'Total'} value={`${app.totalObligation} ${t.common.currency}`} />
              <PrintRow label={isAr ? 'المتبقي' : 'Remaining'} value={`${app.remaining} ${t.common.currency}`} />
            </div>
          </div>
        )}
        <div className="mt-12 pt-6 border-t flex justify-between opacity-30 text-xs">
          <span>© {isAr ? 'كويك ديل للحلول المالية' : 'Quick Deal Finance Solutions'}</span>
          <span>{new Date().toLocaleString()}</span>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row print:hidden">
        <AdminSidebar />
        <main className="flex-grow p-6 md:p-8 space-y-6">
          {/* Back + title */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-9 w-9">
              <BackIcon className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-headline text-2xl font-bold text-primary truncate">{app.companyName}</h1>
              <p className="text-xs text-muted-foreground">#{app.id?.substring(0, 8).toUpperCase()}</p>
            </div>
            <Badge className={cn('px-4 py-1.5 rounded-full text-sm font-semibold border', statusColors[app.applicationStatus])}>
              {t.admin.status[app.applicationStatus as keyof typeof t.admin.status] || app.applicationStatus}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left — main info */}
            <div className="lg:col-span-2 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Applicant */}
                <InfoCard icon={User} title={isAr ? 'بيانات المتقدم' : 'Applicant'}>
                  <InfoRow label={isAr ? 'الاسم' : 'Name'} value={app.applicantName} />
                  <InfoRow label={isAr ? 'الجوال' : 'Phone'} value={app.applicantPhone} />
                  <InfoRow label={isAr ? 'البريد' : 'Email'} value={app.applicantEmail} />
                </InfoCard>

                {/* Company */}
                <InfoCard icon={Building2} title={isAr ? 'معلومات المنشأة' : 'Company'}>
                  <InfoRow label={isAr ? 'الاسم' : 'Name'} value={app.companyName} />
                  <InfoRow label={isAr ? 'السجل' : 'Registry'} value={app.commercialRegistryNumber} />
                  <InfoRow label={isAr ? 'عمر السجل' : 'Age'} value={`${app.registryAgeYears} ${isAr ? 'سنة' : 'yrs'}`} />
                </InfoCard>

                {/* Financial */}
                <InfoCard icon={Wallet} title={isAr ? 'المعلومات المالية' : 'Financial'} className="md:col-span-2">
                  <div className="grid grid-cols-2 gap-x-8">
                    <InfoRow label={isAr ? 'الدخل اليومي' : 'Daily Income'} value={`${app.approximateDailyIncome?.toLocaleString()} ${t.common.currency}`} />
                    <InfoRow label={isAr ? 'الدخل السنوي' : 'Annual Income'} value={`${app.approximateAnnualIncome?.toLocaleString()} ${t.common.currency}`} />
                    <InfoRow label={isAr ? 'البنك' : 'Bank'} value={app.bankName} />
                    <InfoRow label={isAr ? 'تاريخ التقديم' : 'Submitted'} value={new Date(app.submissionDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-SA')} />
                  </div>
                </InfoCard>

                {/* Obligations */}
                {app.hasObligations && (
                  <InfoCard icon={ShieldAlert} title={isAr ? 'الالتزامات القائمة' : 'Obligations'} className="md:col-span-2" accent>
                    <div className="grid grid-cols-3 gap-4">
                      <InfoRow label={isAr ? 'جهة التمويل' : 'Entity'} value={app.fundingEntity} />
                      <InfoRow label={isAr ? 'الإجمالي' : 'Total'} value={`${app.totalObligation?.toLocaleString()} ${t.common.currency}`} />
                      <InfoRow label={isAr ? 'المتبقي' : 'Remaining'} value={`${app.remaining?.toLocaleString()} ${t.common.currency}`} />
                    </div>
                  </InfoCard>
                )}
              </div>

              {/* Comments */}
              <Card className="border-none shadow-navy-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10 px-6 py-4">
                  <CardTitle className="text-base flex items-center gap-2 text-primary">
                    <MessageSquare className="h-4 w-4" />
                    {isAr ? 'الملاحظات الداخلية' : 'Internal Notes'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="max-h-72 overflow-auto space-y-3">
                    {(!app.comments || app.comments.length === 0) ? (
                      <p className="text-center text-muted-foreground text-sm py-8 opacity-60">
                        {isAr ? 'لا توجد ملاحظات بعد' : 'No notes yet'}
                      </p>
                    ) : app.comments.map((c: any, i: number) => (
                      <div key={i} className="bg-muted/30 rounded-2xl p-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary">{c.authorName}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />{new Date(c.timestamp).toLocaleString(isAr ? 'ar-SA' : 'en-SA')}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{c.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-border">
                    <Input value={commentText} onChange={e => setCommentText(e.target.value)}
                      placeholder={isAr ? 'اكتب ملاحظة...' : 'Write a note...'}
                      className="h-11 rounded-xl flex-1 bg-muted/30"
                      onKeyDown={e => e.key === 'Enter' && handleAddComment()} />
                    <Button onClick={handleAddComment} disabled={submittingComment || !commentText.trim()}
                      className="h-11 w-11 rounded-xl bg-primary p-0 shadow-navy-sm">
                      {submittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right — actions */}
            <div className="space-y-4">
              {/* Status */}
              <Card className="border-none shadow-navy-sm rounded-2xl">
                <CardHeader className="px-5 pt-5 pb-3">
                  <CardTitle className="text-base">{isAr ? 'إجراءات الحالة' : 'Status Actions'}</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{isAr ? 'تعديل حالة الطلب' : 'Update Status'}</Label>
                    <Select disabled={updatingStatus} value={app.applicationStatus} onValueChange={handleStatusChange}>
                      <SelectTrigger className="rounded-xl h-11 border-primary/20 bg-primary/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['Pending', 'Under Review', 'Completed', 'Cancelled'].map(s => (
                          <SelectItem key={s} value={s}>
                            {t.admin.status[s as keyof typeof t.admin.status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {updatingStatus && <p className="text-xs text-muted-foreground">{isAr ? 'جاري التحديث...' : 'Updating...'}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Print */}
              <Card className="border-none shadow-navy-sm rounded-2xl">
                <CardHeader className="px-5 pt-5 pb-3">
                  <CardTitle className="text-base">{isAr ? 'المستندات' : 'Documents'}</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <Button onClick={() => window.print()}
                    className="w-full h-11 rounded-xl bg-gold-DEFAULT text-navy-900 font-bold gap-2 hover:bg-gold-dark shadow-gold-sm">
                    <Printer className="h-4 w-4" />
                    {isAr ? 'طباعة التقرير' : 'Print Report'}
                  </Button>
                </CardContent>
              </Card>

              {/* Quick info */}
              <Card className="border-none shadow-navy-sm rounded-2xl">
                <CardContent className="p-5 space-y-3">
                  <div className="space-y-2 text-sm">
                    <QuickInfoRow label={isAr ? 'الخدمة' : 'Service'} value={app.serviceName || '—'} />
                    <QuickInfoRow label={isAr ? 'الرسوم' : 'Fee'} value={app.feeAmount ? `${app.feeAmount} ${t.common.currency}` : '—'} />
                    <QuickInfoRow label={isAr ? 'الدفع' : 'Payment'} value={t.admin.payment[app.paymentStatus as keyof typeof t.admin.payment] || app.paymentStatus} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <div className="print:hidden"><Footer /></div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, children, className, accent }: any) {
  return (
    <Card className={cn('border-none shadow-navy-sm rounded-2xl overflow-hidden', className)}>
      <CardHeader className={cn('px-5 pt-4 pb-2', accent ? 'bg-amber-50' : 'bg-muted/30')}>
        <CardTitle className={cn('text-sm flex items-center gap-2', accent ? 'text-amber-700' : 'text-primary')}>
          <Icon className="h-4 w-4" />{title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 py-4 space-y-2">{children}</CardContent>
    </Card>
  );
}
function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-end">{value}</span>
    </div>
  );
}
function QuickInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-sm">{value}</span>
    </div>
  );
}
function PrintSection({ title, children, className }: any) {
  return (
    <div className={cn('mb-4', className)}>
      <h3 className="font-bold text-primary border-b pb-2 mb-3">{title}</h3>
      {children}
    </div>
  );
}
function PrintRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm py-0.5"><span className="opacity-50 me-2">{label}:</span><span className="font-medium">{value}</span></p>
  );
}
