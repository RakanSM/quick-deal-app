"use client";

import { sbCollection, sbDoc, useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { useLanguage } from '@/components/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdminSidebar } from '@/components/AdminSidebar';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, ShieldX, Clock, CheckCircle2, XCircle, User, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  pending:  { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  approved: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle2 },
  rejected: { color: 'text-red-700',   bg: 'bg-red-50 border-red-200',     icon: XCircle },
};

export default function AccessRequestsPage() {
  const { t, lang } = useLanguage();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const isAr = lang === 'ar';

  const profileRef = useMemoFirebase(() => sbDoc('staff_profiles', user?.id), [user?.id]);
  const { data: myProfile } = useDoc(profileRef);
  const isAdmin = myProfile?.role === 'admin';

  const reqRef = useMemoFirebase(() => user ? sbCollection('access_requests') : null, [user?.id]);
  const { data: requests, isLoading } = useCollection(reqRef);

  const [processing, setProcessing] = useState<string | null>(null);

  const handleDecision = async (id: string, decision: 'approved' | 'rejected') => {
    setProcessing(id);
    try {
      const { error: err } = await db.from('access_requests').update({ status: decision }).eq('id', id);
      if (err) throw err;
      toast({
        title: decision === 'approved'
          ? (isAr ? 'تم القبول' : 'Approved')
          : (isAr ? 'تم الرفض' : 'Rejected'),
      });
    } catch (e: any) {
      toast({ variant: 'destructive', title: isAr ? 'خطأ' : 'Error', description: String(e?.message || e) });
    } finally {
      setProcessing(null);
    }
  };

  const pendingCount = requests?.filter(r => r.status === 'pending').length || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-grow flex flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-grow p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-headline text-2xl font-bold text-primary">{t.admin.accessReq.title}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {isAr
                  ? `${pendingCount} طلب بانتظار المراجعة`
                  : `${pendingCount} request${pendingCount !== 1 ? 's' : ''} awaiting review`}
              </p>
            </div>
            {pendingCount > 0 && (
              <Badge className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-bold">
                {pendingCount}
              </Badge>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {(['pending', 'approved', 'rejected'] as const).map(s => {
              const cfg = statusConfig[s];
              const count = requests?.filter(r => r.status === s).length || 0;
              return (
                <Card key={s} className="border-none shadow-navy-sm rounded-2xl p-4 flex items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center border', cfg.bg)}>
                    <cfg.icon className={cn('h-4 w-4', cfg.color)} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground">
                      {s === 'pending'  ? (isAr ? 'معلّق' : 'Pending')
                      : s === 'approved' ? (isAr ? 'مقبول' : 'Approved')
                      :                   (isAr ? 'مرفوض' : 'Rejected')}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* List */}
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
          ) : (!requests || requests.length === 0) ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">{t.admin.accessReq.noRequests}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests
                .sort((a: any, b: any) => (a.status === 'pending' ? -1 : 1))
                .map((req: any) => {
                  const cfg = statusConfig[req.status] || statusConfig.pending;
                  const isPending = req.status === 'pending';
                  return (
                    <Card key={req.id} className={cn(
                      'border-none shadow-navy-sm rounded-2xl p-5 transition-all',
                      isPending ? 'border-l-4 border-l-amber-400' : ''
                    )}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground">{req.employeeName}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {t.admin.accessReq.requested}{' '}
                              <span className="font-medium text-primary">{req.companyName}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(req.requestDate).toLocaleString(isAr ? 'ar-SA' : 'en-SA')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={cn('px-3 py-1 rounded-full text-xs font-medium border', cfg.bg, cfg.color)}>
                            {req.status === 'pending'  ? (isAr ? 'معلّق' : 'Pending')
                            : req.status === 'approved' ? (isAr ? 'مقبول' : 'Approved')
                            :                            (isAr ? 'مرفوض' : 'Rejected')}
                          </Badge>

                          {isPending && isAdmin && (
                            <div className="flex gap-1.5">
                              <Button size="sm"
                                onClick={() => handleDecision(req.id, 'approved')}
                                disabled={processing === req.id}
                                className="h-8 px-3 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-bold gap-1">
                                {processing === req.id
                                  ? <Loader2 className="h-3 w-3 animate-spin" />
                                  : <CheckCircle2 className="h-3.5 w-3.5" />}
                                {t.admin.accessReq.approve}
                              </Button>
                              <Button size="sm"
                                onClick={() => handleDecision(req.id, 'rejected')}
                                disabled={processing === req.id}
                                variant="outline"
                                className="h-8 px-3 rounded-lg border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold gap-1">
                                <XCircle className="h-3.5 w-3.5" />
                                {t.admin.accessReq.reject}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
