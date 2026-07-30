import Image from "next/image";
import Link from "next/link";

import {
  buildDashboardViewModel,
  formatCurrency,
  formatShortDate
} from "@/lib/crm/dashboard";
import { mockLeads, mockTasks } from "@/lib/crm/mock-data";
import { getProfileDisplayName } from "@/lib/auth/access";
import { requireCurrentAdmin } from "@/lib/auth/session";

const referenceDate = new Date("2026-07-30T15:00:00.000Z");

export default async function Home() {
  const { profile, user } = await requireCurrentAdmin();
  const adminName = getProfileDisplayName(
    profile,
    user.email ?? "Administrador"
  );
  const dashboard = buildDashboardViewModel(
    mockLeads,
    mockTasks,
    referenceDate
  );
  const { summary } = dashboard;

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="logoChip">
          <Image
            src="/logo-porto-alegre-oficial.png"
            alt="Porto Alegre Oficial"
            width={140}
            height={132}
            priority
          />
        </div>

        <nav aria-label="Navegação principal">
          <a className="navItem navItemActive" href="#visao-geral">
            <span className="navDot" />
            Visão geral
          </a>
          <a className="navItem" href="#pipeline">
            <span className="navDot" />
            Pipeline
          </a>
          <a className="navItem" href="#oportunidades">
            <span className="navDot" />
            Oportunidades
          </a>
          <a className="navItem" href="#rotina">
            <span className="navDot" />
            Rotina comercial
          </a>
          <a className="navItem" href="#metas">
            <span className="navDot" />
            Metas
          </a>
          <Link className="navItem" href="/perfil">
            <span className="navDot" />
            Perfil
          </Link>
        </nav>

        <div className="sidebarFooter">
          <span className="eyebrow">Acesso atual</span>
          <Link className="profileUserLink" href="/perfil">
            {adminName}
          </Link>
          <span>Administrador do CRM</span>
          <form action="/auth/sign-out" method="post">
            <button className="signOutButton" type="submit">
              Sair
            </button>
          </form>
        </div>
      </aside>

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
            <span>Dados simulados · sessão protegida</span>
            <strong>30 de julho de 2026</strong>
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
