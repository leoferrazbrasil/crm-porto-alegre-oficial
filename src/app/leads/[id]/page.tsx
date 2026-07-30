import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProfileDisplayName } from "@/lib/auth/access";
import { requireCurrentAdmin } from "@/lib/auth/session";
import { getLeadById } from "@/lib/crm/leads-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LeadForm } from "../LeadForm";

interface EditLeadPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditLeadPage({ params }: EditLeadPageProps) {
  const { id } = await params;
  const { profile, user } = await requireCurrentAdmin();
  const adminName = getProfileDisplayName(
    profile,
    user.email ?? "Administrador"
  );
  const supabase = await createSupabaseServerClient();
  const lead = await getLeadById(supabase, id);

  if (!lead) {
    notFound();
  }

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
            <p className="eyebrow accentText">Edição de oportunidade</p>
            <h1>{lead.companyName}</h1>
            <p className="headerDescription">
              Atualize etapa, valores e próxima ação para manter a rotina
              comercial sob controle.
            </p>
          </div>
          <div className="headerMeta">
            <span>Responsável</span>
            <strong>{lead.owner}</strong>
          </div>
        </header>

        <section className="sectionBlock">
          <LeadForm lead={lead} mode="edit" />
        </section>
      </main>
      <div className="brandRuler" aria-hidden="true" />
    </div>
  );
}
