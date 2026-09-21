import { Stack } from "expo-router";
import { HeaderBackButton } from "@/components/HeaderBackButton";
import { colors } from "@/theme/tokens";

export default function MyDogLayout() {
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
        options={{ title: "My Dogs", headerShown: false }}
      />
      <Stack.Screen
        name="add"
        options={{ title: "Add Dog", headerLeft: () => <HeaderBackButton /> }}
      />
      {/* Dog Profile draws its own transparent back/edit controls over the
          hero photo (see reference design), so the native header is hidden
          here rather than restyled. */}
      <Stack.Screen name="[id]/index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]/edit"
        options={{ title: "Edit Dog", headerLeft: () => <HeaderBackButton /> }}
      />
      <Stack.Screen name="[id]/health" options={{ headerShown: false }} />
    </Stack>
  );
}
