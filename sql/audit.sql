-- Needed to do outbound HTTP from Postgres
create extension if not exists pg_net;

-- Calls the Edge Function asynchronously (no Vault)
create or replace function public.enqueue_donation_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  url text := 'https://zhbmhzepbsxqyfcpiagd.supabase.co/functions/v1/donation-audit-log';
  secret text := '84275a6e0913694fe05b8582106b7cbdf9b90605ed4157e8995243baca822458';
  payload jsonb;
begin
  payload := jsonb_build_object(
    'event', tg_op,
    'table', tg_table_name,
    'at', now(),
    'record', case
      when tg_op = 'DELETE' then to_jsonb(old)
      else to_jsonb(new)
    end
  );

  -- fire-and-forget
  perform net.http_post(
    url := url,
    body := payload,
    headers := jsonb_build_object(
      'content-type', 'application/json',
      'x-donation-audit-secret', secret
    )
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists donations_audit_trigger on public.donations;

create trigger donations_audit_trigger
after insert or update or delete on public.donations
for each row
execute procedure public.enqueue_donation_audit();