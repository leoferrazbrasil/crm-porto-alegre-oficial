"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { initialAuthFormState } from "@/lib/auth/form-state";
import { loginAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="authButton" disabled={pending} type="submit">
      {pending ? "Entrando..." : "Entrar no CRM"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(
    loginAction,
    initialAuthFormState
  );

  return (
    <form action={formAction} className="authForm">
      <label>
        E-mail
        <input
          autoComplete="email"
          name="email"
          placeholder="leonardoferrazbrasil@gmail.com"
          required
          type="email"
        />
      </label>

      <label>
        Senha
        <input
          autoComplete="current-password"
          name="password"
          placeholder="Senha de acesso"
          required
          type="password"
        />
      </label>

      {state.message ? (
        <p className={`authMessage authMessage${state.status}`}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
