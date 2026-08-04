create table if not exists public.whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  instance_id text not null,
  phone text not null,
  name text,
  is_group boolean not null default false,
  lead_id uuid references public.leads(id) on delete set null,
  source_channel text not null default 'WhatsApp inbound',
  source_detail text,
  campaign text,
  click_id text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (instance_id, phone)
);

create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.whatsapp_conversations(id) on delete cascade,
  instance_id text not null,
  provider_message_id text not null,
  phone text not null,
  direction text not null check (direction in ('inbound', 'outbound')),
  message_type text not null check (message_type = 'text'),
  body text not null,
  status text,
  occurred_at timestamptz not null,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  unique (instance_id, provider_message_id)
);

alter table public.whatsapp_conversations
  add column if not exists lead_id uuid references public.leads(id) on delete set null,
  add column if not exists source_channel text not null default 'WhatsApp inbound',
  add column if not exists source_detail text,
  add column if not exists campaign text,
  add column if not exists click_id text;

create or replace function public.set_whatsapp_conversation_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists whatsapp_conversations_set_updated_at on public.whatsapp_conversations;
create trigger whatsapp_conversations_set_updated_at
before update on public.whatsapp_conversations
for each row execute function public.set_whatsapp_conversation_updated_at();

alter table public.whatsapp_conversations enable row level security;
alter table public.whatsapp_messages enable row level security;

drop policy if exists "administrators read whatsapp conversations" on public.whatsapp_conversations;
create policy "administrators read whatsapp conversations"
on public.whatsapp_conversations for select
to authenticated
using (public.current_crm_role()::text in ('admin', 'operator'));

drop policy if exists "administrators manage whatsapp conversations" on public.whatsapp_conversations;
create policy "administrators manage whatsapp conversations"
on public.whatsapp_conversations for all
to authenticated
using (public.current_crm_role()::text in ('admin', 'operator'))
with check (public.current_crm_role()::text in ('admin', 'operator'));

drop policy if exists "administrators read whatsapp messages" on public.whatsapp_messages;
create policy "administrators read whatsapp messages"
on public.whatsapp_messages for select
to authenticated
using (public.current_crm_role()::text in ('admin', 'operator'));

drop policy if exists "administrators manage whatsapp messages" on public.whatsapp_messages;
create policy "administrators manage whatsapp messages"
on public.whatsapp_messages for all
to authenticated
using (public.current_crm_role()::text in ('admin', 'operator'))
with check (public.current_crm_role()::text in ('admin', 'operator'));

create index if not exists whatsapp_conversations_last_message_idx
on public.whatsapp_conversations(last_message_at desc nulls last);

create index if not exists whatsapp_conversations_lead_idx
on public.whatsapp_conversations(lead_id);

create index if not exists whatsapp_conversations_campaign_idx
on public.whatsapp_conversations(campaign);

create index if not exists whatsapp_messages_conversation_time_idx
on public.whatsapp_messages(conversation_id, occurred_at asc);

create index if not exists whatsapp_messages_phone_idx
on public.whatsapp_messages(instance_id, phone, occurred_at asc);
