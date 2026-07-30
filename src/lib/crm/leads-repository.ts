import type { SupabaseClient } from "@supabase/supabase-js";

import {
  type LeadPayload,
  type LeadRow,
  mapLeadRow
} from "@/lib/crm/leads";
import type { Lead } from "@/lib/crm/types";

const LEAD_SELECT = [
  "id",
  "company_name",
  "contact_name",
  "segment",
  "source",
  "instagram_profile",
  "stage",
  "owner_id",
  "estimated_value",
  "recurring_value",
  "probability",
  "next_action",
  "next_action_at",
  "loss_reason",
  "created_at",
  "updated_at"
].join(", ");

export interface LeadMutationResult {
  ok: boolean;
  message?: string;
}

export interface SupabaseLeadGateway {
  createLead(payload: LeadPayload): Promise<LeadMutationResult>;
  updateLead(id: string, payload: LeadPayload): Promise<LeadMutationResult>;
  deleteLead(id: string): Promise<LeadMutationResult>;
}

export async function listLeads(client: SupabaseClient): Promise<Lead[]> {
  const { data, error } = await client
    .from("leads")
    .select(LEAD_SELECT)
    .order("next_action_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as unknown as LeadRow[]).map(mapLeadRow);
}

export async function getLeadById(
  client: SupabaseClient,
  id: string
): Promise<Lead | null> {
  const { data, error } = await client
    .from("leads")
    .select(LEAD_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapLeadRow(data as unknown as LeadRow);
}

export function createSupabaseLeadGateway(
  client: SupabaseClient
): SupabaseLeadGateway {
  return {
    async createLead(payload) {
      const { error } = await client.from("leads").insert(payload);
      return normalizeMutationResult(error);
    },
    async updateLead(id, payload) {
      const { error } = await client.from("leads").update(payload).eq("id", id);
      return normalizeMutationResult(error);
    },
    async deleteLead(id) {
      const { error } = await client.from("leads").delete().eq("id", id);
      return normalizeMutationResult(error);
    }
  };
}

function normalizeMutationResult(
  error: { message?: string } | null
): LeadMutationResult {
  if (error) {
    return {
      ok: false,
      message: error.message
    };
  }

  return { ok: true };
}
