import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { ChipSelect } from "@/components/ChipSelect";
import { ErrorText } from "@/components/ErrorText";
import { Screen } from "@/components/Screen";
import { SegmentedControl } from "@/components/SegmentedControl";
import { TextArea } from "@/components/TextArea";
import { TextField } from "@/components/TextField";
import { ApiError } from "@/lib/api-client";
import { requestAppointment } from "@/lib/care-api";
import { listMyDogs } from "@/lib/dog-api";
import { colors, radius, spacing, typography } from "@/theme/tokens";

const REASONS = {
  "Check-up": "check_up",
  Vaccination: "vaccination",
  "Skin or ears": "skin_ears",
  "Follow-up": "follow_up",
  Other: "other",
} as const;
const DAYS = {
  Today: "today",
  Tomorrow: "tomorrow",
  "This week": "this_week",
} as const;

export default function RequestAppointmentScreen() {
  const p = useLocalSearchParams<{
    providerId: string;
    providerName: string;
    mode?: string;
    offersOnline?: string;
    dogId?: string;
  }>();
  const offersOnline = p.offersOnline === "1";
  const [mode, setMode] = useState<"in_person" | "online">(
    p.mode === "online" && offersOnline ? "online" : "in_person",
  );
  const [dogs, setDogs] = useState<{ id: string; name: string }[]>([]);
  const [dogId, setDogId] = useState(p.dogId ?? "");
  const [reason, setReason] = useState<keyof typeof REASONS>("Check-up");
  const [day, setDay] = useState<keyof typeof DAYS>("Tomorrow");
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMyDogs()
      .then((r) => {
        setDogs(r.items.map((d) => ({ id: d.id, name: d.name })));
        setDogId((cur) => cur || r.items[0]?.id || "");
      })
      .catch(() => setError("Couldn't load your dogs."));
  }, []);

  async function submit() {
    if (!dogId) {
      setError("Add a dog first, then request an appointment.");
      return;
    }
    if (!/^\+?[\d\s-]{8,16}$/.test(phone.trim())) {
      setError("Enter a phone number the vet can reach you on.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await requestAppointment({
        ownerPhone: phone.trim(),
        providerId: p.providerId,
        dogId,
        mode,
        reason: REASONS[reason],
        preferredDay: DAYS[day],
        note: note.trim() || undefined,
      });
      Alert.alert(
        "Request sent",
        `${p.providerName} has been emailed your request. You can follow it in Messages > Care.`,
      );
      router.replace({
        pathname: "/(app)/(tabs)/matches",
        params: { view: "care" },
      });
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message || "Couldn't send this request."
          : "Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const dogNames = dogs.map((d) => d.name);
  const selectedDog = dogs.find((d) => d.id === dogId)?.name ?? "";

  return (
    <Screen edges={[]}>
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={typography.bodyMuted}>with {p.providerName}</Text>
        {offersOnline ? (
          <View>
            <Text style={styles.label}>How would you like to consult?</Text>
            <SegmentedControl
              options={[
                { value: "in_person", label: "In person" },
                { value: "online", label: "Online" },
              ]}
              value={mode}
              onChange={setMode}
            />
            {mode === "online" ? (
              <Text style={[typography.bodyMuted, styles.onlineNote]}>
                The vet shares a video-call link when they confirm. Online
                consultation is not for emergencies.
              </Text>
            ) : null}
          </View>
        ) : null}
        {dogNames.length > 0 ? (
          <ChipSelect
            label="Which dog?"
            options={dogNames}
            value={selectedDog}
            onChange={(n) => setDogId(dogs.find((d) => d.name === n)?.id ?? "")}
          />
        ) : null}
        <ChipSelect
          label="Reason"
          options={Object.keys(REASONS)}
          value={reason}
          onChange={(v) => setReason(v as keyof typeof REASONS)}
        />
        <ChipSelect
          label="Preferred time"
          options={Object.keys(DAYS)}
          value={day}
          onChange={(v) => setDay(v as keyof typeof DAYS)}
        />
        <TextArea
          label="Message (optional)"
          value={note}
          onChangeText={setNote}
          maxLength={500}
          placeholder="Anything the clinic should know"
        />
        <TextField
          label="Your phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoComplete="tel"
          placeholder="So the vet can reach you"
        />
        <View style={styles.privacy}>
          <Text style={styles.privacyText}>
            The vet sees your dog's name, breed and age, your message and your
            phone number. Your health records stay private.
          </Text>
        </View>
        {error ? <ErrorText>{error}</ErrorText> : null}
        <Button label="Send request" onPress={submit} loading={busy} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.md, paddingBottom: spacing.xl },
  label: { ...typography.label },
  onlineNote: { marginTop: spacing.sm },
  privacy: {
    backgroundColor: colors.accentTint,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  privacyText: { fontSize: 13, lineHeight: 18, color: colors.accentDark },
});
