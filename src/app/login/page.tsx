import Image from "next/image";
import Link from "next/link";

import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="authPage">
      <section className="authPanel" aria-labelledby="login-title">
        <Image
          src="/logo-porto-alegre-oficial.png"
          alt="Porto Alegre Oficial"
          width={96}
          height={91}
          priority
        />
        <p className="eyebrow accentText">Acesso administrativo</p>
        <h1 id="login-title">Entrar no CRM</h1>
        <p>
          Acesso restrito à operação comercial da Porto Alegre Oficial.
        </p>
        <LoginForm />
        <Link className="authLink" href="/auth/reset-password">
          Recuperar ou trocar senha
        </Link>
      </section>
    </main>
  );
}
