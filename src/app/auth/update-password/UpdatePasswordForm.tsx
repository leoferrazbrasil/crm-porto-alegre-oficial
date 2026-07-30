"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { initialAuthFormState } from "@/lib/auth/form-state";
import { updatePasswordAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="authButton" disabled={pending} type="submit">
      {pending ? "Atualizando..." : "Atualizar senha"}
    </button>
  );
}

export function UpdatePasswordForm() {
  const [state, formAction] = useActionState(
    updatePasswordAction,
    initialAuthFormState
  );

  return (
    <form action={formAction} className="authForm">
      <label>
        Nova senha
        <input
          autoComplete="new-password"
          minLength={6}
          name="password"
          placeholder="Digite a nova senha"
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
