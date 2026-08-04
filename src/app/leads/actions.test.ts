import { describe, expect, it } from "vitest";

import {
  createLeadRecord,
  deleteLeadRecord,
  updateLeadRecord,
  type LeadMutationGateway
} from "./actions";

describe("createLeadRecord", () => {
  it("rejects incomplete lead data before creating a Supabase record", async () => {
    const calls: unknown[] = [];
    const gateway = fakeGateway(calls);
    const formData = new FormData();
    formData.set("companyName", "");

    const result = await createLeadRecord(gateway, "owner-1", formData);

    expect(result.status).toBe("error");
    expect(calls).toEqual([]);
  });

  it("creates a lead owned by the authenticated administrator", async () => {
    const calls: unknown[] = [];
    const gateway = fakeGateway(calls);

    const result = await createLeadRecord(
      gateway,
      "owner-1",
      validLeadFormData()
    );

    expect(result).toEqual({
      status: "success",
      message: "Lead cadastrado com sucesso."
    });
    expect(calls).toEqual([
      {
        operation: "create",
        payload: {
          company_name: "Restaurante Orla",
          contact_name: "Ana Martins",
          segment: "Gastronomia",
          source: "Instagram",
          instagram_profile: "@restauranteorla",
          stage: "Negociação",
          owner_id: "owner-1",
          estimated_value: 12000,
          recurring_value: 2000,
          probability: 30,
          next_action: "Agendar diagnóstico",
          next_action_at: new Date("2026-08-01T14:00").toISOString(),
          loss_reason: null
        }
      }
    ]);
  });
});

describe("updateLeadRecord", () => {
  it("updates the selected lead with validated form data", async () => {
    const calls: unknown[] = [];
    const gateway = fakeGateway(calls);

    const result = await updateLeadRecord(
      gateway,
      "lead-1",
      "owner-1",
      validLeadFormData()
    );

    expect(result).toEqual({
      status: "success",
      message: "Lead atualizado com sucesso."
    });
    expect(calls).toEqual([
      {
        operation: "update",
        id: "lead-1",
        payload: {
          company_name: "Restaurante Orla",
          contact_name: "Ana Martins",
          segment: "Gastronomia",
          source: "Instagram",
          instagram_profile: "@restauranteorla",
          stage: "Negociação",
          owner_id: "owner-1",
          estimated_value: 12000,
          recurring_value: 2000,
          probability: 30,
          next_action: "Agendar diagnóstico",
          next_action_at: new Date("2026-08-01T14:00").toISOString(),
          loss_reason: null
        }
      }
    ]);
  });
});

describe("deleteLeadRecord", () => {
  it("removes the selected lead", async () => {
    const calls: unknown[] = [];
    const gateway = fakeGateway(calls);

    const result = await deleteLeadRecord(gateway, "lead-1");

    expect(result).toEqual({
      status: "success",
      message: "Lead removido com sucesso."
    });
    expect(calls).toEqual([{ operation: "delete", id: "lead-1" }]);
  });

  it("rejects deletion without a lead id", async () => {
    const calls: unknown[] = [];
    const gateway = fakeGateway(calls);

    const result = await deleteLeadRecord(gateway, "");

    expect(result).toEqual({
      status: "error",
      message: "Lead não encontrado para esta operação."
    });
    expect(calls).toEqual([]);
  });
});

function fakeGateway(calls: unknown[]): LeadMutationGateway {
  return {
    async createLead(payload) {
      calls.push({ operation: "create", payload });
      return { ok: true };
    },
    async updateLead(id, payload) {
      calls.push({ operation: "update", id, payload });
      return { ok: true };
    },
    async deleteLead(id) {
      calls.push({ operation: "delete", id });
      return { ok: true };
    }
  };
}

function validLeadFormData(): FormData {
  const formData = new FormData();
  formData.set("companyName", "Restaurante Orla");
  formData.set("contactName", "Ana Martins");
  formData.set("segment", "Gastronomia");
  formData.set("source", "Instagram");
  formData.set("instagramProfile", "@restauranteorla");
  formData.set("stage", "Negociação");
  formData.set("estimatedValue", "12000");
  formData.set("recurringValue", "2000");
  formData.set("probability", "30");
  formData.set("nextAction", "Agendar diagnóstico");
  formData.set("nextActionAt", "2026-08-01T14:00");
  formData.set("lossReason", "");
  return formData;
}
