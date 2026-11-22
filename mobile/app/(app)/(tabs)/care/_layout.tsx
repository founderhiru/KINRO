import { Stack } from "expo-router";
import { HeaderBackButton } from "@/components/HeaderBackButton";
import { colors } from "@/theme/tokens";

// Care is an extension of KINRO, not a sixth tab: this stack is reached from
// Home, a dog profile and the Messages "Care" segment.
export default function CareLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerLeft: () => <HeaderBackButton />,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Find care" }} />
      <Stack.Screen name="[id]" options={{ title: "" }} />
      <Stack.Screen name="request" options={{ title: "Request appointment" }} />
    </Stack>
  );
}
