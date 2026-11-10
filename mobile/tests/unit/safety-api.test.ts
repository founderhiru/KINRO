import { beforeEach, describe, expect, it, vi } from "vitest";

const apiFetch = vi.fn();
vi.mock("@/lib/api-client", () => ({ apiFetch }));

beforeEach(() => apiFetch.mockReset());

describe("safety api", () => {
  it("reports a dog with trimmed details, omitting empty details", async () => {
    apiFetch.mockResolvedValue({ id: "r1" });
    const { reportTarget } = await import("@/lib/safety-api");
    await reportTarget({ dogId: "d1" }, "spam", "  scam link  ");
    expect(JSON.parse(apiFetch.mock.calls[0]?.[1].body)).toEqual({
      dogId: "d1",
      reason: "spam",
      details: "scam link",
    });
    await reportTarget({ conversationId: "c1" }, "harassment", "   ");
    expect(JSON.parse(apiFetch.mock.calls[1]?.[1].body)).toEqual({
      conversationId: "c1",
      reason: "harassment",
    });
  });

  it("blocks, unblocks and deletes the account with the right requests", async () => {
    apiFetch.mockResolvedValue({ id: "b1" });
    const api = await import("@/lib/safety-api");
    await api.blockTarget({ dogId: "d1" });
    expect(apiFetch).toHaveBeenLastCalledWith(
      "/api/blocks",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ dogId: "d1" }),
      }),
    );
    await api.unblockUser("b 1");
    expect(apiFetch).toHaveBeenLastCalledWith("/api/blocks/b%201", {
      method: "DELETE",
    });
    await api.deleteMyAccount();
    expect(apiFetch).toHaveBeenLastCalledWith("/api/account", {
      method: "DELETE",
      body: JSON.stringify({ confirm: "DELETE" }),
    });
  });
});
