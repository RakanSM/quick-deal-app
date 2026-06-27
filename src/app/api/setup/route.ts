import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const results: any = {};

  // 1. Create tables via direct SQL using pg endpoint
  const sqls = [
    `create extension if not exists "uuid-ossp"`,
    `create table if not exists public."staff_profiles" (
      "id" uuid primary key references auth.users(id) on delete cascade,
      "username" text unique, "name" text not null, "email" text not null,
      "phone" text, "role" text not null default 'admin',
      "created_at" timestamptz default now()
    )`,
    `create table if not exists public."applications" (
      "id" uuid primary key default uuid_generate_v4(),
      "applicantUid" uuid, "username" text, "applicantName" text not null,
      "applicantPhone" text, "applicantEmail" text, "applicantRole" text,
      "companyName" text not null, "commercialRegistryNumber" text,
      "registryAgeYears" numeric default 0,
      "registryTransferredLast6Months" boolean default false,
      "approximateDailyIncome" numeric default 0,
      "approximateAnnualIncome" numeric default 0,
      "bankName" text, "hasObligations" boolean default false,
      "totalObligation" numeric default 0, "fundingEntity" text,
      "remaining" numeric default 0,
      "applicationStatus" text not null default 'Pending',
      "paymentStatus" text not null default 'Unpaid',
      "feeAmount" numeric, "serviceName" text,
      "comments" jsonb default '[]'::jsonb,
      "submissionDate" timestamptz default now()
    )`,
    `create table if not exists public."access_requests" (
      "id" uuid primary key default uuid_generate_v4(),
      "employeeId" uuid, "employeeName" text not null,
      "applicationId" uuid, "companyName" text,
      "status" text not null default 'pending',
      "requestDate" timestamptz default now()
    )`,
    `alter table public."staff_profiles" enable row level security`,
    `alter table public."applications" enable row level security`,
    `alter table public."access_requests" enable row level security`,
    `do $$ begin
      if not exists (select 1 from pg_policies where tablename='staff_profiles' and policyname='sp_all') then
        create policy "sp_all" on public."staff_profiles" for all using (true) with check (true);
      end if;
      if not exists (select 1 from pg_policies where tablename='applications' and policyname='apps_all') then
        create policy "apps_all" on public."applications" for all using (true) with check (true);
      end if;
      if not exists (select 1 from pg_policies where tablename='access_requests' and policyname='ar_all') then
        create policy "ar_all" on public."access_requests" for all using (true) with check (true);
      end if;
    end $$`,
  ];

  for (const sql of sqls) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
    });
  }

  // 2. Upsert admin profiles (tables must exist)
  const admins = [
    { id: '720f582b-e265-46f0-9d22-90a3e6d2d8a3', username: 'admin', name: 'مدير النظام', email: 'admin@quickdealsa.com', role: 'admin', phone: '' },
    { id: 'dd1ce13d-b947-41d3-8f95-a8e2cf4e322d', username: 'rakan', name: 'راكان الديحاني', email: 'rakan@quickdealsa.com', role: 'admin', phone: '0531944957' },
    { id: '6597940a-87d7-4b09-8286-63d78865f335', username: 'manager', name: 'مدير العمليات', email: 'manager@quickdealsa.com', role: 'admin', phone: '' },
  ];

  const profileResults = [];
  for (const admin of admins) {
    const { error } = await sb.from('staff_profiles').upsert(admin, { onConflict: 'id' });
    profileResults.push({ email: admin.email, ok: !error, err: error?.message });
  }

  results.profiles = profileResults;
  results.status = 'done';
  return NextResponse.json(results);
}
