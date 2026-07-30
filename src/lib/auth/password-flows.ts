import type { AuthFormState } from "./form-state";
import { buildPasswordRecoveryRedirect } from "./callback";

interface PasswordAuthClient {
  auth: {
    signInWithPassword(credentials: {
      email: string;
      password: string;
    }): Promise<{ error: { message: string } | null }>;
  };
}

interface ResetPasswordClient {
  auth: {
    resetPasswordForEmail(
      email: string,
      options: { redirectTo: string }
    ): Promise<{ error: { message: string } | null }>;
  };
}

interface UpdatePasswordClient {
  auth: {
    updateUser(payload: {
      password: string;
    }): Promise<{ error: { message: string } | null }>;
  };
}

export async function authenticateWithPassword(
  client: PasswordAuthClient,
  email: string,
  password: string
): Promise<AuthFormState> {
  const normalizedEmail = email.trim();

  if (!normalizedEmail || !password) {
    return {
      status: "error",
      message: "Informe e-mail e senha para acessar o CRM."
    };
  }

  const { error } = await client.auth.signInWithPassword({
    email: normalizedEmail,
    password
  });

  if (error) {
    return {
      status: "error",
      message: "Não foi possível entrar com esses dados."
    };
  }

  return { status: "success", message: null };
}

export async function requestPasswordReset(
  client: ResetPasswordClient,
  email: string,
  origin: string
): Promise<AuthFormState> {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    return {
      status: "error",
      message: "Informe o e-mail administrativo."
    };
  }

  await client.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: buildPasswordRecoveryRedirect(origin)
  });

  return {
    status: "success",
    message: "Se o e-mail estiver autorizado, enviaremos as instruções de acesso."
  };
}

export async function changePassword(
  client: UpdatePasswordClient,
  password: string
): Promise<AuthFormState> {
  if (password.length < 6) {
    return {
      status: "error",
      message: "A nova senha precisa ter pelo menos 6 caracteres."
    };
  }

  const { error } = await client.auth.updateUser({ password });

  if (error) {
    return {
      status: "error",
      message: "Não foi possível atualizar a senha."
    };
  }

  return {
    status: "success",
    message: "Senha atualizada com sucesso."
  };
}
