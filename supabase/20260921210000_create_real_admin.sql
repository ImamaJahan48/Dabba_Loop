-- ============================================================
-- DabbaLoop - Promote existing Supabase Auth user to REAL ADMIN
-- ============================================================

do $$
declare
  v_user_id uuid;
  v_email text := 'admin@dabbaloop.pk'; -- CHANGE THIS
  v_full_name text;
  v_phone text;
begin

  -- Find the real Supabase Auth account
  select
    id,
    coalesce(raw_user_meta_data ->> 'full_name', 'DabbaLoop Admin'),
    coalesce(raw_user_meta_data ->> 'phone', '')
  into
    v_user_id,
    v_full_name,
    v_phone
  from auth.users
  where lower(email) = lower(v_email)
  limit 1;

  if v_user_id is null then
    raise exception
      'No Supabase Auth user exists for %. Create the account through /signup first.',
      v_email;
  end if;

  -- Create profile if somehow missing.
  -- Otherwise promote the existing profile.
  insert into public.profiles (
    id,
    full_name,
    phone,
    email,
    role,
    blocked
  )
  values (
    v_user_id,
    v_full_name,
    v_phone,
    v_email,
    'admin'::public.app_role,
    false
  )
  on conflict (id)
  do update set
    role = 'admin'::public.app_role,
    email = excluded.email,
    full_name = coalesce(
      nullif(public.profiles.full_name, ''),
      excluded.full_name
    ),
    blocked = false,
    updated_at = now();

  -- Make sure admin has a wallet row as well.
  insert into public.wallets (
    user_id,
    balance
  )
  values (
    v_user_id,
    0
  )
  on conflict (user_id)
  do nothing;

  raise notice 'DabbaLoop admin created: % (%)', v_email, v_user_id;

end
$$;