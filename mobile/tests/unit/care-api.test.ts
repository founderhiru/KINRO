import { beforeEach, describe, expect, it, vi } from "vitest";

const apiFetchMock = vi.fn();
vi.mock("@/lib/api-client", () => ({ apiFetch: apiFetchMock }));

beforeEach(() => apiFetchMock.mockReset());

describe("care-api", () => {
  it("lists providers with kind and search filters", async () => {
    apiFetchMock.mockResolvedValue({ items: [] });
    const { listCareProviders } = await import("@/lib/care-api");
    await listCareProviders({ kind: "vet", q: "rao" });
    expect(apiFetchMock.mock.calls[0]?.[0]).toBe(
      "/api/care/providers?kind=vet&q=rao",
    );
  });

  it("requests an appointment via POST /api/care/appointments", async () => {
    apiFetchMock.mockResolvedValue({ id: "a1", status: "requested" });
    const { requestAppointment } = await import("@/lib/care-api");
    await requestAppointment({
      providerId: "p1",
      dogId: "d1",
      mode: "in_person",
      reason: "check_up",
    });
    const [path, init] = apiFetchMock.mock.calls[0] as [string, RequestInit];
    expect(path).toBe("/api/care/appointments");
    expect(init.method).toBe("POST");
  });

  it("cancels through PATCH with status cancelled only", async () => {
    apiFetchMock.mockResolvedValue({ id: "a1", status: "cancelled" });
    const { cancelAppointment } = await import("@/lib/care-api");
    await cancelAppointment("a1");
    const [path, init] = apiFetchMock.mock.calls[0] as [string, RequestInit];
    expect(path).toBe("/api/care/appointments/a1");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({ status: "cancelled" });
  });
});
