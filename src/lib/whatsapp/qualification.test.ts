import { describe, expect, it } from "vitest";

import {
  buildLeadPayloadFromConversation,
  canConvertConversation,
  parseQualificationStatus,
  qualificationStatusLabel,
  validateLeadConversion,
  type QualifiedConversation
} from "./qualification";

const negotiationConversation: QualifiedConversation = {
  id: "conversation-1",
  phone: "5511999999999",
  name: "Lead Teste",
  leadId: null,
  qualificationStatus: "negotiation"
};

describe("whatsapp qualification flow", () => {
  it("accepts only the supported qualification statuses", () => {
    expect(parseQualificationStatus("qualifying")).toBe("qualifying");
    expect(parseQualificationStatus(" proposal ")).toBe("proposal");
    expect(parseQualificationStatus("unknown")).toBeNull();
    expect(parseQualificationStatus(null)).toBeNull();
  });

  it("exposes the conversion action only for negotiation unlinked contacts", () => {
    expect(qualificationStatusLabel("new")).toBe("Novo");
    expect(qualificationStatusLabel("proposal")).toBe("Proposta");
    expect(qualificationStatusLabel("lost")).toBe("Perdido");
    expect(canConvertConversation(negotiationConversation)).toBe(true);
    expect(
      canConvertConversation({ ...negotiationConversation, leadId: "lead-1" })
    ).toBe(false);
    expect(
      canConvertConversation({ ...negotiationConversation, qualificationStatus: "qualifying" })
    ).toBe(false);
  });

  it("requires a negotiation unlinked conversation before conversion", () => {
    expect(
      validateLeadConversion(
        { ...negotiationConversation, qualificationStatus: "new" },
        {
          companyName: "Empresa",
          segment: "Serviços",
          nextAction: "Agendar diagnóstico",
          nextActionAt: "2026-08-05T14:00:00.000Z"
        }
      )
    ).toEqual({
      ok: false,
      message: "A conversa precisa estar marcada como Negociação."
    });

    expect(
      validateLeadConversion(
        { ...negotiationConversation, leadId: "lead-1" },
        {
          companyName: "Empresa",
          segment: "Serviços",
          nextAction: "Agendar diagnóstico",
          nextActionAt: "2026-08-05T14:00:00.000Z"
        }
      )
    ).toEqual({
      ok: false,
      message: "Esta conversa já está vinculada a um lead."
    });

    expect(
      validateLeadConversion(negotiationConversation, {
        companyName: "",
        segment: "Serviços",
        nextAction: "Agendar diagnóstico",
        nextActionAt: "2026-08-05T14:00:00.000Z"
      })
    ).toEqual({
      ok: false,
      message: "Informe empresa, segmento, próxima ação e data antes de converter."
    });
  });

  it("builds an inbound lead payload from a negotiation conversation", () => {
    expect(
      buildLeadPayloadFromConversation(
        negotiationConversation,
        {
          companyName: "Empresa Teste",
          segment: "Serviços",
          nextAction: "Agendar diagnóstico",
          nextActionAt: "2026-08-05T14:00:00.000Z"
        },
        "owner-1"
      )
    ).toEqual({
      company_name: "Empresa Teste",
      contact_name: "Lead Teste",
      segment: "Serviços",
      source: "Inbound",
      instagram_profile: null,
      stage: "Negociação",
      owner_id: "owner-1",
      estimated_value: 0,
      recurring_value: null,
      probability: 0,
      next_action: "Agendar diagnóstico",
      next_action_at: "2026-08-05T14:00:00.000Z",
      loss_reason: null
    });
  });
});
