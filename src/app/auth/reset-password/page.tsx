import Link from "next/link";

import { ResetPasswordForm } from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="authPage">
      <section className="authPanel" aria-labelledby="reset-title">
        <p className="eyebrow accentText">Senha administrativa</p>
        <h1 id="reset-title">Recuperar acesso</h1>
        <p>
          Informe o e-mail administrativo para receber as instruções de acesso.
        </p>
        <ResetPasswordForm />
        <Link className="authLink" href="/login">
          Voltar para login
        </Link>
      </section>
    </main>
  );
}
