import { describe, expect, it } from "vitest";

import { buildLeadPayload, mapLeadRow, parseLeadForm } from "./leads";

describe("mapLeadRow", () => {
  it("maps a Supabase row into the CRM lead domain model", () => {
    expect(
      mapLeadRow({
        id: "lead-1",
        company_name: "Restaurante Orla",
        contact_name: "Ana Martins",
        segment: "Gastronomia",
        source: "Instagram",
        instagram_profile: "@restauranteorla",
        stage: "Qualificado",
        owner_id: "owner-1",
        estimated_value: "12000.50",
        recurring_value: "2000",
        probability: 30,
        next_action: "Agendar diagnóstico",
        next_action_at: "2026-08-01T14:00:00.000Z",
        loss_reason: null,
        created_at: "2026-07-30T10:00:00.000Z",
        updated_at: "2026-07-30T11:00:00.000Z"
      })
    ).toEqual({
      id: "lead-1",
      companyName: "Restaurante Orla",
      contactName: "Ana Martins",
      segment: "Gastronomia",
      source: "Instagram",
      instagramProfile: "@restauranteorla",
      stage: "Qualificado",
      owner: "Leonardo",
      estimatedValue: 12000.5,
      recurringValue: 2000,
      probability: 30,
      nextAction: "Agendar diagnóstico",
      nextActionAt: "2026-08-01T14:00:00.000Z",
      createdAt: "2026-07-30T10:00:00.000Z",
      updatedAt: "2026-07-30T11:00:00.000Z"
    });
  });
});

describe("parseLeadForm", () => {
  it("rejects missing required fields", () => {
    const formData = new FormData();
    formData.set("companyName", "");

    expect(parseLeadForm(formData)).toEqual({
      status: "error",
      message: "Informe empresa, contato, segmento, origem, etapa, próxima ação e data."
    });
  });

  it("rejects invalid probability values", () => {
    const formData = validLeadFormData();
    formData.set("probability", "120");

    expect(parseLeadForm(formData)).toEqual({
      status: "error",
      message: "A probabilidade precisa estar entre 0 e 100."
    });
  });

  it("parses valid lead form data", () => {
    const expectedNextActionAt = new Date("2026-08-01T14:00").toISOString();

    expect(parseLeadForm(validLeadFormData())).toEqual({
      status: "success",
      data: {
        companyName: "Restaurante Orla",
        contactName: "Ana Martins",
        segment: "Gastronomia",
        source: "Instagram",
        instagramProfile: "@restauranteorla",
        stage: "Qualificado",
        estimatedValue: 12000,
        recurringValue: 2000,
        probability: 30,
        nextAction: "Agendar diagnóstico",
        nextActionAt: expectedNextActionAt,
        lossReason: null
      }
    });
  });
});

describe("buildLeadPayload", () => {
  it("builds a Supabase insert/update payload with the authenticated owner", () => {
    const parsed = parseLeadForm(validLeadFormData());
    const expectedNextActionAt = new Date("2026-08-01T14:00").toISOString();

    if (parsed.status !== "success") {
      throw new Error("Fixture should be valid");
    }

    expect(buildLeadPayload(parsed.data, "owner-1")).toEqual({
      company_name: "Restaurante Orla",
      contact_name: "Ana Martins",
      segment: "Gastronomia",
      source: "Instagram",
      instagram_profile: "@restauranteorla",
      stage: "Qualificado",
      owner_id: "owner-1",
      estimated_value: 12000,
      recurring_value: 2000,
      probability: 30,
      next_action: "Agendar diagnóstico",
      next_action_at: expectedNextActionAt,
      loss_reason: null
    });
  });
});

function validLeadFormData(): FormData {
  const formData = new FormData();
  formData.set("companyName", "Restaurante Orla");
  formData.set("contactName", "Ana Martins");
  formData.set("segment", "Gastronomia");
  formData.set("source", "Instagram");
  formData.set("instagramProfile", "@restauranteorla");
  formData.set("stage", "Qualificado");
  formData.set("estimatedValue", "12000");
  formData.set("recurringValue", "2000");
  formData.set("probability", "30");
  formData.set("nextAction", "Agendar diagnóstico");
  formData.set("nextActionAt", "2026-08-01T14:00");
  formData.set("lossReason", "");
  return formData;
}
