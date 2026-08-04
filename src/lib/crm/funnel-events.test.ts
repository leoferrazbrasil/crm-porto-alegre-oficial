import { describe, expect, it } from "vitest";

import {
  buildEventKey,
  isFunnelEventType,
  type FunnelEventType
} from "./funnel-events";

describe("funnel events", () => {
  it("accepts only supported event types", () => {
    expect(isFunnelEventType("conversation_created")).toBe(true);
    expect(isFunnelEventType("lead_stage_changed")).toBe(true);
    expect(isFunnelEventType("message_received")).toBe(false);
  });

  it("builds deterministic keys for idempotent creation events", () => {
    expect(
      buildEventKey("conversation_created" as FunnelEventType, "conversation-1")
    ).toBe("conversation:conversation-1:created");
    expect(
      buildEventKey("lead_created" as FunnelEventType, "lead-1")
    ).toBe("lead:lead-1:created");
    expect(buildEventKey("lead_stage_changed" as FunnelEventType, "lead-1")).toBeNull();
  });
});
