import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/tokens";

// 5 tabs with icon + label need a little more room than the old 4-tab bar
// (54), otherwise labels clip when there is no bottom safe-area inset.
const TAB_BAR_CONTENT_HEIGHT = 62;

type TabRouteName = "home" | "discover" | "my-dog" | "matches" | "profile";

// Ionicons outline/filled pairs — outline for inactive, filled for
// active, matching react-navigation's own (focused, color, size) signature.
// @expo/vector-icons ships as a dependency of `expo` itself (already
// installed — see mobile/package.json), so this adds no new dependency.
// A switch (rather than a Record lookup) sidesteps noUncheckedIndexedAccess
// entirely, since every branch returns a definite, non-optional value.
function iconNamesFor(routeName: TabRouteName): {
  outline: string;
  filled: string;
} {
  switch (routeName) {
    case "home":
      return { outline: "home-outline", filled: "home" };
    case "discover":
      return { outline: "compass-outline", filled: "compass" };
    case "my-dog":
      return { outline: "paw-outline", filled: "paw" };
    case "matches":
      return { outline: "chatbubble-outline", filled: "chatbubble" };
    case "profile":
      return { outline: "person-outline", filled: "person" };
  }
}

function makeTabBarIcon(routeName: TabRouteName) {
  const icons = iconNamesFor(routeName);
  return ({
    focused,
    color,
    size,
  }: {
    focused: boolean;
    color: string;
    size: number;
  }) => (
    <Ionicons
      name={(focused ? icons.filled : icons.outline) as never}
      size={size}
      color={color}
    />
  );
}

/**
 * Five tabs: Home | Discover | My Dogs | Messages | Profile.
 *
 * Route folders (kept stable so existing router.push targets keep working):
 *   - `home`    — the dashboard (greeting, My Dogs rail, prompts).
 *   - `my-dog`  — the owner's dog list plus Add Dog / Dog Profile / Edit /
 *                 Health screens (its stack).
 *   - `matches` — shown as "Messages": incoming interest requests and the
 *                 conversations opened by mutual interest.
 * Home is the default landing tab for guests and signed-in owners alike.
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        // Explicit background/border/height, computed from the actual
        // safe-area inset rather than left to the platform default: on
        // iOS + New Architecture (see app.json's newArchEnabled) the
        // bottom tab bar can otherwise measure to zero height and
        // disappear even though it's mounted. This guarantees a fixed,
        // always-visible bar that sits above the home indicator.
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom || 6,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: "Home", tabBarIcon: makeTabBarIcon("home") }}
      />
      <Tabs.Screen
        name="discover"
        options={{ title: "Discover", tabBarIcon: makeTabBarIcon("discover") }}
      />
      <Tabs.Screen
        name="my-dog"
        options={{ title: "My Dogs", tabBarIcon: makeTabBarIcon("my-dog") }}
      />
      <Tabs.Screen
        name="matches"
        options={{ title: "Messages", tabBarIcon: makeTabBarIcon("matches") }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: makeTabBarIcon("profile") }}
      />
    </Tabs>
  );
}
