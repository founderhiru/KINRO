import { Stack } from "expo-router";
import { HeaderBackButton } from "@/components/HeaderBackButton";
import { colors } from "@/theme/tokens";

export default function DiscoverLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Discover", headerShown: false }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: "", headerLeft: () => <HeaderBackButton /> }}
      />
    </Stack>
  );
}
