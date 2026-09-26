-- Flexible Meal Service core schema
-- Designed for Supabase Postgres. Apply with: npm run db:push

create extension if not exists pgcrypto;

create type public.app_role as enum ('customer','admin','kitchen','delivery','partner','finance');
create type public.hub_type as enum ('hostel','office','community');
create type public.meal_period as enum ('lunch','dinner');
create type public.order_status as enum ('scheduled','confirmed','preparing','packed','out_for_hub','delivered','collected','cancelled');
create type public.payment_status as enum ('pending','paid','failed','refunded','partially_refunded','expired');
create type public.wallet_tx_type as enum ('purchase','order_debit','order_refund','promo','referral','admin_adjustment','expiry');
create type public.delivery_status as enum ('draft','ready','picked_up','in_progress','delivered','cancelled');

create table public.hubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type public.hub_type not null default 'hostel',
  area text not null,
  address text not null,
  contact_name text,
  contact_phone text,
  pickup_label text,
  lunch_pickup_time time,
  dinner_pickup_time time,
  capacity integer not null default 30 check (capacity > 0),
  latitude numeric(9,6),
  longitude numeric(9,6),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  role public.app_role not null default 'customer',
  default_hub_id uuid references public.hubs(id) on delete set null,
  spice_preference text default 'normal' check (spice_preference in ('mild','normal','spicy')),
  blocked boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hub_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  hub_id uuid not null references public.hubs(id) on delete cascade,
  membership_role text not null default 'customer' check (membership_role in ('customer','partner')),
  status text not null default 'active' check (status in ('active','inactive','pending')),
  created_at timestamptz not null default now(),
  unique(user_id, hub_id, membership_role)
);

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  category text not null default 'Daily',
  ingredients text,
  allergens text[] not null default '{}',
  calories integer,
  protein_grams numeric(6,1),
  image_path text,
  accent text not null default 'coral',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.menu_slots (
  id uuid primary key default gen_random_uuid(),
  service_date date not null,
  period public.meal_period not null,
  meal_id uuid not null references public.meals(id) on delete restrict,
  price numeric(12,2) not null check (price >= 0),
  credit_cost numeric(8,2) not null default 1 check (credit_cost > 0),
  capacity integer not null default 50 check (capacity > 0),
  cutoff_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(service_date, period, meal_id)
);

create table public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance numeric(10,2) not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table public.credit_packs (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  credits numeric(10,2) not null check (credits > 0),
  price numeric(12,2) not null check (price >= 0),
  validity_days integer,
  description text,
  bonus_credits numeric(10,2) not null default 0,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  credit_pack_id uuid references public.credit_packs(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  method text not null,
  status public.payment_status not null default 'pending',
  reference text,
  proof_path text,
  gateway_event_id text unique,
  verified_by uuid references public.profiles(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  hub_id uuid not null references public.hubs(id) on delete restrict,
  menu_slot_id uuid not null references public.menu_slots(id) on delete restrict,
  service_date date not null,
  period public.meal_period not null,
  status public.order_status not null default 'confirmed',
  credit_cost numeric(8,2) not null,
  cash_total numeric(12,2) not null default 0,
  notes text,
  cancelled_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index orders_one_active_slot_per_user on public.orders(user_id, menu_slot_id)
where status <> 'cancelled';

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  meal_id uuid not null references public.meals(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  variant text not null default 'regular' check (variant in ('regular','protein_plus')),
  add_ons jsonb not null default '[]'::jsonb,
  unit_price numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  type public.wallet_tx_type not null,
  amount numeric(10,2) not null check (amount <> 0),
  order_id uuid references public.orders(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  reason text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index wallet_one_purchase_per_payment on public.wallet_transactions(payment_id)
where type='purchase' and payment_id is not null;
create unique index wallet_one_debit_per_order on public.wallet_transactions(order_id)
where type='order_debit' and order_id is not null;
create unique index wallet_one_refund_per_order on public.wallet_transactions(order_id)
where type='order_refund' and order_id is not null;

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  kind text not null check (kind in ('fixed','percent','bonus_credit')),
  value numeric(12,2) not null,
  max_uses integer,
  uses integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_id uuid not null unique references public.profiles(id) on delete cascade,
  code text not null,
  status text not null default 'pending' check (status in ('pending','qualified','rewarded','rejected')),
  reward_transaction_id uuid references public.wallet_transactions(id) on delete set null,
  created_at timestamptz not null default now(),
  qualified_at timestamptz,
  check (referrer_id <> referred_id)
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  taste integer check (taste between 1 and 5),
  portion integer check (portion between 1 and 5),
  packaging integer check (packaging between 1 and 5),
  delivery integer check (delivery between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  channel text not null default 'in_app' check (channel in ('in_app','email','whatsapp','sms')),
  template text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','sent','failed','read')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.delivery_runs (
  id uuid primary key default gen_random_uuid(),
  service_date date not null,
  period public.meal_period not null,
  driver_id uuid references public.profiles(id) on delete set null,
  status public.delivery_status not null default 'draft',
  notes text,
  picked_up_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.delivery_run_hubs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.delivery_runs(id) on delete cascade,
  hub_id uuid not null references public.hubs(id) on delete restrict,
  sequence integer not null,
  eta timestamptz,
  box_count integer not null default 0,
  delivered_at timestamptz,
  unique(run_id, hub_id),
  unique(run_id, sequence)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text,
  email text,
  phone text,
  area text,
  estimated_people integer,
  message text,
  status text not null default 'new' check (status in ('new','contacted','qualified','closed')),
  created_at timestamptz not null default now()
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  hub_id uuid references public.hubs(id) on delete set null,
  category text not null,
  details text not null,
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.app_settings (
  key text primary key,
  value jsonb not null,
  public_read boolean not null default false,
  updated_at timestamptz not null default now()
);

create index orders_date_period_idx on public.orders(service_date, period, status);
create index orders_hub_date_idx on public.orders(hub_id, service_date, period);
create index orders_user_date_idx on public.orders(user_id, service_date desc);
create index menu_slots_date_idx on public.menu_slots(service_date, period) where active;
create index payments_status_idx on public.payments(status, created_at desc);
create index wallet_transactions_user_idx on public.wallet_transactions(user_id, created_at desc);
create index feedback_created_idx on public.feedback(created_at desc);

-- Generic updated_at trigger
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

do $$ declare t text; begin
  foreach t in array array['hubs','profiles','meals','menu_slots','wallets','credit_packs','payments','orders','delivery_runs','support_tickets'] loop
    execute format('create trigger touch_%I before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- Auth signup -> application profile + wallet
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, phone, email)
  values(new.id, coalesce(new.raw_user_meta_data->>'full_name',''), coalesce(new.raw_user_meta_data->>'phone',''), new.email)
  on conflict (id) do nothing;
  insert into public.wallets(user_id, balance) values(new.id,0) on conflict(user_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Helper used by RLS and protected functions
create or replace function public.current_app_role() returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff(allowed public.app_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_app_role() = any(allowed), false);
$$;

-- Wallet is derived from immutable ledger entries.
create or replace function public.apply_wallet_transaction() returns trigger
language plpgsql security definer set search_path = public as $$
declare new_balance numeric(10,2);
begin
  insert into public.wallets(user_id,balance) values(new.user_id,0) on conflict(user_id) do nothing;
  select balance + new.amount into new_balance from public.wallets where user_id=new.user_id for update;
  if new_balance < 0 then raise exception 'Insufficient wallet balance'; end if;
  update public.wallets set balance=new_balance, updated_at=now() where user_id=new.user_id;
  return new;
end; $$;

create trigger wallet_tx_apply after insert on public.wallet_transactions for each row execute function public.apply_wallet_transaction();

-- Prevent editing ledger rows after insertion. Corrections are new transactions.
create or replace function public.prevent_wallet_tx_mutation() returns trigger language plpgsql as $$
begin raise exception 'wallet_transactions is append-only'; end; $$;
create trigger wallet_tx_no_update before update or delete on public.wallet_transactions for each row execute function public.prevent_wallet_tx_mutation();

-- Atomic order creation.
create or replace function public.create_meal_order(p_menu_slot_id uuid, p_hub_id uuid, p_notes text default null, p_variant text default 'regular')
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid(); v_slot public.menu_slots%rowtype; v_hub public.hubs%rowtype;
  v_wallet numeric(10,2); v_count integer; v_order uuid; v_blocked boolean;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  select blocked into v_blocked from public.profiles where id=v_user;
  if coalesce(v_blocked,false) then raise exception 'Account is blocked'; end if;
  select * into v_slot from public.menu_slots where id=p_menu_slot_id and active=true for update;
  if not found then raise exception 'Menu slot unavailable'; end if;
  if now() >= v_slot.cutoff_at then raise exception 'Ordering cutoff has passed'; end if;
  select * into v_hub from public.hubs where id=p_hub_id and active=true for update;
  if not found then raise exception 'Hub unavailable'; end if;
  select count(*) into v_count from public.orders where menu_slot_id=v_slot.id and status <> 'cancelled';
  if v_count >= v_slot.capacity then raise exception 'Meal slot is full'; end if;
  select count(*) into v_count from public.orders where hub_id=v_hub.id and service_date=v_slot.service_date and period=v_slot.period and status <> 'cancelled';
  if v_count >= v_hub.capacity then raise exception 'Hub capacity reached'; end if;
  select balance into v_wallet from public.wallets where user_id=v_user for update;
  if coalesce(v_wallet,0) < v_slot.credit_cost then raise exception 'Insufficient meal credits'; end if;

  insert into public.orders(user_id,hub_id,menu_slot_id,service_date,period,status,credit_cost,cash_total,notes)
  values(v_user,p_hub_id,v_slot.id,v_slot.service_date,v_slot.period,'confirmed',v_slot.credit_cost,0,p_notes)
  returning id into v_order;
  insert into public.order_items(order_id,meal_id,quantity,variant,unit_price)
  values(v_order,v_slot.meal_id,1,case when p_variant='protein_plus' then 'protein_plus' else 'regular' end,0);
  insert into public.wallet_transactions(user_id,type,amount,order_id,reason)
  values(v_user,'order_debit',-v_slot.credit_cost,v_order,'Confirmed meal order');
  return v_order;
end; $$;

grant execute on function public.create_meal_order(uuid,uuid,text,text) to authenticated;

-- Skip and return credit exactly once.
create or replace function public.skip_meal_order(p_order_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_user uuid:=auth.uid(); v_order public.orders%rowtype; v_cutoff timestamptz;
begin
  select * into v_order from public.orders where id=p_order_id and user_id=v_user for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.status='cancelled' then return true; end if;
  if v_order.status in ('delivered','collected') then raise exception 'Delivered orders cannot be skipped'; end if;
  select cutoff_at into v_cutoff from public.menu_slots where id=v_order.menu_slot_id;
  if now() >= v_cutoff then raise exception 'Skip cutoff has passed'; end if;
  update public.orders set status='cancelled',cancelled_at=now() where id=v_order.id;
  insert into public.wallet_transactions(user_id,type,amount,order_id,reason)
  values(v_user,'order_refund',v_order.credit_cost,v_order.id,'Skip before cutoff')
  on conflict do nothing;
  return true;
end; $$;
grant execute on function public.skip_meal_order(uuid) to authenticated;

-- Atomic switch / move. Old order is cancelled and refunded only if the new order can also be created.
create or replace function public.change_meal_order(p_order_id uuid, p_new_menu_slot_id uuid, p_new_hub_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_user uuid:=auth.uid(); v_old public.orders%rowtype; v_old_cutoff timestamptz; v_variant text; v_new_order uuid;
begin
  select * into v_old from public.orders where id=p_order_id and user_id=v_user for update;
  if not found then raise exception 'Order not found'; end if;
  if v_old.status='cancelled' then raise exception 'Order is already cancelled'; end if;
  if v_old.status in ('delivered','collected') then raise exception 'Completed orders cannot be changed'; end if;
  select cutoff_at into v_old_cutoff from public.menu_slots where id=v_old.menu_slot_id;
  if now() >= v_old_cutoff then raise exception 'Change cutoff has passed'; end if;
  select variant into v_variant from public.order_items where order_id=v_old.id order by created_at limit 1;

  update public.orders set status='cancelled',cancelled_at=now(),notes=concat_ws(' | ',notes,'Changed to another slot/hub') where id=v_old.id;
  insert into public.wallet_transactions(user_id,type,amount,order_id,reason)
  values(v_user,'order_refund',v_old.credit_cost,v_old.id,'Credit returned during meal change')
  on conflict do nothing;

  v_new_order := public.create_meal_order(p_new_menu_slot_id,p_new_hub_id,concat('Changed from ',v_old.id::text),coalesce(v_variant,'regular'));
  return v_new_order;
end; $$;
grant execute on function public.change_meal_order(uuid,uuid,uuid) to authenticated;

-- Admin/finance manual payment approval, idempotent by payment ledger index.
create or replace function public.approve_manual_payment(p_payment_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_payment public.payments%rowtype; v_credits numeric(10,2); v_role public.app_role;
begin
  v_role := public.current_app_role();
  if v_role not in ('admin','finance') then raise exception 'Not authorized'; end if;
  select * into v_payment from public.payments where id=p_payment_id for update;
  if not found then raise exception 'Payment not found'; end if;
  if v_payment.status='paid' then return true; end if;
  if v_payment.status <> 'pending' then raise exception 'Payment cannot be approved from status %',v_payment.status; end if;
  if v_payment.credit_pack_id is null then raise exception 'Payment has no credit pack'; end if;
  select credits + bonus_credits into v_credits from public.credit_packs where id=v_payment.credit_pack_id and active=true;
  if v_credits is null then raise exception 'Credit pack unavailable'; end if;
  update public.payments set status='paid',verified_by=auth.uid(),verified_at=now() where id=p_payment_id;
  insert into public.wallet_transactions(user_id,type,amount,payment_id,reason,created_by)
  values(v_payment.user_id,'purchase',v_credits,v_payment.id,'Manual payment approved',auth.uid())
  on conflict do nothing;
  insert into public.audit_logs(actor_id,action,entity,entity_id,metadata)
  values(auth.uid(),'approve_payment','payments',p_payment_id::text,jsonb_build_object('credits',v_credits));
  return true;
end; $$;
grant execute on function public.approve_manual_payment(uuid) to authenticated;

create or replace function public.admin_adjust_wallet(p_user_id uuid,p_amount numeric,p_reason text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if public.current_app_role() not in ('admin','finance') then raise exception 'Not authorized'; end if;
  if p_amount=0 or length(trim(coalesce(p_reason,'')))<3 then raise exception 'Amount and reason required'; end if;
  insert into public.wallet_transactions(user_id,type,amount,reason,created_by)
  values(p_user_id,'admin_adjustment',p_amount,p_reason,auth.uid()) returning id into v_id;
  insert into public.audit_logs(actor_id,action,entity,entity_id,metadata)
  values(auth.uid(),'wallet_adjustment','profiles',p_user_id::text,jsonb_build_object('amount',p_amount,'reason',p_reason));
  return v_id;
end; $$;
grant execute on function public.admin_adjust_wallet(uuid,numeric,text) to authenticated;

-- Public aggregate menu view. It exposes capacity totals, never customer/order rows.
create or replace view public.public_menu_slots as
select ms.id,ms.service_date,ms.period,ms.meal_id,ms.price,ms.credit_cost,ms.capacity,ms.cutoff_at,ms.active,
       greatest(ms.capacity-count(o.id),0)::int as remaining
from public.menu_slots ms
left join public.orders o on o.menu_slot_id=ms.id and o.status<>'cancelled'
group by ms.id;
grant select on public.public_menu_slots to anon,authenticated;

-- Aggregated operational views. security_invoker keeps RLS active.
create or replace view public.kitchen_production_summary with (security_invoker=true) as
select o.service_date,o.period,m.name as meal_name,
       count(*) filter(where oi.variant='regular')::int as regular_qty,
       count(*) filter(where oi.variant='protein_plus')::int as protein_qty,
       count(*)::int as total_qty
from public.orders o
join public.order_items oi on oi.order_id=o.id
join public.meals m on m.id=oi.meal_id
where o.status not in ('cancelled')
group by o.service_date,o.period,m.name;

create or replace view public.hub_production_summary with (security_invoker=true) as
select o.service_date,o.period,o.hub_id,h.name as hub_name,count(*)::int as box_count
from public.orders o join public.hubs h on h.id=o.hub_id
where o.status <> 'cancelled'
group by o.service_date,o.period,o.hub_id,h.name;

-- RLS
alter table public.hubs enable row level security;
alter table public.profiles enable row level security;
alter table public.hub_memberships enable row level security;
alter table public.meals enable row level security;
alter table public.menu_slots enable row level security;
alter table public.wallets enable row level security;
alter table public.credit_packs enable row level security;
alter table public.payments enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.coupons enable row level security;
alter table public.referrals enable row level security;
alter table public.feedback enable row level security;
alter table public.notifications enable row level security;
alter table public.delivery_runs enable row level security;
alter table public.delivery_run_hubs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.inquiries enable row level security;
alter table public.support_tickets enable row level security;
alter table public.app_settings enable row level security;

create policy "public reads active hubs" on public.hubs for select to anon,authenticated using(active or public.is_staff(array['admin','kitchen','delivery','finance']::public.app_role[]));
create policy "admin manages hubs" on public.hubs for all to authenticated using(public.current_app_role()='admin') with check(public.current_app_role()='admin');

create policy "own profile" on public.profiles for select to authenticated using(id=auth.uid() or public.is_staff(array['admin','finance']::public.app_role[]));
create policy "own profile update" on public.profiles for update to authenticated using(id=auth.uid() or public.current_app_role()='admin') with check(id=auth.uid() or public.current_app_role()='admin');

create policy "own memberships" on public.hub_memberships for select to authenticated using(user_id=auth.uid() or public.current_app_role() in ('admin','partner'));
create policy "admin manages memberships" on public.hub_memberships for all to authenticated using(public.current_app_role()='admin') with check(public.current_app_role()='admin');

create policy "public reads active meals" on public.meals for select to anon,authenticated using(active or public.is_staff(array['admin','kitchen']::public.app_role[]));
create policy "admin manages meals" on public.meals for all to authenticated using(public.current_app_role()='admin') with check(public.current_app_role()='admin');

create policy "public reads active menu" on public.menu_slots for select to anon,authenticated using(active or public.is_staff(array['admin','kitchen']::public.app_role[]));
create policy "admin manages menu" on public.menu_slots for all to authenticated using(public.current_app_role()='admin') with check(public.current_app_role()='admin');

create policy "own wallet" on public.wallets for select to authenticated using(user_id=auth.uid() or public.current_app_role() in ('admin','finance'));

create policy "public reads packs" on public.credit_packs for select to anon,authenticated using(active or public.current_app_role() in ('admin','finance'));
create policy "admin manages packs" on public.credit_packs for all to authenticated using(public.current_app_role()='admin') with check(public.current_app_role()='admin');

create policy "own payments read" on public.payments for select to authenticated using(user_id=auth.uid() or public.current_app_role() in ('admin','finance'));
create policy "own pending payment insert" on public.payments for insert to authenticated with check(user_id=auth.uid() and status='pending');
create policy "finance manages payments" on public.payments for update to authenticated using(public.current_app_role() in ('admin','finance')) with check(public.current_app_role() in ('admin','finance'));

create policy "orders scoped read" on public.orders for select to authenticated using(
  user_id=auth.uid()
  or public.current_app_role() in ('admin','kitchen','delivery','finance')
  or (public.current_app_role()='partner' and exists(select 1 from public.hub_memberships hm where hm.user_id=auth.uid() and hm.hub_id=orders.hub_id and hm.membership_role='partner' and hm.status='active'))
);
create policy "admin updates orders" on public.orders for update to authenticated using(public.current_app_role() in ('admin','kitchen','delivery')) with check(public.current_app_role() in ('admin','kitchen','delivery'));

create policy "order items scoped read" on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_items.order_id and (o.user_id=auth.uid() or public.current_app_role() in ('admin','kitchen','delivery','finance') or (public.current_app_role()='partner' and exists(select 1 from public.hub_memberships hm where hm.user_id=auth.uid() and hm.hub_id=o.hub_id and hm.membership_role='partner' and hm.status='active')))));

create policy "own wallet transactions" on public.wallet_transactions for select to authenticated using(user_id=auth.uid() or public.current_app_role() in ('admin','finance'));

create policy "read active coupons" on public.coupons for select to authenticated using(active or public.current_app_role()='admin');
create policy "admin manages coupons" on public.coupons for all to authenticated using(public.current_app_role()='admin') with check(public.current_app_role()='admin');

create policy "referral participants read" on public.referrals for select to authenticated using(referrer_id=auth.uid() or referred_id=auth.uid() or public.current_app_role()='admin');
create policy "own referral insert" on public.referrals for insert to authenticated with check(referrer_id=auth.uid() and referred_id<>auth.uid());

create policy "own feedback read" on public.feedback for select to authenticated using(user_id=auth.uid() or public.current_app_role() in ('admin','kitchen'));
create policy "own feedback insert" on public.feedback for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid() and o.status in ('delivered','collected')));

create policy "own notifications" on public.notifications for select to authenticated using(user_id=auth.uid() or public.current_app_role()='admin');
create policy "own notification read update" on public.notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

create policy "delivery staff run read" on public.delivery_runs for select to authenticated using(driver_id=auth.uid() or public.current_app_role() in ('admin','delivery','kitchen'));
create policy "admin delivery run write" on public.delivery_runs for all to authenticated using(public.current_app_role() in ('admin','delivery')) with check(public.current_app_role() in ('admin','delivery'));
create policy "delivery stop read" on public.delivery_run_hubs for select to authenticated using(exists(select 1 from public.delivery_runs dr where dr.id=run_id and (dr.driver_id=auth.uid() or public.current_app_role() in ('admin','delivery','kitchen'))));
create policy "admin delivery stop write" on public.delivery_run_hubs for all to authenticated using(public.current_app_role() in ('admin','delivery')) with check(public.current_app_role() in ('admin','delivery'));

create policy "admins read audit" on public.audit_logs for select to authenticated using(public.current_app_role() in ('admin','finance'));
create policy "public creates inquiry" on public.inquiries for insert to anon,authenticated with check(true);
create policy "admin reads inquiries" on public.inquiries for select to authenticated using(public.current_app_role()='admin');
create policy "admin updates inquiries" on public.inquiries for update to authenticated using(public.current_app_role()='admin') with check(public.current_app_role()='admin');

create policy "own support ticket" on public.support_tickets for select to authenticated using(user_id=auth.uid() or public.current_app_role() in ('admin','partner'));
create policy "create own support ticket" on public.support_tickets for insert to authenticated with check(user_id=auth.uid());
create policy "staff support update" on public.support_tickets for update to authenticated using(public.current_app_role() in ('admin','partner')) with check(public.current_app_role() in ('admin','partner'));

create policy "public settings" on public.app_settings for select to anon,authenticated using(public_read or public.current_app_role()='admin');
create policy "admin settings" on public.app_settings for all to authenticated using(public.current_app_role()='admin') with check(public.current_app_role()='admin');

-- Storage buckets + policies
insert into storage.buckets(id,name,public) values('meal-images','meal-images',true) on conflict(id) do nothing;
insert into storage.buckets(id,name,public) values('payment-proofs','payment-proofs',false) on conflict(id) do nothing;

create policy "public meal images" on storage.objects for select to public using(bucket_id='meal-images');
create policy "admin meal images" on storage.objects for all to authenticated using(bucket_id='meal-images' and public.current_app_role()='admin') with check(bucket_id='meal-images' and public.current_app_role()='admin');
create policy "upload own payment proof" on storage.objects for insert to authenticated with check(bucket_id='payment-proofs' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "read own payment proof" on storage.objects for select to authenticated using(bucket_id='payment-proofs' and ((storage.foldername(name))[1]=auth.uid()::text or public.current_app_role() in ('admin','finance')));

insert into public.app_settings(key,value,public_read) values
('cutoffs', '{"lunch":"09:30","dinner":"15:30"}'::jsonb, true),
('delivery_windows', '{"lunch":"12:00-14:00","dinner":"18:30-20:30"}'::jsonb, true),
('cancellation_policy', '{"before_cutoff":"full_credit_return","after_cutoff":"admin_exception_only"}'::jsonb, true)
on conflict(key) do nothing;
