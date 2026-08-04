import {
  buildDashboardViewModel,
  formatCurrency,
  formatShortDate
} from "@/lib/crm/dashboard";
import { listLeads } from "@/lib/crm/leads-repository";
import { getFunnelMetrics } from "@/lib/crm/funnel-metrics-repository";
import { mockLeads, mockTasks } from "@/lib/crm/mock-data";
import { getProfileDisplayName } from "@/lib/auth/access";
import { requireCurrentAdmin } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CrmSidebar } from "@/components/crm/CrmSidebar";

export default async function Home() {
  const { profile, user } = await requireCurrentAdmin();
  const adminName = getProfileDisplayName(
    profile,
    user.email ?? "Administrador"
  );
  const supabase = await createSupabaseServerClient();
  const persistedLeads = await listLeads(supabase);
  const referenceDate = new Date();
  const period = currentMonthPeriod(referenceDate);
  const funnelMetrics = await getFunnelMetrics(supabase, period);
  const leads = persistedLeads.length ? persistedLeads : mockLeads;
  const dataLabel = persistedLeads.length
    ? "Dados reais · sessão protegida"
    : "Dados simulados · sessão protegida";
  const dashboard = buildDashboardViewModel(
    leads,
    mockTasks,
    referenceDate,
    funnelMetrics
  );
  const { summary } = dashboard;

  return (
    <div className="appShell">
      <CrmSidebar adminName={adminName} activeItem="overview" />

      <main className="mainContent" id="visao-geral">
        <header className="pageHeader">
          <div>
            <p className="eyebrow accentText">Operação comercial</p>
            <h1>Visão geral do CRM</h1>
            <p className="headerDescription">
              Pipeline, próximas ações e metas da Porto Alegre Oficial em uma
              única rotina operacional.
            </p>
          </div>
          <div className="headerMeta">
            <span>{dataLabel}</span>
            <strong>{formatMonthLabel(referenceDate)}</strong>
          </div>
        </header>

        <section className="kpiGrid" aria-label="Indicadores comerciais">
          <article className="kpiCard">
            <span>Oportunidades ativas</span>
            <strong>{summary.activeOpportunities}</strong>
            <small>{summary.totalLeads} leads cadastrados</small>
          </article>
          <article className="kpiCard">
            <span>Pipeline aberto</span>
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
            <small>Proposta enviada ou negociação</small>
          </article>
          <article className="kpiCard">
            <span>Conversão decidida</span>
            <strong>{summary.conversionRate.toFixed(0)}%</strong>
            <small>
              {summary.wonDeals} ganho · {summary.lostDeals} perdido
            </small>
          </article>
          <article className="kpiCard kpiAttention">
            <span>Próximas ações vencidas</span>
            <strong>{summary.overdueNextActions}</strong>
            <small>Exigem atualização imediata</small>
          </article>
        </section>

        <section className="sectionBlock funnelMetricsBlock" aria-label="Funil inbound do mês">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Aquisição e conversão</p>
              <h2>Funil inbound do mês</h2>
            </div>
            <span className="sectionNote">Conversas únicas · coorte pela entrada</span>
          </div>

          <div className="funnelMetricGrid">
            <MetricCard label="Conversas iniciadas" value={funnelMetrics.conversationsStarted} />
            <MetricCard label="Contatos válidos" value={funnelMetrics.validContacts} />
            <MetricCard label="Em qualificação" value={funnelMetrics.qualifyingContacts} />
            <MetricCard label="Qualificados" value={funnelMetrics.qualifiedContacts} />
            <MetricCard label="Leads criados" value={funnelMetrics.leadsCreated} />
            <MetricCard label="Negociações" value={funnelMetrics.negotiations} />
            <MetricCard label="Fechados ganhos" value={funnelMetrics.wonDeals} />
            <MetricCard label="Fechados perdidos" value={funnelMetrics.lostDeals} />
          </div>

          <div className="funnelMetricDetails">
            <div>
              <span>Taxa de contato válido</span>
              <strong>{formatMetricRate(funnelMetrics.rates.validContact)}</strong>
            </div>
            <div>
              <span>Taxa de qualificação</span>
              <strong>{formatMetricRate(funnelMetrics.rates.qualification)}</strong>
            </div>
            <div>
              <span>Avanço para negociação</span>
              <strong>{formatMetricRate(funnelMetrics.rates.negotiation)}</strong>
            </div>
            <div>
              <span>Ganho sobre negociação</span>
              <strong>{formatMetricRate(funnelMetrics.rates.win)}</strong>
            </div>
            <div>
              <span>Aguardando primeira resposta</span>
              <strong>{funnelMetrics.awaitingFirstResponse}</strong>
            </div>
            <div>
              <span>Mediana até primeira resposta</span>
              <strong>{formatResponseMinutes(funnelMetrics.medianFirstResponseMinutes)}</strong>
            </div>
          </div>
        </section>

        <section className="sectionBlock" id="pipeline">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Pipeline</p>
              <h2>Distribuição por etapa</h2>
            </div>
            <span className="sectionNote">Uma oportunidade, um responsável</span>
          </div>

          <div className="pipelineGrid">
            {dashboard.pipeline.map((group, index) => (
              <article className="pipelineCard" key={group.stage}>
                <span className="stageIndex">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <strong>{group.stage}</strong>
                <div>
                  <span>{group.leads.length} leads</span>
                  <span>{formatCurrency(group.totalValue)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="contentGrid">
          <section className="sectionBlock" id="oportunidades">
            <div className="sectionHeader">
              <div>
                <p className="eyebrow">Execução</p>
                <h2>Próximas oportunidades</h2>
              </div>
              <span className="sectionNote">
                Ordenadas pela próxima ação
              </span>
            </div>

            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Etapa</th>
                    <th>Valor</th>
                    <th>Próxima ação</th>
                    <th>Prazo</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.activeLeads.slice(0, 7).map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <strong>{lead.companyName}</strong>
                        <span>{lead.segment}</span>
                      </td>
                      <td>
                        <span className="statusBadge">{lead.stage}</span>
                      </td>
                      <td>{formatCurrency(lead.estimatedValue)}</td>
                      <td>{lead.nextAction}</td>
                      <td>{formatShortDate(lead.nextActionAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="taskPanel" id="rotina">
            <p className="eyebrow lightEyebrow">Agenda</p>
            <h2>Rotina imediata</h2>
            <div className="taskList">
              {dashboard.openTasks.map((task) => (
                <article key={task.id}>
                  <span className={`priority priority${task.priority}`}>
                    {task.priority}
                  </span>
                  <strong>{task.title}</strong>
                  <small>{formatShortDate(task.dueAt)}</small>
                </article>
              ))}
            </div>
          </aside>
        </div>

        <section className="goalGrid" id="metas">
          <article className="goalCard">
            <p className="eyebrow">Semana</p>
            <h2>Ritmo operacional</h2>
            <ul>
              <li>
                <strong>100</strong> contatos realizados
              </li>
              <li>
                <strong>5</strong> respostas qualificadas
              </li>
              <li>
                <strong>3</strong> reuniões comerciais
              </li>
              <li>
                <strong>2</strong> propostas enviadas
              </li>
            </ul>
          </article>
          <article className="goalCard">
            <p className="eyebrow">Primeiros 30 dias</p>
            <h2>Validação comercial</h2>
            <ul>
              <li>
                <strong>400</strong> contatos acumulados
              </li>
              <li>
                <strong>10</strong> diagnósticos
              </li>
              <li>
                <strong>6</strong> propostas
              </li>
              <li>
                <strong>2</strong> pilotos pagos
              </li>
            </ul>
          </article>
          <article className="ownerCard">
            <p className="eyebrow lightEyebrow">Governança</p>
            <h2>Administração compartilhada</h2>
            <p>
              Leonardo e proprietário possuem acesso integral ao CRM, aos
              indicadores e à rotina comercial.
            </p>
            <div className="ownerRule" />
            <small>
              V1 local · sem integração direta com contas do Instagram
            </small>
          </article>
        </section>
      </main>
      <div className="brandRuler" aria-hidden="true" />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="funnelMetricCard">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function formatMetricRate(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(0)}%`;
}

function formatResponseMinutes(value: number | null): string {
  if (value === null) return "—";
  if (value < 60) return `${Math.round(value)} min`;
  return `${(value / 60).toFixed(1)} h`;
}

function formatMonthLabel(value: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  }).format(value);
}

function currentMonthPeriod(referenceDate: Date) {
  const start = new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1)
  );
  const end = new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() + 1, 1)
  );

  return { start: start.toISOString(), end: end.toISOString() };
}
