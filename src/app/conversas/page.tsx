import Image from "next/image";
import Link from "next/link";

import { getProfileDisplayName } from "@/lib/auth/access";
import { requireCurrentAdmin } from "@/lib/auth/session";
import { WhatsAppInboxPanel } from "./WhatsAppInboxPanel";

export default async function ConversationsPage() {
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
          <Link className="navItem navItemActive" href="/conversas">
            <span className="navDot" />
            Conversas
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
            <p className="eyebrow accentText">Atendimento comercial</p>
            <h1>Conversas iniciadas pelos leads</h1>
            <p className="headerDescription">
              Acompanhe os chats do WhatsApp conectado ao tráfego pago em uma
              visão operacional somente leitura.
            </p>
          </div>
          <div className="headerMeta">
            <span>WhatsApp via Z-API</span>
            <strong>V1 · somente leitura</strong>
          </div>
        </header>

        <section className="sectionBlock">
          <WhatsAppInboxPanel />
        </section>
      </main>
      <div className="brandRuler" aria-hidden="true" />
    </div>
  );
}
