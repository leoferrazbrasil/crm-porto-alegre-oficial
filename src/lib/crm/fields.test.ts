import { describe, expect, it } from "vitest";

import { CRM_FIELD_DEFINITIONS } from "./fields";

describe("CRM_FIELD_DEFINITIONS", () => {
  it("mantém os 62 campos aprovados em ordem e sem duplicidade", () => {
    expect(CRM_FIELD_DEFINITIONS).toHaveLength(62);
    expect(CRM_FIELD_DEFINITIONS.map((field) => field.order)).toEqual(
      Array.from({ length: 62 }, (_, index) => index + 1)
    );
    expect(new Set(CRM_FIELD_DEFINITIONS.map((field) => field.name)).size).toBe(
      62
    );
  });

  it("preserva as regras críticas de consentimento e próxima ação", () => {
    expect(
      CRM_FIELD_DEFINITIONS.find((field) => field.name === "Opt-in WhatsApp")
    ).toMatchObject({
      required: true,
      rule: "Obrigatório antes de mensagem proativa"
    });
    expect(
      CRM_FIELD_DEFINITIONS.find((field) => field.name === "Próxima ação")
    ).toMatchObject({
      required: true,
      rule: "Nenhuma oportunidade sem ação"
    });
  });
});
