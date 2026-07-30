alter type public.crm_role add value if not exists 'admin';

drop policy if exists "operator manages profiles" on public.profiles;
create policy "administrators manage profiles"
on public.profiles for all
to authenticated
using (public.current_crm_role()::text in ('admin', 'operator'))
with check (public.current_crm_role()::text in ('admin', 'operator'));

drop policy if exists "operator manages leads" on public.leads;
create policy "administrators manage leads"
on public.leads for all
to authenticated
using (public.current_crm_role()::text in ('admin', 'operator'))
with check (public.current_crm_role()::text in ('admin', 'operator'));

drop policy if exists "operator manages tasks" on public.commercial_tasks;
create policy "administrators manage tasks"
on public.commercial_tasks for all
to authenticated
using (public.current_crm_role()::text in ('admin', 'operator'))
with check (public.current_crm_role()::text in ('admin', 'operator'));

drop policy if exists "operator creates events" on public.crm_events;
create policy "administrators create events"
on public.crm_events for insert
to authenticated
with check (
  public.current_crm_role()::text in ('admin', 'operator')
  and actor_id = auth.uid()
);
