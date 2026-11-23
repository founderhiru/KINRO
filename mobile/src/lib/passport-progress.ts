// Health Passport completeness: three things a vet usually asks for.
// Pure so it can be tested; the UI lives in components/PassportProgress.tsx.
import type { HealthRecordItem } from "@/lib/health-contracts";

export interface PassportProgress {
  done: number;
  total: 3;
  vaccination: boolean;
  vetVisit: boolean;
  document: boolean;
}

export function passportProgress(
  records: readonly HealthRecordItem[],
): PassportProgress {
  const vaccination = records.some((r) => r.type === "vaccination");
  const vetVisit = records.some((r) => r.type === "vetVisit");
  const document = records.some((r) => r.documents.length > 0);
  return {
    done: [vaccination, vetVisit, document].filter(Boolean).length,
    total: 3,
    vaccination,
    vetVisit,
    document,
  };
}
