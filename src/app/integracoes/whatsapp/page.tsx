import { CrmSidebar } from "@/components/crm/CrmSidebar";
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
      <CrmSidebar adminName={adminName} activeItem="whatsapp" />

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
