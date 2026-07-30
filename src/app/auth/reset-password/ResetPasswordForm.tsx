"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { initialAuthFormState } from "@/lib/auth/form-state";
import { resetPasswordAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="authButton" disabled={pending} type="submit">
      {pending ? "Enviando..." : "Enviar instruções"}
    </button>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(
    resetPasswordAction,
    initialAuthFormState
  );

  return (
    <form action={formAction} className="authForm">
      <label>
        E-mail administrativo
        <input
          autoComplete="email"
          name="email"
          placeholder="leonardoferrazbrasil@gmail.com"
          required
          type="email"
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
