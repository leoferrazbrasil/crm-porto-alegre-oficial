import { CrmSidebar } from "@/components/crm/CrmSidebar";
import { PipelineKanban } from "@/components/crm/PipelineKanban";
import { getProfileDisplayName } from "@/lib/auth/access";
import { calculateCrmSummary } from "@/lib/crm/metrics";
import { buildKanbanColumns } from "@/lib/crm/kanban";
import { listLeads } from "@/lib/crm/leads-repository";
import { formatCurrency } from "@/lib/crm/dashboard";
import { requireCurrentAdmin } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function FunilPage() {
  const { profile, user } = await requireCurrentAdmin();
  const adminName = getProfileDisplayName(profile, user.email ?? "Administrador");
  const supabase = await createSupabaseServerClient();
  const leads = await listLeads(supabase);
  const summary = calculateCrmSummary(leads);
  const columns = buildKanbanColumns(leads);

  return (
    <div className="appShell">
      <CrmSidebar adminName={adminName} activeItem="funnel" />
      <main className="mainContent">
        <header className="pageHeader">
          <div>
            <p className="eyebrow accentText">Operação comercial</p>
            <h1>Funil de Vendas</h1>
            <p className="headerDescription">
              Visualize cada oportunidade na etapa correta e conduza a próxima ação do funil.
            </p>
          </div>
          <div className="headerMeta">
            <span>Base Supabase</span>
            <strong>{leads.length} leads</strong>
          </div>
        </header>

        <section className="pipelineSummaryGrid" aria-label="Resumo do funil de vendas">
          <article className="kpiCard">
            <span>Oportunidades ativas</span>
            <strong>{summary.activeOpportunities}</strong>
            <small>{summary.totalLeads} leads cadastrados</small>
          </article>
          <article className="kpiCard">
            <span>Funil aberto</span>
            <strong>{formatCurrency(summary.pipelineValue)}</strong>
            <small>Valor potencial das oportunidades</small>
          </article>
          <article className="kpiCard">
            <span>Forecast ponderado</span>
            <strong>{formatCurrency(summary.weightedForecast)}</strong>
            <small>Probabilidade aplicada por etapa</small>
          </article>
          <article className="kpiCard">
            <span>Propostas abertas</span>
            <strong>{summary.proposalsOpen}</strong>
            <small>Proposta ou negociação</small>
          </article>
        </section>

        <section className="sectionBlock" aria-label="Quadro do funil de vendas">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Kanban do funil de vendas</p>
              <h2>Etapas do funil</h2>
            </div>
            <span className="sectionNote">Uma oportunidade, uma etapa</span>
          </div>

          {leads.length ? (
            <PipelineKanban columns={columns} />
          ) : (
            <div className="emptyState">
              <h3>Nenhum lead cadastrado ainda</h3>
              <p>Cadastre a primeira oportunidade para alimentar o funil real do CRM.</p>
            </div>
          )}
        </section>
      </main>
      <div className="brandRuler" aria-hidden="true" />
    </div>
  );
}
