"use client";

import { useState } from "react";

interface MonthlyRevenueTargetFormProps {
  monthStart: string;
  initialTarget: number;
}

export function MonthlyRevenueTargetForm({
  monthStart,
  initialTarget
}: MonthlyRevenueTargetFormProps) {
  const [value, setValue] = useState(initialTarget.toFixed(2));
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/metas/faturamento", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthStart, revenueTarget: value })
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) {
        setStatus(result.message ?? "Não foi possível salvar a meta.");
        return;
      }

      setStatus("Meta salva. Atualizando indicadores…");
      window.location.reload();
    } catch {
      setStatus("Não foi possível salvar a meta agora.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="monthlyTargetForm" onSubmit={handleSubmit}>
      <label htmlFor="monthly-revenue-target">Meta de faturamento mensal</label>
      <div className="monthlyTargetFields">
        <span aria-hidden="true">R$</span>
        <input
          id="monthly-revenue-target"
          inputMode="decimal"
          min="0"
          name="revenueTarget"
          onChange={(event) => setValue(event.target.value)}
          step="0.01"
          type="number"
          value={value}
        />
        <button className="secondaryButton" disabled={saving} type="submit">
          {saving ? "Salvando…" : "Salvar meta"}
        </button>
      </div>
      {status ? <small className="monthlyTargetStatus">{status}</small> : null}
    </form>
  );
}
