import { describe, expect, it } from "vitest";

import {
  buildLeadPayloadFromConversation,
  canConvertConversation,
  parseQualificationStatus,
  qualificationStatusLabel,
  validateLeadConversion,
  type QualifiedConversation
} from "./qualification";

const qualifiedConversation: QualifiedConversation = {
  id: "conversation-1",
  phone: "5511999999999",
  name: "Lead Teste",
  leadId: null,
  qualificationStatus: "qualified"
};

describe("whatsapp qualification flow", () => {
  it("accepts only the supported qualification statuses", () => {
    expect(parseQualificationStatus("qualifying")).toBe("qualifying");
    expect(parseQualificationStatus(" qualified ")).toBe("qualified");
    expect(parseQualificationStatus("unknown")).toBeNull();
    expect(parseQualificationStatus(null)).toBeNull();
  });

  it("exposes the conversion action only for qualified unlinked contacts", () => {
    expect(qualificationStatusLabel("new")).toBe("Novo");
    expect(qualificationStatusLabel("not_interested")).toBe("Sem interesse");
    expect(canConvertConversation(qualifiedConversation)).toBe(true);
    expect(
      canConvertConversation({ ...qualifiedConversation, leadId: "lead-1" })
    ).toBe(false);
    expect(
      canConvertConversation({ ...qualifiedConversation, qualificationStatus: "qualifying" })
    ).toBe(false);
  });

  it("requires a qualified unlinked conversation before conversion", () => {
    expect(
      validateLeadConversion(
        { ...qualifiedConversation, qualificationStatus: "new" },
        { companyName: "Empresa", segment: "Serviços" }
      )
    ).toEqual({
      ok: false,
      message: "A conversa precisa estar marcada como Qualificado."
    });

    expect(
      validateLeadConversion(
        { ...qualifiedConversation, leadId: "lead-1" },
        { companyName: "Empresa", segment: "Serviços" }
      )
    ).toEqual({
      ok: false,
      message: "Esta conversa já está vinculada a um lead."
    });

    expect(
      validateLeadConversion(qualifiedConversation, {
        companyName: "",
        segment: "Serviços"
      })
    ).toEqual({
      ok: false,
      message: "Informe a empresa e o segmento antes de converter."
    });
  });

  it("builds an inbound lead payload from a qualified conversation", () => {
    expect(
      buildLeadPayloadFromConversation(
        qualifiedConversation,
        { companyName: "Empresa Teste", segment: "Serviços" },
        "owner-1",
        "2026-08-04T13:00:00.000Z"
      )
    ).toEqual({
      company_name: "Empresa Teste",
      contact_name: "Lead Teste",
      segment: "Serviços",
      source: "Inbound",
      instagram_profile: null,
      stage: "Contato iniciado",
      owner_id: "owner-1",
      estimated_value: 0,
      recurring_value: null,
      probability: 0,
      next_action: "Realizar diagnóstico comercial",
      next_action_at: "2026-08-04T13:00:00.000Z",
      loss_reason: null
    });
  });
});
