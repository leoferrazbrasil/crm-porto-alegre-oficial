import { describe, expect, it } from "vitest";

import { parseChatsPagination } from "./pagination";

describe("parseChatsPagination", () => {
  it("uses safe defaults when query parameters are absent", () => {
    expect(parseChatsPagination(new URLSearchParams())).toEqual({
      page: 1,
      pageSize: 50
    });
  });

  it("normalizes positive integers and caps the page size", () => {
    expect(
      parseChatsPagination(new URLSearchParams("page=3&pageSize=200"))
    ).toEqual({
      page: 3,
      pageSize: 50
    });
  });

  it("falls back for invalid or non-positive values", () => {
    expect(
      parseChatsPagination(new URLSearchParams("page=nope&pageSize=0"))
    ).toEqual({
      page: 1,
      pageSize: 50
    });
  });
});
