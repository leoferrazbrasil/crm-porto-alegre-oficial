import { describe, expect, it } from "vitest";

import { canAccessCrm, getProfileDisplayName } from "./access";

describe("canAccessCrm", () => {
  it("allows active admin profiles", () => {
    expect(
      canAccessCrm({
        id: "profile-1",
        email: "leonardoferrazbrasil@gmail.com",
        full_name: "Leonardo Brasil",
        role: "admin",
        status: "active"
      })
    ).toBe(true);
  });

  it("blocks inactive admins", () => {
    expect(
      canAccessCrm({
        id: "profile-1",
        email: "leonardoferrazbrasil@gmail.com",
        full_name: "Leonardo Brasil",
        role: "admin",
        status: "inactive"
      })
    ).toBe(false);
  });

  it("blocks missing profiles and non-admin roles", () => {
    expect(canAccessCrm(null)).toBe(false);
    expect(
      canAccessCrm({
        id: "profile-2",
        email: "owner@example.com",
        full_name: "Owner",
        role: "viewer",
        status: "active"
      })
    ).toBe(false);
  });
});

describe("getProfileDisplayName", () => {
  it("uses full name first, then email", () => {
    expect(
      getProfileDisplayName(
        {
          id: "profile-1",
          email: "leonardoferrazbrasil@gmail.com",
          full_name: "Leonardo Brasil",
          role: "admin",
          status: "active"
        },
        "fallback@example.com"
      )
    ).toBe("Leonardo Brasil");

    expect(
      getProfileDisplayName(
        {
          id: "profile-1",
          email: null,
          full_name: "",
          role: "admin",
          status: "active"
        },
        "fallback@example.com"
      )
    ).toBe("fallback@example.com");
  });
});
