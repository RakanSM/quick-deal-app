"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { CheckCircle2, Loader2, AlertCircle, Copy, Check } from 'lucide-react';

const ADMINS = [
  { id: '720f582b-e265-46f0-9d22-90a3e6d2d8a3', username: 'admin',   name: 'مدير النظام',    email: 'admin@quickdealsa.com',   role: 'admin', phone: '' },
  { id: 'dd1ce13d-b947-41d3-8f95-a8e2cf4e322d', username: 'rakan',   name: 'راكان الديحاني', email: 'rakan@quickdealsa.com',   role: 'admin', phone: '0531944957' },
  { id: '6597940a-87d7-4b09-8286-63d78865f335', username: 'manager', name: 'مدير العمليات',  email: 'manager@quickdealsa.com', role: 'admin', phone: '' },
];

const CREDENTIALS = [
  { email: 'admin@quickdealsa.com',   password: 'Admin@QD2024',   name: 'مدير النظام',    username: 'admin' },
  { email: 'rakan@quickdealsa.com',   password: 'Rakan@QD2024',   name: 'راكان الديحاني', username: 'rakan' },
  { email: 'manager@quickdealsa.com', password: 'Manager@QD2024', name: 'مدير العمليات',  username: 'manager' },
];

const SCHEMA_SQL = `-- Run this in Supabase SQL Editor
create extension if not exists "uuid-ossp";

create table if not exists public."staff_profiles" (
  "id" uuid primary key references auth.users(id) on delete cascade,
  "username" text unique, "name" text not null, "email" text not null,
  "phone" text, "role" text not null default 'admin',
  "created_at" timestamptz default now()
);
create table if not exists public."applications" (
  "id" uuid primary key default uuid_generate_v4(),
  "applicantUid" uuid, "username" text, "applicantName" text not null,
  "applicantPhone" text, "applicantEmail" text, "applicantRole" text,
  "companyName" text not null, "commercialRegistryNumber" text,
  "registryAgeYears" numeric default 0,
  "registryTransferredLast6Months" boolean default false,
  "approximateDailyIncome" numeric default 0, "approximateAnnualIncome" numeric default 0,
  "bankName" text, "hasObligations" boolean default false,
  "totalObligation" numeric default 0, "fundingEntity" text, "remaining" numeric default 0,
  "applicationStatus" text not null default 'Pending',
  "paymentStatus" text not null default 'Unpaid',
  "feeAmount" numeric, "serviceName" text,
  "comments" jsonb default '[]'::jsonb, "submissionDate" timestamptz default now()
);
create table if not exists public."access_requests" (
  "id" uuid primary key default uuid_generate_v4(),
  "employeeId" uuid, "employeeName" text not null, "applicationId" uuid,
  "companyName" text, "status" text not null default 'pending',
  "requestDate" timestamptz default now()
);
alter table public."staff_profiles" enable row level security;
alter table public."applications" enable row level security;
alter table public."access_requests" enable row level security;
create policy "sp_all" on public."staff_profiles" for all using (true) with check (true);
create policy "apps_all" on public."applications" for all using (true) with check (true);
create policy "ar_all" on public."access_requests" for all using (true) with check (true);`;

export default function SetupPage() {
  const [step, setStep] = useState<'idle'|'running'|'done'|'error'>('idle');
  const [results, setResults] = useState<{name:string;ok:boolean;msg:string}[]>([]);
  const [copied, setCopied] = useState(false);
  const [tablesOk, setTablesOk] = useState<boolean|null>(null);

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const checkTables = async () => {
    const { error } = await sb.from('staff_profiles').select('id').limit(1);
    return !error;
  };

  const handleSetup = async () => {
    setStep('running');
    setResults([]);

    // 1. Check if tables exist
    const tablesExist = await checkTables();
    setTablesOk(tablesExist);

    if (!tablesExist) {
      setStep('error');
      return;
    }

    // 2. Insert admin profiles via service-role API route
    const res = await fetch('/api/setup', { method: 'POST' }).then(r=>r.json()).catch(()=>null);
    
    // 3. Show results from direct upsert
    const sbAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const newResults: {name:string;ok:boolean;msg:string}[] = [];
    for (const admin of ADMINS) {
      const { error } = await sbAdmin.from('staff_profiles').upsert(admin, { onConflict: 'id' });
      newResults.push({ name: admin.name, ok: !error, msg: error?.message || '✅ تم' });
    }
    setResults(newResults);
    setStep(newResults.every(r=>r.ok) ? 'done' : 'error');
  };

  const copySQL = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#0F2C5C] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0F2C5C] px-8 py-6 flex items-center gap-3">
          <Logo variant="white" size="sm" />
          <div>
            <h1 className="text-white font-bold text-lg">إعداد النظام</h1>
            <p className="text-white/60 text-xs">Quick Deal — تهيئة قاعدة البيانات والحسابات</p>
          </div>
        </div>

        <div className="p-8 space-y-6">

          {/* Step 1: SQL */}
          <div className="border border-amber-200 bg-amber-50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">1</span>
                <p className="font-bold text-amber-800 text-sm">شغّل الـ SQL في Supabase</p>
              </div>
              <a href="https://supabase.com/dashboard/project/tnksdiyqooerwtcnujwx/sql/new"
                 target="_blank"
                 className="text-xs text-amber-700 underline font-medium">افتح SQL Editor ←</a>
            </div>
            <p className="text-xs text-amber-700 mb-3">انسخ الـ SQL التالي وشغّله مرة وحدة لإنشاء الجداول:</p>
            <div className="relative">
              <pre className="text-[9px] bg-amber-100 rounded-xl p-3 overflow-x-auto text-amber-900 leading-relaxed max-h-32">{SCHEMA_SQL.slice(0,300)}...</pre>
              <button onClick={copySQL}
                className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-amber-600 transition-colors">
                {copied ? <><Check className="h-3 w-3"/>تم النسخ</> : <><Copy className="h-3 w-3"/>نسخ الكل</>}
              </button>
            </div>
          </div>

          {/* Step 2: Create Admins */}
          <div className="border border-[#0F2C5C]/20 bg-slate-50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-[#0F2C5C] text-white text-xs font-bold flex items-center justify-center">2</span>
              <p className="font-bold text-[#0F2C5C] text-sm">أنشئ حسابات الأدمن</p>
            </div>
            <p className="text-xs text-slate-500 mb-4">بعد تشغيل الـ SQL، اضغط الزر لتسجيل الحسابات في النظام.</p>

            <Button onClick={handleSetup} disabled={step==='running'}
              className="w-full rounded-xl bg-[#0F2C5C] hover:bg-[#0F2C5C]/90 text-white font-bold py-3">
              {step==='running' ? <><Loader2 className="h-4 w-4 animate-spin me-2"/>جاري الإعداد...</>
               : step==='done' ? <><CheckCircle2 className="h-4 w-4 me-2"/>تم الإعداد ✅</>
               : 'تفعيل الحسابات'}
            </Button>

            {step==='error' && tablesOk===false && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                ⚠️ الجداول غير موجودة — شغّل الـ SQL في الخطوة الأولى أولاً ثم حاول مجدداً.
              </div>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((r,i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${r.ok?'bg-green-50 border-green-200':'bg-red-50 border-red-200'}`}>
                  {r.ok ? <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0"/>
                        : <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0"/>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-slate-500">{r.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Credentials table */}
          <div className="border border-[#C9A86A]/30 bg-[#C9A86A]/5 rounded-2xl p-5">
            <p className="font-bold text-[#0F2C5C] text-sm mb-3">🔑 بيانات الدخول</p>
            <div className="space-y-3">
              {CREDENTIALS.map((c,i) => (
                <div key={i} className="bg-white rounded-xl p-3 border border-[#C9A86A]/20">
                  <p className="font-bold text-[#0F2C5C] text-sm">{c.name}</p>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <p className="text-xs text-slate-500">البريد: <span className="font-mono text-slate-700">{c.email}</span></p>
                    <p className="text-xs text-slate-500">كلمة المرور: <span className="font-mono text-[#0F2C5C] font-bold">{c.password}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <a href="/login" className="block w-full">
            <Button variant="outline" className="w-full rounded-xl border-[#0F2C5C]/30 text-[#0F2C5C] font-bold hover:bg-[#0F2C5C]/5">
              انتقل لصفحة تسجيل الدخول →
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
