import { CrmSidebar } from "@/components/crm/CrmSidebar";
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
      <CrmSidebar adminName={adminName} activeItem="leads" />

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
