import Image from "next/image";
import Link from "next/link";

import { getProfileDisplayName } from "@/lib/auth/access";
import { requireCurrentAdmin } from "@/lib/auth/session";
import { formatCurrency, formatShortDate } from "@/lib/crm/dashboard";
import { listLeads } from "@/lib/crm/leads-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LeadsPage() {
  const { profile, user } = await requireCurrentAdmin();
  const adminName = getProfileDisplayName(
    profile,
    user.email ?? "Administrador"
  );
  const supabase = await createSupabaseServerClient();
  const leads = await listLeads(supabase);

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
          <Link className="navItem" href="/">
            <span className="navDot" />
            Visão geral
          </Link>
          <Link className="navItem navItemActive" href="/leads">
            <span className="navDot" />
            Leads
          </Link>
          <Link className="navItem" href="/integracoes/whatsapp">
            <span className="navDot" />
            WhatsApp
          </Link>
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

      <main className="mainContent">
        <header className="pageHeader">
          <div>
            <p className="eyebrow accentText">Pipeline comercial</p>
            <h1>Leads e oportunidades</h1>
            <p className="headerDescription">
              Cadastro operacional dos leads da Porto Alegre Oficial, com etapa,
              valor, probabilidade e próxima ação.
            </p>
          </div>
          <div className="headerMeta">
            <span>Base Supabase</span>
            <strong>{leads.length} leads</strong>
          </div>
        </header>

        <section className="sectionBlock">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Operação</p>
              <h2>Lista de leads</h2>
            </div>
            <Link className="primaryLinkButton" href="/leads/novo">
              Novo lead
            </Link>
          </div>

          {leads.length ? (
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Origem</th>
                    <th>Etapa</th>
                    <th>Valor</th>
                    <th>Prob.</th>
                    <th>Próxima ação</th>
                    <th>Prazo</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <strong>{lead.companyName}</strong>
                        <span>{lead.contactName}</span>
                      </td>
                      <td>{lead.source}</td>
                      <td>
                        <span className="statusBadge">{lead.stage}</span>
                      </td>
                      <td>{formatCurrency(lead.estimatedValue)}</td>
                      <td>{lead.probability}%</td>
                      <td>{lead.nextAction}</td>
                      <td>{formatShortDate(lead.nextActionAt)}</td>
                      <td>
                        <Link className="tableAction" href={`/leads/${lead.id}`}>
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="emptyState">
              <h3>Nenhum lead cadastrado ainda</h3>
              <p>
                Cadastre a primeira oportunidade para alimentar o pipeline real
                do CRM.
              </p>
              <Link className="primaryLinkButton" href="/leads/novo">
                Cadastrar primeiro lead
              </Link>
            </div>
          )}
        </section>
      </main>
      <div className="brandRuler" aria-hidden="true" />
    </div>
  );
}
