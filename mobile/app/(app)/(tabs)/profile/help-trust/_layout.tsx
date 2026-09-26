import { Stack } from "expo-router";
import { HeaderBackButton } from "@/components/HeaderBackButton";
import { colors } from "@/theme/tokens";

export default function HelpAndTrustLayout() {
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
          title: "Help & Trust",
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen
        name="faq"
        options={{ title: "FAQ", headerLeft: () => <HeaderBackButton /> }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          title: "Privacy Policy",
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen
        name="security"
        options={{
          title: "Security",
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          title: "Terms of Service",
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen
        name="contact"
        options={{
          title: "Contact Support",
          headerLeft: () => <HeaderBackButton />,
        }}
      />
    </Stack>
  );
}
