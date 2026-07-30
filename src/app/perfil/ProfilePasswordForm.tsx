"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { initialAuthFormState } from "@/lib/auth/form-state";
import { updateProfilePasswordAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="authButton" disabled={pending} type="submit">
      {pending ? "Atualizando..." : "Alterar senha"}
    </button>
  );
}

export function ProfilePasswordForm() {
  const [state, formAction] = useActionState(
    updateProfilePasswordAction,
    initialAuthFormState
  );

  return (
    <form action={formAction} className="authForm profilePasswordForm">
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
