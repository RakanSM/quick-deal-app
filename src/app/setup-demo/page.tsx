"use client";

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Logo } from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SetupDemoPage() {
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const createAdminAccount = async () => {
    setLoading(true);
    const email = 'admin@admin.com';
    const password = 'password123';
    const username = 'admin';

    try {
      const { data: signData, error: signErr } = await auth.auth.signUp({ email, password });
      if (signErr) throw signErr;
      const userCredential = signData;
      const uid = userCredential.user.id;
      await db.from('staff_profiles').upsert({
        uid, username, name: 'مدير النظام الرئيسي', email, role: 'admin', phone: '0500000000',
      });
      toast({ title: 'تم إنشاء حساب المدير بنجاح', description: `البريد: ${email} | كلمة المرور: password123` });
      setIsCreated(true);
      await auth.auth.signOut();
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        toast({ title: 'الحساب موجود بالفعل', description: 'يمكنك تسجيل الدخول باستخدام admin@admin.com' });
        setIsCreated(true);
      } else {
        toast({ variant: 'destructive', title: 'خطأ في الإعداد', description: e.message.replace(/Firebase: /g, '') });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Logo size="lg" className="justify-center" />
            <h1 className="font-headline text-3xl font-bold text-primary mt-4">إعداد حساب المدير</h1>
            <p className="text-muted-foreground text-sm">أنشئ حساب المدير الرئيسي للنظام لبدء الاستخدام</p>
          </div>

          <Card className="border-none shadow-navy-lg rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="navy-gradient p-7 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="h-8 w-8 text-gold-DEFAULT" />
              </div>
              <CardTitle className="text-white text-lg font-headline">حساب المدير الرئيسي</CardTitle>
            </div>

            <CardContent className="p-7 space-y-6">
              {/* Credentials display */}
              <div className="bg-muted/40 rounded-2xl p-4 space-y-3 border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">بيانات الدخول</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">البريد الإلكتروني</span>
                    <code className="bg-primary/8 text-primary px-2.5 py-1 rounded-lg text-xs font-bold">admin@admin.com</code>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">كلمة المرور</span>
                    <code className="bg-primary/8 text-primary px-2.5 py-1 rounded-lg text-xs font-bold">password123</code>
                  </div>
                </div>
              </div>

              {!isCreated ? (
                <Button
                  onClick={createAdminAccount}
                  disabled={loading}
                  className="w-full h-13 rounded-2xl bg-primary text-white font-bold text-base shadow-navy-sm gap-2"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <><ShieldCheck className="h-5 w-5" />إنشاء حساب المدير</>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">تم إنشاء الحساب بنجاح</span>
                  </div>
                  <Button asChild className="w-full h-12 rounded-2xl bg-gold-DEFAULT text-navy-900 font-bold gap-2">
                    <Link href="/login">
                      انتقل لصفحة الدخول
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            * هذا الإعداد مخصص لبيئة التجربة فقط. لا تستخدمه في الإنتاج.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
