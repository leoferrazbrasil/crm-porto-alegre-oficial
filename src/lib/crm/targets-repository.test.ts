import { describe, expect, it } from "vitest";

import { parseMonthlyTargetInput } from "./targets-repository";

describe("parseMonthlyTargetInput", () => {
  it("aceita competência mensal e valor não negativo", () => {
    expect(
      parseMonthlyTargetInput({ monthStart: "2026-08-01", revenueTarget: "12500.50" })
    ).toEqual({ monthStart: "2026-08-01", revenueTarget: 12500.5 });
  });

  it("rejeita mês que não é o primeiro dia ou valor inválido", () => {
    expect(parseMonthlyTargetInput({ monthStart: "2026-08-02", revenueTarget: 100 })).toBe(null);
    expect(parseMonthlyTargetInput({ monthStart: "2026-08-01", revenueTarget: -1 })).toBe(null);
    expect(parseMonthlyTargetInput({ monthStart: "2026-08-01", revenueTarget: "abc" })).toBe(null);
    expect(parseMonthlyTargetInput({ monthStart: "2026-08-01", revenueTarget: null })).toBe(null);
    expect(parseMonthlyTargetInput({ monthStart: "2026-08-01", revenueTarget: "" })).toBe(null);
  });
});
