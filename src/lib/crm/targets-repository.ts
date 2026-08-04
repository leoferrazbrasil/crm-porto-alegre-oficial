import type { SupabaseClient } from "@supabase/supabase-js";

export interface MonthlyTargetInput {
  monthStart: string;
  revenueTarget: number;
}

export async function getMonthlyRevenueTarget(
  client: SupabaseClient,
  monthStart: string
): Promise<number> {
  const { data, error } = await client
    .from("crm_monthly_targets")
    .select("revenue_target")
    .eq("month_start", monthStart)
    .maybeSingle();

  if (error || !data) return 0;
  const value = Number((data as { revenue_target?: unknown }).revenue_target);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export async function upsertMonthlyRevenueTarget(
  client: SupabaseClient,
  input: MonthlyTargetInput,
  updatedBy: string
): Promise<{ ok: boolean; message?: string; revenueTarget?: number }> {
  const { data, error } = await client
    .from("crm_monthly_targets")
    .upsert(
      {
        month_start: input.monthStart,
        revenue_target: input.revenueTarget,
        updated_by: updatedBy
      },
      { onConflict: "month_start" }
    )
    .select("revenue_target")
    .single();

  if (error || !data) {
    return { ok: false, message: error?.message ?? "Não foi possível salvar a meta." };
  }

  return {
    ok: true,
    revenueTarget: Number((data as { revenue_target: number }).revenue_target)
  };
}

export function parseMonthlyTargetInput(value: unknown): MonthlyTargetInput | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as { monthStart?: unknown; revenueTarget?: unknown };
  const monthStart = typeof payload.monthStart === "string" ? payload.monthStart : "";
  if (!isMonthStart(monthStart)) return null;

  if (
    typeof payload.revenueTarget !== "number" &&
    typeof payload.revenueTarget !== "string"
  ) {
    return null;
  }
  if (typeof payload.revenueTarget === "string" && payload.revenueTarget.trim() === "") {
    return null;
  }

  const revenueTarget = Number(payload.revenueTarget);
  if (!Number.isFinite(revenueTarget) || revenueTarget < 0) return null;

  return { monthStart, revenueTarget };
}

function isMonthStart(value: string): boolean {
  if (!/^\d{4}-\d{2}-01$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return date.toISOString().slice(0, 10) === value;
}
