import Link from "next/link";

import { UpdatePasswordForm } from "./UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <main className="authPage">
      <section className="authPanel" aria-labelledby="update-title">
        <p className="eyebrow accentText">Senha administrativa</p>
        <h1 id="update-title">Definir nova senha</h1>
        <p>
          Crie uma senha de acesso para continuar usando o CRM.
        </p>
        <UpdatePasswordForm />
        <Link className="authLink" href="/login">
          Voltar para login
        </Link>
      </section>
    </main>
  );
}
