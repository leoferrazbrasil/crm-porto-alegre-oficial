import { describe, expect, it } from "vitest";

import {
  getConversionAction,
  type ConversationConversionContext
} from "./conversation-conversion";

const baseConversation: ConversationConversionContext = {
  qualificationStatus: "negotiation",
  leadId: null
};

describe("conversation conversion action", () => {
  it("opens contextual conversion only for negotiation without a lead", () => {
    expect(getConversionAction(baseConversation)).toEqual({
      kind: "convert",
      label: "Transformar em lead"
    });
  });

  it("offers the linked lead when the conversation was already converted", () => {
    expect(
      getConversionAction({ ...baseConversation, leadId: "lead-1" })
    ).toEqual({ kind: "open", label: "Abrir lead" });
  });

  it("explains why conversion is unavailable before negotiation", () => {
    expect(
      getConversionAction({ ...baseConversation, qualificationStatus: "qualifying" })
    ).toEqual({
      kind: "blocked",
      label: "Disponível em Negociação"
    });
  });
});
