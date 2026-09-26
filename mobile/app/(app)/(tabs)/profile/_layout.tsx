import { Stack } from "expo-router";
import { HeaderBackButton } from "@/components/HeaderBackButton";
import { colors } from "@/theme/tokens";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Profile" }} />
      <Stack.Screen name="edit" options={{ title: "Edit Profile" }} />
      <Stack.Screen
        name="notifications"
        options={{
          title: "Notifications",
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen name="pricing" options={{ title: "Connection Service" }} />
      {/* Help & Trust is its own nested stack (FAQ / Privacy / Security /
          Terms / Contact Support) with its own headers, so the outer
          header is hidden here — see help-trust/_layout.tsx. */}
      <Stack.Screen name="help-trust" options={{ headerShown: false }} />
    </Stack>
  );
}
