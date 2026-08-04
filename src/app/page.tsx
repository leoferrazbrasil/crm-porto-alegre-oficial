import {
  buildDashboardViewModel,
  formatCurrency,
  formatShortDate
} from "@/lib/crm/dashboard";
import { listLeads } from "@/lib/crm/leads-repository";
import { getFunnelMetrics } from "@/lib/crm/funnel-metrics-repository";
import { calculateTargetPacing } from "@/lib/crm/target-pacing";
import { getMonthlyRevenueTarget } from "@/lib/crm/targets-repository";
import { mockLeads, mockTasks } from "@/lib/crm/mock-data";
import { getProfileDisplayName } from "@/lib/auth/access";
import { requireCurrentAdmin } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CrmSidebar } from "@/components/crm/CrmSidebar";
import { MonthlyRevenueTargetForm } from "./MonthlyRevenueTargetForm";

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
  const monthStart = currentMonthStart(referenceDate);
  const funnelMetrics = await getFunnelMetrics(supabase, period);
  const monthlyTarget = await getMonthlyRevenueTarget(supabase, monthStart);
  const targetPacing = calculateTargetPacing(funnelMetrics, monthlyTarget, period);
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
  const { openTasks } = dashboard;

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

        <section className="sectionBlock funnelMetricsBlock" aria-label="Indicadores de faturamento e funil do mês">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Aquisição, conversão e meta</p>
              <h2>Indicadores do mês</h2>
              <p className="sectionLead">
                Valores observados no período e ritmo calculado a partir da meta mensal.
              </p>
            </div>
            <MonthlyRevenueTargetForm monthStart={monthStart} initialTarget={monthlyTarget} />
          </div>

          <div className="funnelMetricGrid primaryMetricGrid">
            <MetricCard label="Conversas iniciadas" value={funnelMetrics.conversationsStarted} />
            <MetricCard label="Negociações realizadas" value={funnelMetrics.negotiations} />
            <MetricCard label="Vendas fechadas" value={funnelMetrics.salesClosed} />
            <MetricCard label="Ticket médio" value={formatNullableCurrency(funnelMetrics.averageTicket)} />
            <MetricCard label="Faturamento gerado no período" value={formatCurrency(funnelMetrics.revenueGenerated)} />
            <MetricCard label="Meta de faturamento mensal" value={formatCurrency(monthlyTarget)} />
          </div>

          <div className="funnelMetricDetails rateMetricDetails">
            <div>
              <span>Taxa: Conversa → Negociação</span>
              <strong>{formatMetricRate(funnelMetrics.rates.conversationToNegotiation)}</strong>
            </div>
            <div>
              <span>Taxa: Negociação → Venda</span>
              <strong>{formatMetricRate(funnelMetrics.rates.negotiationToSale)}</strong>
            </div>
            <div>
              <span>Taxa: Conversa → Venda</span>
              <strong>{formatMetricRate(funnelMetrics.rates.conversationToSale)}</strong>
            </div>
          </div>

          <div className="funnelMetricDetails pacingMetricDetails">
            <div>
              <span>Contatos necessários por venda por dia para bater a meta</span>
              <strong>{formatNullableCount(targetPacing.conversationsPerDay)}</strong>
            </div>
            <div>
              <span>Negociações necessárias por venda por dia para bater a meta</span>
              <strong>{formatNullableCount(targetPacing.negotiationsPerDay)}</strong>
            </div>
            <div>
              <span>Vendas necessárias para a meta</span>
              <strong>{formatNullableCount(targetPacing.salesNeeded)}</strong>
            </div>
          </div>

          <div className="funnelMetricDetails operationalMetricDetails">
            <div>
              <span>Contatos válidos</span>
              <strong>{funnelMetrics.validContacts}</strong>
            </div>
            <div>
              <span>Em qualificação</span>
              <strong>{funnelMetrics.qualifyingContacts}</strong>
            </div>
            <div>
              <span>Qualificados</span>
              <strong>{funnelMetrics.qualifiedContacts}</strong>
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

        <section className="sectionBlock routineSection" id="rotina">
          <aside className="taskPanel">
            <p className="eyebrow lightEyebrow">Agenda</p>
            <h2>Rotina imediata</h2>
            <div className="taskList">
              {openTasks.map((task) => (
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
        </section>

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

function MetricCard({ label, value }: { label: string; value: number | string }) {
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

function formatNullableCurrency(value: number | null): string {
  return value === null ? "—" : formatCurrency(value);
}

function formatNullableCount(value: number | null): string {
  return value === null ? "—" : String(value);
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

function currentMonthStart(referenceDate: Date): string {
  return `${referenceDate.getUTCFullYear()}-${String(referenceDate.getUTCMonth() + 1).padStart(2, "0")}-01`;
}
