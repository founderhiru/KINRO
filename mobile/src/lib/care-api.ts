// Mobile — thin, typed wrappers around the /api/care/* endpoints. All
// ownership, publication and online-opt-in checks are server-side.

import { z } from "zod";
import { apiFetch } from "./api-client";
import {
  type AppointmentWrite,
  CareConnections,
  CareProviderDetail,
  CareProviderList,
  NearbyPlaces,
} from "./care-contracts";

export async function getCareConnections(): Promise<CareConnections> {
  return apiFetch("/api/care/connections", { schema: CareConnections });
}

export async function listCareProviders(params: {
  kind?: "vet" | "clinic";
  city?: string;
  q?: string;
}): Promise<CareProviderList> {
  const qs = new URLSearchParams();
  if (params.kind) qs.set("kind", params.kind);
  if (params.city) qs.set("city", params.city);
  if (params.q) qs.set("q", params.q);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch(`/api/care/providers${suffix}`, { schema: CareProviderList });
}

export async function getCareProvider(id: string): Promise<CareProviderDetail> {
  return apiFetch(`/api/care/providers/${encodeURIComponent(id)}`, {
    schema: CareProviderDetail,
  });
}

const Created = z.object({ id: z.string(), status: z.string() }).passthrough();

export async function requestAppointment(payload: AppointmentWrite) {
  return apiFetch("/api/care/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
    schema: Created,
  });
}

export async function cancelAppointment(id: string) {
  return apiFetch(`/api/care/appointments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "cancelled" }),
    schema: Created,
  });
}

export async function getNearbyVets(area: string): Promise<NearbyPlaces> {
  return apiFetch(`/api/care/nearby?area=${encodeURIComponent(area)}`, {
    schema: NearbyPlaces,
  });
}
