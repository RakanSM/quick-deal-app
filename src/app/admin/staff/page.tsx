"use client";

import { sbCollection, sbDoc, useAuth, useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdminSidebar } from '@/components/AdminSidebar';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Trash2, Pencil, Loader2, ShieldCheck, User, Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const roleColors: Record<string, string> = {
  admin: 'bg-primary/10 text-primary border-primary/20',
  employee: 'bg-gold-DEFAULT/10 text-gold-dark border-gold-DEFAULT/20',
};

export default function StaffPage() {
  const { t, lang } = useLanguage();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const isAr = lang === 'ar';

  const profileRef = useMemoFirebase(() => sbDoc('staff_profiles', user?.id), [user?.id]);
  const { data: myProfile } = useDoc(profileRef);
  const isAdmin = myProfile?.role === 'admin';

  const staffRef = useMemoFirebase(() => user ? sbCollection('staff_profiles') : null, [user?.id]);
  const { data: staffList, isLoading } = useCollection(staffRef);

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { name: '', email: '', phone: '', username: '', password: '', role: 'employee' };
  const [form, setForm] = useState(emptyForm);
  const setF = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const cleanError = (e: any) => {
    const m = String(e?.message || e);
    if (m.includes('email-already-in-use')) return isAr ? 'البريد مستخدم بالفعل' : 'Email already in use';
    return m;
  };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) return;
    setSaving(true);
    try {
      const { data: sd, error: se } = await auth.auth.signUp({ email: form.email, password: form.password });
      if (se) throw se;
      const nid = sd?.user?.id ?? '';
      const { error: de } = await db.from('staff_profiles').insert({ id: nid, name: form.name, email: form.email, phone: form.phone, username: form.username, role: form.role });
      if (de) throw de;
      toast({ title: isAr ? 'تم إضافة العضو' : 'Member added' });
      setForm(emptyForm); setShowAdd(false);
    } catch (e: any) {
      toast({ variant: 'destructive', title: isAr ? 'خطأ' : 'Error', description: cleanError(e) });
    } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const { error: err } = await db.from('staff_profiles').update({ name: form.name, phone: form.phone, role: form.role }).eq('id', editTarget.id);
      if (err) throw err;
      toast({ title: isAr ? 'تم التحديث' : 'Updated' });
      setEditTarget(null);
    } catch (e: any) {
      toast({ variant: 'destructive', title: isAr ? 'خطأ' : 'Error', description: cleanError(e) });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const { error: err } = await db.from('staff_profiles').delete().eq('id', deleteTarget.id);
      if (err) throw err;
      toast({ title: isAr ? 'تم الحذف' : 'Deleted' });
      setDeleteTarget(null);
    } catch (e: any) {
      toast({ variant: 'destructive', title: isAr ? 'خطأ' : 'Error', description: cleanError(e) });
    } finally { setSaving(false); }
  };

  const openEdit = (member: any) => {
    setForm({ name: member.name, email: member.email, phone: member.phone || '', username: member.username || '', password: '', role: member.role });
    setEditTarget(member);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-grow flex flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-grow p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline text-2xl font-bold text-primary">{t.admin.staff.title}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {isAr ? `${staffList?.length || 0} عضو في الفريق` : `${staffList?.length || 0} team members`}
              </p>
            </div>
            {isAdmin && (
              <Button onClick={() => { setForm(emptyForm); setShowAdd(true); }}
                className="rounded-full bg-primary text-white font-bold gap-2 h-10 px-5">
                <UserPlus className="h-4 w-4" />
                {t.admin.staff.addMember}
              </Button>
            )}
          </div>

          {/* Staff grid */}
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
          ) : (!staffList || staffList.length === 0) ? (
            <div className="text-center py-20 text-muted-foreground">{t.admin.staff.noStaff}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {staffList.map((member: any) => (
                <Card key={member.id} className="border-none shadow-navy-sm rounded-2xl p-5 hover:shadow-navy-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                        {member.name?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.username && `@${member.username}`}</p>
                      </div>
                    </div>
                    <Badge className={cn('text-xs px-2.5 py-0.5 rounded-full border font-medium flex-shrink-0', roleColors[member.role])}>
                      {member.role === 'admin' ? (isAr ? 'مدير' : 'Admin') : (isAr ? 'موظف' : 'Employee')}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0 text-primary/60" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0 text-primary/60" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>

                  {isAdmin && member.id !== user?.id && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                      <Button size="sm" variant="outline" onClick={() => openEdit(member)}
                        className="flex-1 h-8 rounded-lg text-xs gap-1.5">
                        <Pencil className="h-3 w-3" />{t.common.edit}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDeleteTarget(member)}
                        className="h-8 w-8 rounded-lg border-red-200 text-red-500 hover:bg-red-50 p-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />

      {/* Add dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-primary">{t.admin.staff.addMember}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label={t.common.name}><Input value={form.name} onChange={e => setF('name', e.target.value)} className="h-11 rounded-xl" /></Field>
            <Field label={t.common.email}><Input type="email" value={form.email} onChange={e => setF('email', e.target.value)} className="h-11 rounded-xl" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t.apply.username}><Input value={form.username} onChange={e => setF('username', e.target.value)} className="h-11 rounded-xl" /></Field>
              <Field label={t.apply.password}><Input type="password" value={form.password} onChange={e => setF('password', e.target.value)} className="h-11 rounded-xl" /></Field>
            </div>
            <Field label={t.common.phone}><Input value={form.phone} onChange={e => setF('phone', e.target.value)} className="h-11 rounded-xl" /></Field>
            <Field label={t.admin.staff.role}>
              <Select value={form.role} onValueChange={v => setF('role', v)}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{isAr ? 'مدير' : 'Admin'}</SelectItem>
                  <SelectItem value="employee">{isAr ? 'موظف' : 'Employee'}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">{t.common.cancel}</Button>
            <Button onClick={handleAdd} disabled={saving} className="rounded-xl bg-primary font-bold gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}{t.common.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-primary">{t.common.edit}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label={t.common.name}><Input value={form.name} onChange={e => setF('name', e.target.value)} className="h-11 rounded-xl" /></Field>
            <Field label={t.common.phone}><Input value={form.phone} onChange={e => setF('phone', e.target.value)} className="h-11 rounded-xl" /></Field>
            <Field label={t.admin.staff.role}>
              <Select value={form.role} onValueChange={v => setF('role', v)}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{isAr ? 'مدير' : 'Admin'}</SelectItem>
                  <SelectItem value="employee">{isAr ? 'موظف' : 'Employee'}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditTarget(null)} className="rounded-xl">{t.common.cancel}</Button>
            <Button onClick={handleEdit} disabled={saving} className="rounded-xl bg-primary font-bold gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}{t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">{isAr ? 'تأكيد الحذف' : 'Confirm Delete'}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            {isAr ? `هل أنت متأكد من حذف ${deleteTarget?.name}؟` : `Are you sure you want to delete ${deleteTarget?.name}?`}
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-xl">{t.common.cancel}</Button>
            <Button onClick={handleDelete} disabled={saving} className="rounded-xl bg-destructive text-white font-bold gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}{t.common.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}
