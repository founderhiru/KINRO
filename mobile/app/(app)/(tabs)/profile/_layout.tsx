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
      <Stack.Screen
        name="support"
        options={{
          title: "Help & Support",
          headerLeft: () => <HeaderBackButton />,
        }}
      />
    </Stack>
  );
}
