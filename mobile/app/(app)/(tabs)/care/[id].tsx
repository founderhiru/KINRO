import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { VerificationBadge } from "@/components/care/ProviderRow";
import { ErrorText } from "@/components/ErrorText";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { getCareProvider } from "@/lib/care-api";
import type { CareProviderDetail } from "@/lib/care-contracts";
import { colors, elevation, radius, spacing, typography } from "@/theme/tokens";

function fmt(iso: string | null) {
  return iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
}

export default function ProviderScreen() {
  const { id, dogId } = useLocalSearchParams<{ id: string; dogId?: string }>();
  const [p, setP] = useState<CareProviderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setP(await getCareProvider(id));
    } catch {
      setError("Couldn't load this profile.");
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (error) {
    return (
      <Screen edges={[]}>
        <ErrorText>{error}</ErrorText>
      </Screen>
    );
  }
  if (!p) {
    return (
      <Screen edges={[]}>
        <Skeleton height={120} />
      </Screen>
    );
  }

  const place = [p.locality, p.city].filter(Boolean).join(", ");
  const request = (mode: "in_person" | "online") =>
    router.push({
      pathname: "/(app)/(tabs)/care/request",
      params: {
        providerId: p.id,
        providerName: p.name,
        mode,
        offersOnline: p.offersOnline ? "1" : "0",
        ...(dogId ? { dogId } : {}),
      },
    });

  return (
    <Screen edges={[]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          <Text style={typography.title}>{p.name}</Text>
          {p.qualifications ? (
            <Text style={typography.bodyMuted}>{p.qualifications}</Text>
          ) : null}
          <Text style={typography.bodyMuted}>{place}</Text>
          <View style={styles.gapXs}>
            <VerificationBadge status={p.verificationStatus} />
          </View>
        </View>

        {p.verificationStatus === "verified" ? (
          <Card style={styles.tint}>
            <Text style={styles.tintTitle}>Verified by KINRO</Text>
            <Text style={styles.tintText}>
              {p.registrationCouncil ?? "Council"} registration checked
              {fmt(p.verifiedAt) ? ` on ${fmt(p.verifiedAt)}` : ""}
              {p.registrationLast4
                ? `. Registration no. ending ${p.registrationLast4}.`
                : "."}
              {fmt(p.verifiedUntil)
                ? ` Valid until ${fmt(p.verifiedUntil)}.`
                : ""}
            </Text>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Text style={typography.bodyMuted}>
              KINRO has not verified this listing's credentials yet. Ask to see
              their registration before relying on it.
            </Text>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.label}>CONTACT</Text>
          {p.addressLine ? (
            <Text style={typography.bodyMuted}>{p.addressLine}</Text>
          ) : null}
          {p.phone ? (
            <View style={styles.gapSm}>
              <Button
                label={`Call ${p.phone}`}
                variant={p.canRequest ? "secondary" : "primary"}
                onPress={() =>
                  Linking.openURL(`tel:${p.phone?.replace(/[^\d+]/g, "")}`)
                }
              />
            </View>
          ) : null}
          {p.canRequest ? (
            <>
              <View style={styles.gapSm}>
                <Button
                  label="Request appointment"
                  onPress={() => request("in_person")}
                />
              </View>
              {p.offersOnline ? (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.optTitle}>Online consultation</Text>
                  <Text style={typography.bodyMuted}>
                    Consult from home. The vet confirms the time and phones you
                    to arrange it.
                  </Text>
                  <View style={styles.gapSm}>
                    <Button
                      label="Request online consultation"
                      variant="secondary"
                      onPress={() => request("online")}
                    />
                  </View>
                </>
              ) : null}
            </>
          ) : !p.phone && !p.addressLine ? (
            <Text style={typography.bodyMuted}>
              No contact details are listed for this provider.
            </Text>
          ) : null}
        </Card>

        {p.vets.length > 0 ? (
          <Card style={styles.card}>
            <Text style={styles.label}>VETS AT THIS CLINIC</Text>
            {p.vets.map((v) => (
              <Text
                key={v.id}
                style={styles.vet}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/(tabs)/care/[id]",
                    params: { id: v.id },
                  })
                }
              >
                {v.name} →
              </Text>
            ))}
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.md, paddingBottom: spacing.xl },
  card: { borderRadius: radius.lg, ...elevation.card },
  tint: { borderRadius: radius.lg, backgroundColor: colors.accentTint },
  tintTitle: { fontSize: 15, fontWeight: "700", color: colors.accentDark },
  tintText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.accentDark,
    marginTop: 2,
  },
  label: {
    ...typography.caption,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  optTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  gapXs: { marginTop: spacing.xs },
  gapSm: { marginTop: spacing.sm },
  vet: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.accent,
    paddingVertical: spacing.xs,
  },
});
