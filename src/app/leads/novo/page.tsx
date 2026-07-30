import Image from "next/image";
import Link from "next/link";

import { getProfileDisplayName } from "@/lib/auth/access";
import { requireCurrentAdmin } from "@/lib/auth/session";
import { LeadForm } from "../LeadForm";

export default async function NewLeadPage() {
  const { profile, user } = await requireCurrentAdmin();
  const adminName = getProfileDisplayName(
    profile,
    user.email ?? "Administrador"
  );

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
            <p className="eyebrow accentText">Novo cadastro</p>
            <h1>Cadastrar lead</h1>
            <p className="headerDescription">
              Registre uma oportunidade comercial com origem, etapa, valor,
              probabilidade e próxima ação definida.
            </p>
          </div>
        </header>

        <section className="sectionBlock">
          <LeadForm mode="create" />
        </section>
      </main>
      <div className="brandRuler" aria-hidden="true" />
    </div>
  );
}
