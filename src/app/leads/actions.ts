"use server";

import { revalidatePath } from "next/cache";

import type { AuthFormState } from "@/lib/auth/form-state";
import { requireCurrentAdmin } from "@/lib/auth/session";
import {
  createSupabaseLeadGateway,
  type SupabaseLeadGateway
} from "@/lib/crm/leads-repository";
import { buildLeadPayload, parseLeadForm } from "@/lib/crm/leads";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LeadMutationGateway = SupabaseLeadGateway;

export async function createLeadRecord(
  gateway: LeadMutationGateway,
  ownerId: string,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = parseLeadForm(formData);

  if (parsed.status === "error") {
    return {
      status: "error",
      message: parsed.message
    };
  }

  const result = await gateway.createLead(buildLeadPayload(parsed.data, ownerId));

  if (!result.ok) {
    return {
      status: "error",
      message: "Não foi possível salvar o lead."
    };
  }

  return {
    status: "success",
    message: "Lead cadastrado com sucesso."
  };
}

export async function updateLeadRecord(
  gateway: LeadMutationGateway,
  id: string,
  ownerId: string,
  formData: FormData
): Promise<AuthFormState> {
  if (!id.trim()) {
    return {
      status: "error",
      message: "Lead não encontrado para esta operação."
    };
  }

  const parsed = parseLeadForm(formData);

  if (parsed.status === "error") {
    return {
      status: "error",
      message: parsed.message
    };
  }

  const result = await gateway.updateLead(
    id,
    buildLeadPayload(parsed.data, ownerId)
  );

  if (!result.ok) {
    return {
      status: "error",
      message: "Não foi possível atualizar o lead."
    };
  }

  return {
    status: "success",
    message: "Lead atualizado com sucesso."
  };
}

export async function deleteLeadRecord(
  gateway: LeadMutationGateway,
  id: string
): Promise<AuthFormState> {
  if (!id.trim()) {
    return {
      status: "error",
      message: "Lead não encontrado para esta operação."
    };
  }

  const result = await gateway.deleteLead(id);

  if (!result.ok) {
    return {
      status: "error",
      message: "Não foi possível remover o lead."
    };
  }

  return {
    status: "success",
    message: "Lead removido com sucesso."
  };
}

export async function createLeadAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const { profile } = await requireCurrentAdmin();
  const supabase = await createSupabaseServerClient();
  const result = await createLeadRecord(
    createSupabaseLeadGateway(supabase),
    profile.id,
    formData
  );

  revalidateCrmPages();
  return result;
}

export async function updateLeadAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const { profile } = await requireCurrentAdmin();
  const supabase = await createSupabaseServerClient();
  const id = String(formData.get("id") ?? "");
  const result = await updateLeadRecord(
    createSupabaseLeadGateway(supabase),
    id,
    profile.id,
    formData
  );

  revalidateCrmPages(id);
  return result;
}

export async function deleteLeadAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  await requireCurrentAdmin();
  const supabase = await createSupabaseServerClient();
  const id = String(formData.get("id") ?? "");
  const result = await deleteLeadRecord(createSupabaseLeadGateway(supabase), id);

  revalidateCrmPages(id);
  return result;
}

function revalidateCrmPages(id?: string) {
  revalidatePath("/");
  revalidatePath("/leads");

  if (id) {
    revalidatePath(`/leads/${id}`);
  }
}
