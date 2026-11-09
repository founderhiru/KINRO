import { describe, expect, it, vi } from "vitest";

// api-client pulls in expo-secure-store via auth-client; mocked like api-client.test.ts.
vi.mock("@/lib/auth-client", () => ({ getStoredSessionCookie: vi.fn() }));
vi.mock("@/lib/env", () => ({
  env: { apiUrl: "https://api.test", appScheme: "canidknot" },
}));

import { ApiError } from "@/lib/api-client";
import { safetyErrorMessage } from "@/lib/safety";
import { REPORT_REASON_LABELS, REPORT_REASONS } from "@/lib/safety-contracts";

describe("safetyErrorMessage", () => {
  it("uses the backend's error message when there is one", () => {
    const err = new ApiError("x", 429, { error: "Try again tomorrow." });
    expect(safetyErrorMessage(err, "fallback")).toBe("Try again tomorrow.");
  });

  it("falls back for network errors, empty or non-string bodies", () => {
    expect(safetyErrorMessage(new Error("offline"), "fallback")).toBe(
      "fallback",
    );
    expect(safetyErrorMessage(new ApiError("x", 500, null), "fallback")).toBe(
      "fallback",
    );
    expect(
      safetyErrorMessage(new ApiError("x", 500, { error: 5 }), "fallback"),
    ).toBe("fallback");
  });
});

describe("report reasons", () => {
  it("every reason has a label", () => {
    for (const reason of REPORT_REASONS) {
      expect(REPORT_REASON_LABELS[reason]).toBeTruthy();
    }
  });
});
