"use client";

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useFirestore, useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Loader2, User, Building2, Wallet, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const stepIcons = [User, Building2, Wallet];

export default function ApplyPage() {
  const { t, lang } = useLanguage();
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const isAr = lang === 'ar';

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '', applicantName: '', applicantPhone: '', applicantEmail: '',
    applicantPassword: '', applicantRole: 'owner', companyName: '',
    commercialRegistryNumber: '', registryTransferredLast6Months: 'no',
    registryAgeYears: '', approximateDailyIncome: '', approximateAnnualIncome: '',
    bankName: '', hasObligations: 'no', totalObligation: '', fundingEntity: '', remaining: '',
  });

  const set = (field: string, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const cleanError = (e: any) => {
    const m: string = e?.message || String(e);
    if (m.includes('email-already-in-use')) return isAr ? 'البريد الإلكتروني مستخدم بالفعل' : 'Email already in use';
    if (m.includes('weak-password')) return isAr ? 'كلمة المرور ضعيفة (6 أحرف على الأقل)' : 'Weak password (min 6 chars)';
    return m.replace(/Firebase: /g, '');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: ad, error: ae } = await auth.auth.signUp({ email: formData.applicantEmail, password: formData.applicantPassword });
      if (ae) throw ae;
      const uid = ad?.user?.id ?? '';
      const appId = crypto.randomUUID();
      const { error: ie } = await db.from('applications').insert({
        id: appId, applicantUid: uid,
        username: formData.username,
        applicantName: formData.applicantName,
        applicantPhone: formData.applicantPhone,
        applicantEmail: formData.applicantEmail,
        applicantRole: formData.applicantRole,
        companyName: formData.companyName,
        commercialRegistryNumber: formData.commercialRegistryNumber,
        registryAgeYears: parseFloat(formData.registryAgeYears) || 0,
        registryTransferredLast6Months: formData.registryTransferredLast6Months === 'yes',
        approximateDailyIncome: parseFloat(formData.approximateDailyIncome) || 0,
        approximateAnnualIncome: parseFloat(formData.approximateAnnualIncome) || 0,
        bankName: formData.bankName,
        hasObligations: formData.hasObligations === 'yes',
        totalObligation: parseFloat(formData.totalObligation) || 0,
        fundingEntity: formData.fundingEntity,
        remaining: parseFloat(formData.remaining) || 0,
        applicationStatus: 'Pending',
        paymentStatus: 'Unpaid',
        submissionDate: new Date().toISOString(),
        comments: [],
      });
      if (insertErr) throw insertErr;
      setStep(4);
    } catch (e: any) {
      toast({ variant: 'destructive', title: isAr ? 'خطأ' : 'Error', description: cleanError(e) });
    } finally {
      setSubmitting(false);
    }
  };

  const NextIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Progress header */}
          {step < 4 && (
            <div className="mb-8">
              <h1 className="font-headline text-3xl font-bold text-primary text-center mb-6">{t.apply.title}</h1>

              {/* Step indicators */}
              <div className="flex items-center justify-center gap-0">
                {t.apply.steps.map((label, i) => {
                  const n = i + 1;
                  const Icon = stepIcons[i];
                  const active = step === n;
                  const done = step > n;
                  return (
                    <div key={i} className="flex items-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                          done ? 'bg-primary border-primary text-white' :
                          active ? 'bg-gold-DEFAULT border-gold-DEFAULT text-white' :
                          'bg-white border-border text-muted-foreground'
                        )}>
                          {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                        </div>
                        <span className={cn('text-[10px] font-medium hidden sm:block', active ? 'text-gold-DEFAULT' : done ? 'text-primary' : 'text-muted-foreground')}>
                          {label}
                        </span>
                      </div>
                      {i < 2 && (
                        <div className={cn('w-16 sm:w-24 h-0.5 mx-1 mb-6', done ? 'bg-primary' : 'bg-border')} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-navy-lg overflow-hidden">
            {/* Step header bar */}
            {step < 4 && (
              <div className="navy-gradient px-8 py-5">
                <h2 className="text-white font-bold text-lg">{t.apply.steps[step - 1]}</h2>
                <p className="text-white/50 text-xs mt-0.5">
                  {isAr ? `الخطوة ${step} من 3` : `Step ${step} of 3`}
                </p>
              </div>
            )}

            <div className="p-8">
              {/* Step 1 — Personal */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldGroup label={t.apply.username}>
                      <Input value={formData.username} onChange={e => set('username', e.target.value)} placeholder="ahmed_90" className="h-11 rounded-xl" />
                    </FieldGroup>
                    <FieldGroup label={t.apply.password}>
                      <Input type="password" value={formData.applicantPassword} onChange={e => set('applicantPassword', e.target.value)} className="h-11 rounded-xl" />
                    </FieldGroup>
                  </div>
                  <FieldGroup label={t.apply.personal.name}>
                    <Input value={formData.applicantName} onChange={e => set('applicantName', e.target.value)} className="h-11 rounded-xl" />
                  </FieldGroup>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldGroup label={t.apply.personal.email}>
                      <Input type="email" value={formData.applicantEmail} onChange={e => set('applicantEmail', e.target.value)} className="h-11 rounded-xl" />
                    </FieldGroup>
                    <FieldGroup label={t.apply.personal.phone}>
                      <Input value={formData.applicantPhone} onChange={e => set('applicantPhone', e.target.value)} placeholder="05XXXXXXXX" className="h-11 rounded-xl" />
                    </FieldGroup>
                  </div>
                  <FieldGroup label={t.apply.personal.role}>
                    <RadioGroup value={formData.applicantRole} onValueChange={v => set('applicantRole', v)} className="flex gap-6 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <RadioGroupItem value="owner" /><span className="text-sm">{t.apply.personal.owner}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <RadioGroupItem value="employee" /><span className="text-sm">{t.apply.personal.employee}</span>
                      </label>
                    </RadioGroup>
                  </FieldGroup>
                </div>
              )}

              {/* Step 2 — Company */}
              {step === 2 && (
                <div className="space-y-5">
                  <FieldGroup label={t.apply.company.name}>
                    <Input value={formData.companyName} onChange={e => set('companyName', e.target.value)} className="h-11 rounded-xl" />
                  </FieldGroup>
                  <FieldGroup label={t.apply.company.registry}>
                    <Input value={formData.commercialRegistryNumber} onChange={e => set('commercialRegistryNumber', e.target.value)} className="h-11 rounded-xl" />
                  </FieldGroup>
                  <FieldGroup label={t.apply.company.registryAge}>
                    <Input type="number" min="0" value={formData.registryAgeYears} onChange={e => set('registryAgeYears', e.target.value)} className="h-11 rounded-xl" />
                  </FieldGroup>
                  <FieldGroup label={t.apply.company.transferred}>
                    <RadioGroup value={formData.registryTransferredLast6Months} onValueChange={v => set('registryTransferredLast6Months', v)} className="flex gap-6 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="yes" /><span className="text-sm">{t.common.yes}</span></label>
                      <label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="no" /><span className="text-sm">{t.common.no}</span></label>
                    </RadioGroup>
                  </FieldGroup>
                </div>
              )}

              {/* Step 3 — Financial */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldGroup label={t.apply.financial.daily}>
                      <Input type="number" value={formData.approximateDailyIncome} onChange={e => set('approximateDailyIncome', e.target.value)} className="h-11 rounded-xl" />
                    </FieldGroup>
                    <FieldGroup label={t.apply.financial.annual}>
                      <Input type="number" value={formData.approximateAnnualIncome} onChange={e => set('approximateAnnualIncome', e.target.value)} className="h-11 rounded-xl" />
                    </FieldGroup>
                  </div>
                  <FieldGroup label={t.apply.financial.bank}>
                    <Input value={formData.bankName} onChange={e => set('bankName', e.target.value)} className="h-11 rounded-xl" />
                  </FieldGroup>

                  <div className="border border-border rounded-2xl p-5 space-y-4 bg-muted/20">
                    <FieldGroup label={t.apply.financial.hasObligations}>
                      <RadioGroup value={formData.hasObligations} onValueChange={v => set('hasObligations', v)} className="flex gap-6 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="yes" /><span className="text-sm">{t.common.yes}</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="no" /><span className="text-sm">{t.common.no}</span></label>
                      </RadioGroup>
                    </FieldGroup>

                    {formData.hasObligations === 'yes' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                        <FieldGroup label={t.apply.financial.totalObligation}>
                          <Input type="number" value={formData.totalObligation} onChange={e => set('totalObligation', e.target.value)} className="h-11 rounded-xl" />
                        </FieldGroup>
                        <FieldGroup label={t.apply.financial.fundingEntity}>
                          <Input value={formData.fundingEntity} onChange={e => set('fundingEntity', e.target.value)} className="h-11 rounded-xl" />
                        </FieldGroup>
                        <FieldGroup label={t.apply.financial.remaining} className="sm:col-span-2">
                          <Input type="number" value={formData.remaining} onChange={e => set('remaining', e.target.value)} className="h-11 rounded-xl" />
                        </FieldGroup>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Success */}
              {step === 4 && (
                <div className="text-center py-10 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-primary">{t.apply.success}</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    {isAr ? 'سيتم مراجعة طلبك من قبل فريقنا والتواصل معك في أقرب وقت.' : 'Our team will review your application and contact you soon.'}
                  </p>
                  <Button onClick={() => window.location.href = '/portal'} className="mt-4 rounded-full bg-primary text-white font-bold px-8 h-12">
                    {isAr ? 'اذهب لبوابتي' : 'Go to My Portal'}
                  </Button>
                </div>
              )}

              {/* Nav buttons */}
              {step < 4 && (
                <div className="flex gap-3 mt-8 pt-6 border-t border-border">
                  {step > 1 && (
                    <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1 h-12 rounded-xl gap-2">
                      {isAr ? <NextIcon className="h-4 w-4 rotate-180" /> : <ChevronLeft className="h-4 w-4" />}
                      {t.apply.prev}
                    </Button>
                  )}
                  <Button
                    onClick={() => step === 3 ? handleSubmit() : setStep(s => s + 1)}
                    disabled={submitting}
                    className="flex-1 h-12 rounded-xl bg-primary text-white font-bold gap-2 shadow-navy-sm"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : step === 3 ? t.apply.submit : t.apply.next}
                    {!submitting && step < 3 && <NextIcon className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FieldGroup({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium text-foreground/80">{label}</Label>
      {children}
    </div>
  );
}
