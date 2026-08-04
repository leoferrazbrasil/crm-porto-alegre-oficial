alter table public.whatsapp_conversations
  add column if not exists qualification_status text not null default 'new';

update public.whatsapp_conversations
set qualification_status = 'new'
where qualification_status is null;

alter table public.whatsapp_conversations
  drop constraint if exists whatsapp_conversations_qualification_status_check;

alter table public.whatsapp_conversations
  add constraint whatsapp_conversations_qualification_status_check
  check (qualification_status in ('new', 'qualifying', 'qualified', 'not_interested', 'mistake', 'spam'));

create index if not exists whatsapp_conversations_qualification_status_idx
  on public.whatsapp_conversations(qualification_status);
