import Image from "next/image";
import Link from "next/link";

import { getProfileDisplayName } from "@/lib/auth/access";
import { requireCurrentAdmin } from "@/lib/auth/session";
import { WhatsAppConnectionPanel } from "./WhatsAppConnectionPanel";

export default async function WhatsAppIntegrationPage() {
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
          <Link className="navItem" href="/leads">
            <span className="navDot" />
            Leads
          </Link>
          <Link className="navItem navItemActive" href="/integracoes/whatsapp">
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
            <p className="eyebrow accentText">Integrações</p>
            <h1>WhatsApp via Z-API</h1>
            <p className="headerDescription">
              Conecte a instância autorizada por QR Code e acompanhe o status
              da sessão sem expor credenciais no navegador.
            </p>
          </div>
          <div className="headerMeta">
            <span>V1 segura</span>
            <strong>Sem disparos automáticos</strong>
          </div>
        </header>

        <section className="sectionBlock">
          <WhatsAppConnectionPanel />
        </section>
      </main>
      <div className="brandRuler" aria-hidden="true" />
    </div>
  );
}
