import { CrmSidebar } from "@/components/crm/CrmSidebar";
import { getProfileDisplayName } from "@/lib/auth/access";
import { requireCurrentAdmin } from "@/lib/auth/session";
import { ProfilePasswordForm } from "./ProfilePasswordForm";

export default async function ProfilePage() {
  const { profile, user } = await requireCurrentAdmin();
  const adminName = getProfileDisplayName(
    profile,
    user.email ?? "Administrador"
  );

  return (
    <div className="appShell">
      <CrmSidebar adminName={adminName} activeItem="profile" />

      <main className="mainContent profileContent">
        <header className="pageHeader">
          <div>
            <p className="eyebrow accentText">Conta do usuário</p>
            <h1>Perfil administrativo</h1>
            <p className="headerDescription">
              Gerencie os dados básicos da sua conta e altere sua senha de
              acesso ao CRM.
            </p>
          </div>
          <div className="headerMeta">
            <span>Sessão protegida</span>
            <strong>{profile.role === "admin" ? "Administrador" : profile.role}</strong>
          </div>
        </header>

        <section className="profileGrid" aria-label="Dados do perfil">
          <article className="profileCard">
            <p className="eyebrow">Identificação</p>
            <h2>{adminName}</h2>
            <dl className="profileDetails">
              <div>
                <dt>E-mail</dt>
                <dd>{user.email ?? "Não informado"}</dd>
              </div>
              <div>
                <dt>Função</dt>
                <dd>{profile.role === "admin" ? "Administrador" : profile.role}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{profile.status === "active" ? "Ativo" : profile.status}</dd>
              </div>
            </dl>
          </article>

          <article className="profileCard">
            <p className="eyebrow">Segurança</p>
            <h2>Alterar senha</h2>
            <p className="profileHelp">
              A alteração será aplicada à conta autenticada no Supabase e a
              sessão atual continuará ativa.
            </p>
            <ProfilePasswordForm />
          </article>
        </section>
      </main>
      <div className="brandRuler" aria-hidden="true" />
    </div>
  );
}
