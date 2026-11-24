// The "Care" segment of Messages. Separate from dog connections: it reads
// only /api/care/connections and never touches matches or conversations.
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorText } from "@/components/ErrorText";
import { SectionHeader } from "@/components/SectionHeader";
import { Skeleton } from "@/components/Skeleton";
import { cancelAppointment, getCareConnections } from "@/lib/care-api";
import type {
  AppointmentItem,
  CareConnections as Data,
} from "@/lib/care-contracts";
import { colors, elevation, radius, spacing, typography } from "@/theme/tokens";

const REASON: Record<string, string> = {
  check_up: "Check-up",
  vaccination: "Vaccination",
  skin_ears: "Skin or ears",
  follow_up: "Follow-up",
  other: "Visit",
};
const DAY: Record<string, string> = {
  today: "Today",
  tomorrow: "Tomorrow",
  this_week: "This week",
};
const STATUS: Record<
  AppointmentItem["status"],
  { label: string; tone: "success" | "warning" | "neutral" }
> = {
  requested: { label: "Waiting", tone: "warning" },
  confirmed: { label: "Confirmed", tone: "success" },
  declined: { label: "Declined", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  completed: { label: "Completed", tone: "neutral" },
};

export function CareConnections({ onFindCare }: { onFindCare: () => void }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await getCareConnections());
    } catch {
      setError("Couldn't load your care connections. Check your connection.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleCancel(id: string) {
    try {
      await cancelAppointment(id);
      await load();
    } catch {
      Alert.alert("Couldn't cancel", "Check your connection and try again.");
    }
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ErrorText>{error}</ErrorText>
        <View style={styles.gap}>
          <Button label="Retry" onPress={load} variant="secondary" />
        </View>
      </View>
    );
  }
  if (!data) {
    return (
      <View>
        <Skeleton height={80} />
        <Skeleton height={80} style={styles.gap} />
      </View>
    );
  }
  if (data.appointments.length === 0 && data.relationships.length === 0) {
    return (
      <EmptyState
        emoji="🩺"
        title="No care connections yet"
        message="Find a vet or clinic and request an appointment. Your health records stay private unless you choose to share them."
        actionLabel="Find a vet"
        onAction={onFindCare}
      />
    );
  }

  const open = data.appointments.filter(
    (a) => a.status === "requested" || a.status === "confirmed",
  );
  const past = data.appointments.filter(
    (a) => a.status !== "requested" && a.status !== "confirmed",
  );

  return (
    <ScrollView contentContainerStyle={styles.list}>
      {open.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="Appointments" />
          {open.map((a) => (
            <Card key={a.id} style={styles.card}>
              <View style={styles.rowTop}>
                <Text style={[typography.body, styles.flex]}>
                  <Text style={styles.bold}>{a.providerName}</Text>
                  {"\n"}
                  <Text style={typography.bodyMuted}>
                    {a.dogName} · {REASON[a.reason] ?? "Visit"}
                    {a.preferredDay ? ` · ${DAY[a.preferredDay] ?? ""}` : ""}
                    {a.mode === "online" ? " · Online" : ""}
                  </Text>
                </Text>
                <Badge
                  label={STATUS[a.status].label}
                  tone={STATUS[a.status].tone}
                />
              </View>
              {a.mode === "online" &&
              a.status === "confirmed" &&
              a.meetingUrl?.startsWith("https://") ? (
                <View style={styles.join}>
                  <Button
                    label="Join video call"
                    onPress={() => Linking.openURL(a.meetingUrl as string)}
                  />
                </View>
              ) : null}
              <Text style={styles.link} onPress={() => handleCancel(a.id)}>
                Cancel request
              </Text>
            </Card>
          ))}
        </View>
      ) : null}

      {data.relationships.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="Your vets & clinics" />
          {data.relationships.map((r) => (
            <Card key={r.id} style={styles.card}>
              <Text style={typography.body}>
                <Text style={styles.bold}>{r.providerName}</Text>
                {"\n"}
                <Text style={typography.bodyMuted}>
                  {r.dogName} ·{" "}
                  {r.activeShare
                    ? `Sharing ${r.activeShare.categories.length} record type${r.activeShare.categories.length === 1 ? "" : "s"}`
                    : "Sharing nothing"}
                </Text>
              </Text>
            </Card>
          ))}
        </View>
      ) : null}

      {past.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="Consultation history" />
          {past.map((a) => (
            <Card key={a.id} style={styles.card}>
              <Text style={typography.bodyMuted}>
                {a.providerName} · {a.dogName} · {STATUS[a.status].label}
              </Text>
            </Card>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.xl,
  },
  gap: { marginTop: spacing.md },
  list: { paddingBottom: spacing.xl },
  section: { marginBottom: spacing.lg },
  card: {
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    ...elevation.card,
  },
  rowTop: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  flex: { flex: 1 },
  bold: { fontWeight: "700" },
  join: { marginTop: spacing.sm },
  link: {
    marginTop: spacing.sm,
    color: colors.accent,
    fontWeight: "700",
    fontSize: 13,
  },
});
