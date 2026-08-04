import { CrmSidebar } from "@/components/crm/CrmSidebar";
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
      <CrmSidebar adminName={adminName} activeItem="conversations" />

      <main className="mainContent">
        <header className="pageHeader">
          <div>
            <p className="eyebrow accentText">Atendimento comercial</p>
            <h1>Conversas iniciadas pelos leads</h1>
            <p className="headerDescription">
              Receba os contatos originados pela landing page e conduza o
              primeiro atendimento manual pelo WhatsApp conectado.
            </p>
          </div>
          <div className="headerMeta">
            <span>WhatsApp via Z-API</span>
            <strong>Inbound · texto manual</strong>
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
