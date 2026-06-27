"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import { Logo } from './Logo';
import { useUser, useSupabase } from '@/supabase';
import { cn } from '@/lib/utils';
import { FileText, Users, ShieldCheck, BarChart3, LogOut, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AdminSidebar() {
  const { t, lang } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabase();
  const { user } = useUser();
  const [profile, setProfile] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('staff_profiles')
      .select('name, role')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = [
    { href: '/admin', label: lang === 'ar' ? 'الطلبات' : 'Applications', icon: FileText, exact: true },
    { href: '/admin/analytics', label: lang === 'ar' ? 'الإحصاءات' : 'Analytics', icon: BarChart3 },
    { href: '/admin/staff', label: lang === 'ar' ? 'فريق العمل' : 'Staff', icon: Users },
    { href: '/admin/access-requests', label: lang === 'ar' ? 'طلبات الوصول' : 'Access Requests', icon: ShieldCheck },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname?.startsWith(href);
  };

  return (
    <aside className="w-64 min-h-screen bg-navy-900 text-white flex flex-col print:hidden shrink-0">
      <div className="p-5 border-b border-white/10">
        <Logo variant="white" size="sm" />
      </div>
      {profile && (
        <div className="mx-3 mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gold-DEFAULT/20 border border-gold-DEFAULT/30 flex items-center justify-center text-gold-DEFAULT text-xs font-bold">
              {profile.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile.name}</p>
              <p className="text-[10px] text-white/40 capitalize">
                {profile.role === 'admin'
                  ? (lang === 'ar' ? 'مدير النظام' : 'Administrator')
                  : (lang === 'ar' ? 'موظف' : 'Employee')}
              </p>
            </div>
          </div>
        </div>
      )}
      <nav className="flex-1 p-3 mt-2 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group',
                active ? 'bg-gold-DEFAULT/15 text-gold-DEFAULT border border-gold-DEFAULT/20'
                       : 'text-white/60 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className={cn('h-4 w-4 flex-shrink-0', active ? 'text-gold-DEFAULT' : 'text-white/40 group-hover:text-white/70')} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className={cn('h-3.5 w-3.5 text-gold-DEFAULT/60', lang === 'ar' ? 'rotate-180' : '')} />}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="h-4 w-4" />
          {t.nav.logout}
        </button>
      </div>
    </aside>
  );
}
