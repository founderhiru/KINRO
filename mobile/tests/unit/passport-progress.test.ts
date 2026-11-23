import { describe, expect, it } from "vitest";
import type { HealthRecordItem } from "@/lib/health-contracts";
import { passportProgress } from "@/lib/passport-progress";

const rec = (type: HealthRecordItem["type"], docs = 0): HealthRecordItem => ({
  id: "r",
  dogId: "d",
  type,
  title: "t",
  occurredOn: "2026-01-01",
  vetName: null,
  notes: null,
  documents: Array.from({ length: docs }, () => ({}) as never),
});

describe("passportProgress", () => {
  it("is 0 of 3 with no records", () => {
    expect(passportProgress([]).done).toBe(0);
  });
  it("counts vaccination, vet visit and any document", () => {
    expect(passportProgress([rec("vaccination")]).done).toBe(1);
    expect(
      passportProgress([rec("vaccination"), rec("vetVisit", 1)]),
    ).toMatchObject({ done: 3, document: true });
  });
  it("an 'other' record without documents does not count", () => {
    expect(passportProgress([rec("other")]).done).toBe(0);
  });
});
