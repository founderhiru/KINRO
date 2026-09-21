import { Stack } from "expo-router";
import { HeaderBackButton } from "@/components/HeaderBackButton";
import { colors } from "@/theme/tokens";

export default function HealthPassportLayout() {
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
        options={{
          title: "Health Passport",
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Add Health Record",
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen
        name="[recordId]/edit"
        options={{
          title: "Edit Record",
          headerLeft: () => <HeaderBackButton />,
        }}
      />
    </Stack>
  );
}
