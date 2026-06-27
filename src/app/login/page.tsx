"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { t, lang } = useLanguage();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const cleanError = (e: any) => {
    const m: string = e?.message || String(e);
    const map: Record<string, string> = {
      'auth/user-not-found': lang === 'ar' ? 'الحساب غير موجود' : 'Account not found',
      'auth/wrong-password': lang === 'ar' ? 'كلمة المرور غير صحيحة' : 'Wrong password',
      'auth/invalid-credential': lang === 'ar' ? 'البيانات غير صحيحة' : 'Invalid credentials',
      'auth/too-many-requests': lang === 'ar' ? 'محاولات كثيرة، حاول لاحقاً' : 'Too many attempts, try later',
    };
    for (const [code, msg] of Object.entries(map)) {
      if (m.includes(code)) return msg;
    }
    return m.replace(/Firebase: /g, '').replace(/Error \(auth\/.*?\)\.?/g, '');
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) return;
    setLoading(true);
    try {
      let email = identifier.trim();
      if (!email.includes('@')) {
        const { data: sp } = await db.from('staff_profiles').select('email').eq('username', email).maybeSingle();
        if (sp?.email) {
          email = sp.email;
        } else {
          const { data: ap } = await db.from('applications').select('applicantEmail').eq('username', email).maybeSingle();
          if (ap?.applicantEmail) {
            email = ap.applicantEmail;
          } else {
            toast({ variant: 'destructive', title: lang === 'ar' ? 'المستخدم غير موجود' : 'User not found' });
            setLoading(false);
            return;
          }
        }
      }
      const { error } = await auth.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: lang === 'ar' ? 'تم تسجيل الدخول' : 'Logged in successfully' });
      router.push('/admin');
    } catch (e: any) {
      toast({ variant: 'destructive', title: lang === 'ar' ? 'خطأ' : 'Error', description: cleanError(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-navy-lg overflow-hidden">
            {/* Header */}
            <div className="navy-gradient p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Lock className="h-8 w-8 text-gold-DEFAULT" />
              </div>
              <h1 className="font-headline text-2xl font-bold text-white">
                {t.admin.login.title}
              </h1>
              <p className="text-white/50 text-sm mt-1">
                {lang === 'ar' ? 'أدخل بياناتك للمتابعة' : 'Enter your credentials to continue'}
              </p>
            </div>

            {/* Form */}
            <div className="p-8 space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t.admin.login.email}</Label>
                <Input
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder={lang === 'ar' ? 'اسم المستخدم أو البريد الإلكتروني' : 'Username or email'}
                  className="h-12 rounded-xl border-border/60 focus-visible:ring-primary/30 bg-muted/30"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">{t.admin.login.password}</Label>
                <div className="relative">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-border/60 focus-visible:ring-primary/30 bg-muted/30 pe-12"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleLogin}
                disabled={loading || !identifier.trim() || !password.trim()}
                className="w-full h-12 rounded-xl bg-primary text-white font-bold text-base shadow-navy-sm hover:bg-navy-800 transition-all mt-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t.admin.login.submit}
              </Button>

              <div className="text-center pt-2">
                <p className="text-muted-foreground text-xs">
                  {lang === 'ar'
                    ? 'هذه البوابة مخصصة لموظفي كويك ديل فقط'
                    : 'This portal is for Quick Deal staff only'}
                </p>
              </div>
            </div>
          </div>

          {/* Logo below */}
          <div className="flex justify-center mt-8 opacity-50">
            <Logo size="sm" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
