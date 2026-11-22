import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/Card";
import { CareTag } from "@/components/care/CareTag";
import { colors, elevation, radius, spacing, typography } from "@/theme/tokens";

/**
 * Entry point into KINRO Care. Home passes no dog; a dog profile passes its
 * id so the directory and request form are pre-set for that dog. Both land
 * on the same Care directory.
 */
export function CareEntryCard({
  dogId,
  dogName,
}: {
  dogId?: string;
  dogName?: string;
}) {
  const title = dogName ? `Care for ${dogName}` : "Find Veterinary Care";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. Vets and clinics near you.`}
      onPress={() =>
        router.push({
          pathname: "/(app)/(tabs)/care",
          params: dogId ? { dogId } : {},
        })
      }
    >
      <Card style={styles.card}>
        <View style={styles.icon}>
          <Ionicons name="medkit-outline" size={22} color={colors.accent} />
        </View>
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text style={typography.sectionTitle}>{title}</Text>
            <CareTag />
          </View>
          <Text style={typography.bodyMuted}>
            Vets and clinics near you, with credentials checked.
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.borderStrong}
        />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    ...elevation.card,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentTint,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1, gap: 2 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
});
