-- Alinha os registros existentes ao funil de vendas de seis etapas.

update public.leads
set stage = case stage
  when 'Mapeado' then 'Novo'
  when 'Contato iniciado' then 'Novo'
  when 'Engajado' then 'Qualificando'
  when 'Qualificado' then 'Qualificando'
  when 'Diagnóstico' then 'Qualificando'
  when 'Solução apresentada' then 'Proposta'
  when 'Proposta enviada' then 'Proposta'
  when 'Negociação' then 'Negociação'
  when 'Fechado ganho' then 'Ganho'
  when 'Fechado perdido' then 'Perdido'
  when 'Novo' then 'Novo'
  when 'Qualificando' then 'Qualificando'
  when 'Proposta' then 'Proposta'
  when 'Ganho' then 'Ganho'
  when 'Perdido' then 'Perdido'
  else 'Novo'
end;

alter table public.leads
  drop constraint if exists leads_stage_check;

alter table public.leads
  add constraint leads_stage_check
  check (stage in ('Novo', 'Qualificando', 'Negociação', 'Proposta', 'Ganho', 'Perdido'));

alter table public.whatsapp_conversations
  drop constraint if exists whatsapp_conversations_qualification_status_check;

update public.whatsapp_conversations
set qualification_status = case qualification_status
  when 'new' then 'new'
  when 'qualifying' then 'qualifying'
  when 'qualified' then 'negotiation'
  when 'not_interested' then 'lost'
  when 'mistake' then 'lost'
  when 'spam' then 'lost'
  when 'negotiation' then 'negotiation'
  when 'proposal' then 'proposal'
  when 'won' then 'won'
  when 'lost' then 'lost'
  else 'new'
end;

alter table public.whatsapp_conversations
  add constraint whatsapp_conversations_qualification_status_check
  check (qualification_status in ('new', 'qualifying', 'negotiation', 'proposal', 'won', 'lost'));

update public.crm_funnel_events
set from_status = case from_status
    when 'qualified' then 'negotiation'
    when 'not_interested' then 'lost'
    when 'mistake' then 'lost'
    when 'spam' then 'lost'
    else from_status
  end,
  to_status = case to_status
    when 'qualified' then 'negotiation'
    when 'not_interested' then 'lost'
    when 'mistake' then 'lost'
    when 'spam' then 'lost'
    else to_status
  end,
  from_stage = case from_stage
    when 'Mapeado' then 'Novo'
    when 'Contato iniciado' then 'Novo'
    when 'Engajado' then 'Qualificando'
    when 'Qualificado' then 'Qualificando'
    when 'Diagnóstico' then 'Qualificando'
    when 'Solução apresentada' then 'Proposta'
    when 'Proposta enviada' then 'Proposta'
    when 'Fechado ganho' then 'Ganho'
    when 'Fechado perdido' then 'Perdido'
    else from_stage
  end,
  to_stage = case to_stage
    when 'Mapeado' then 'Novo'
    when 'Contato iniciado' then 'Novo'
    when 'Engajado' then 'Qualificando'
    when 'Qualificado' then 'Qualificando'
    when 'Diagnóstico' then 'Qualificando'
    when 'Solução apresentada' then 'Proposta'
    when 'Proposta enviada' then 'Proposta'
    when 'Fechado ganho' then 'Ganho'
    when 'Fechado perdido' then 'Perdido'
    else to_stage
  end
where from_status in ('qualified', 'not_interested', 'mistake', 'spam')
   or to_status in ('qualified', 'not_interested', 'mistake', 'spam')
   or from_stage in ('Mapeado', 'Contato iniciado', 'Engajado', 'Qualificado', 'Diagnóstico', 'Solução apresentada', 'Proposta enviada', 'Fechado ganho', 'Fechado perdido')
   or to_stage in ('Mapeado', 'Contato iniciado', 'Engajado', 'Qualificado', 'Diagnóstico', 'Solução apresentada', 'Proposta enviada', 'Fechado ganho', 'Fechado perdido');
