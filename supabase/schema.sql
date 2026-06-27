-- ═══════════════════════════════════════════════════════════════════
--  كويك ديل (QD) — Supabase Database Schema
--  Run this in: Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════

-- ─── Enable UUID extension ───────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── staff_profiles ──────────────────────────────────────────────
create table if not exists public."staff_profiles" (
  "id"        uuid primary key references auth.users(id) on delete cascade,
  "username"  text unique,
  "name"      text not null,
  "email"     text not null,
  "phone"     text,
  "role"      text not null check ("role" in ('admin', 'employee')),
  "created_at" timestamptz default now()
);

-- ─── applications ────────────────────────────────────────────────
create table if not exists public."applications" (
  "id"                              uuid primary key default uuid_generate_v4(),
  "applicantUid"                    uuid references auth.users(id),
  "username"                        text,
  "applicantName"                   text not null,
  "applicantPhone"                  text,
  "applicantEmail"                  text,
  "applicantRole"                   text,
  "companyName"                     text not null,
  "commercialRegistryNumber"        text,
  "registryAgeYears"                numeric default 0,
  "registryTransferredLast6Months"  boolean default false,
  "approximateDailyIncome"          numeric default 0,
  "approximateAnnualIncome"         numeric default 0,
  "bankName"                        text,
  "hasObligations"                  boolean default false,
  "totalObligation"                 numeric default 0,
  "fundingEntity"                   text,
  "remaining"                       numeric default 0,
  "applicationStatus"               text not null default 'Pending'
                                      check ("applicationStatus" in ('Pending','Under Review','Completed','Cancelled')),
  "paymentStatus"                   text not null default 'Unpaid'
                                      check ("paymentStatus" in ('Unpaid','Sent','Paid')),
  "feeAmount"                       numeric,
  "serviceName"                     text,
  "comments"                        jsonb default '[]'::jsonb,
  "submissionDate"                  timestamptz default now()
);

-- ─── access_requests ─────────────────────────────────────────────
create table if not exists public."access_requests" (
  "id"             uuid primary key default uuid_generate_v4(),
  "employeeId"     uuid references auth.users(id),
  "employeeName"   text not null,
  "applicationId"  uuid references public."applications"("id"),
  "companyName"    text,
  "status"         text not null default 'pending'
                     check ("status" in ('pending','approved','rejected')),
  "requestDate"    timestamptz default now()
);

-- ─── Row Level Security (RLS) ─────────────────────────────────────
alter table public."staff_profiles"  enable row level security;
alter table public."applications"    enable row level security;
alter table public."access_requests" enable row level security;

-- Staff profiles: visible to authenticated users, editable by owner/admin
create policy "staff_profiles_select" on public."staff_profiles"
  for select to authenticated using (true);
create policy "staff_profiles_insert" on public."staff_profiles"
  for insert to authenticated with check (true);
create policy "staff_profiles_update" on public."staff_profiles"
  for update to authenticated using (true);
create policy "staff_profiles_delete" on public."staff_profiles"
  for delete to authenticated using (true);

-- Applications: owner sees own, staff sees all
create policy "applications_select_own" on public."applications"
  for select to authenticated using (
    "applicantUid" = auth.uid() or
    exists (select 1 from public."staff_profiles" where id = auth.uid() and role in ('admin','employee'))
  );
create policy "applications_insert" on public."applications"
  for insert to authenticated with check (true);
create policy "applications_update_staff" on public."applications"
  for update to authenticated using (
    exists (select 1 from public."staff_profiles" where id = auth.uid() and role in ('admin','employee'))
  );

-- Access requests: staff only
create policy "access_requests_all" on public."access_requests"
  for all to authenticated using (true) with check (true);

-- ─── Real-time ────────────────────────────────────────────────────
-- Enable real-time for all tables in Supabase Dashboard:
-- Database → Replication → enable for applications, staff_profiles, access_requests
