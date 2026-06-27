"use client";

import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import { Logo } from './Logo';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const { t, lang } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Logo variant="white" size="md" />
            <p className="text-white/60 text-sm leading-relaxed max-w-sm mt-4">
              {lang === 'ar'
                ? 'نحن شريكك المالي الموثوق. نقدم حلولاً تمويلية متكاملة للمنشآت التجارية في المملكة العربية السعودية.'
                : 'Your trusted financial partner. We provide comprehensive financing solutions for businesses across Saudi Arabia.'}
            </p>
            <div className="flex gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold-DEFAULT/30 transition-colors cursor-pointer">
                <span className="text-xs font-bold">𝕏</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold-DEFAULT/30 transition-colors cursor-pointer">
                <span className="text-xs font-bold">in</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold-DEFAULT/30 transition-colors cursor-pointer">
                <span className="text-xs font-bold">ig</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-gold-DEFAULT font-bold text-sm uppercase tracking-widest mb-5">
              {lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: t.nav.home },
                { href: '/apply', label: t.nav.apply },
                { href: '/portal', label: t.nav.portal },
                { href: '/login', label: t.nav.login },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/60 hover:text-gold-DEFAULT text-sm transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-DEFAULT/50" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gold-DEFAULT font-bold text-sm uppercase tracking-widest mb-5">
              {lang === 'ar' ? 'تواصل معنا' : 'Contact'}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-white/60 text-sm">
                <Phone className="h-4 w-4 mt-0.5 text-gold-DEFAULT flex-shrink-0" />
                <span dir="ltr">+966 5X XXX XXXX</span>
              </li>
              <li className="flex items-start gap-2.5 text-white/60 text-sm">
                <Mail className="h-4 w-4 mt-0.5 text-gold-DEFAULT flex-shrink-0" />
                <span>info@quickdeal.sa</span>
              </li>
              <li className="flex items-start gap-2.5 text-white/60 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-gold-DEFAULT flex-shrink-0" />
                <span>{lang === 'ar' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/40 text-xs">
            © {year} {lang === 'ar' ? 'كويك ديل للحلول المالية. جميع الحقوق محفوظة.' : 'Quick Deal Finance Solutions. All rights reserved.'}
          </p>
          <div className="flex items-center gap-4 text-white/40 text-xs">
            <span className="hover:text-white/60 cursor-pointer transition-colors">
              {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </span>
            <span className="w-px h-3 bg-white/20" />
            <span className="hover:text-white/60 cursor-pointer transition-colors">
              {lang === 'ar' ? 'الشروط والأحكام' : 'Terms of Service'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
