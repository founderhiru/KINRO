import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import {
  colors,
  pressedOpacity,
  spacing,
  touchTarget,
  typography,
} from "@/theme/tokens";
import { SUPPORT_EMAIL } from "./contact";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSection {
  title: string;
  items: FaqItem[];
}

const SECTIONS: FaqSection[] = [
  {
    title: "Getting started",
    items: [
      {
        q: "What is KINRO?",
        a: "KINRO is a health-first platform for dog owners — a place to build a profile for your dog, keep track of health information, discover other dogs and owners nearby, and make trusted connections.",
      },
      {
        q: "Is KINRO free?",
        a: "Yes. Creating an owner and dog profile, browsing Discover, sending and accepting connection requests, and messaging your matches are all free.",
      },
      {
        q: "Can I connect with other dogs or owners for free?",
        a: "Yes. Sending a connection request and getting matched is part of KINRO's free, core experience.",
      },
      {
        q: "How does connecting work?",
        a: "When you find a dog or owner you're interested in, you can send a connection request from their profile. If they accept, you're matched and a conversation opens up. A match is not an agreement to breed, sell, buy, or complete any other transaction — it's simply an introduction.",
      },
    ],
  },
  {
    title: "Dogs & profiles",
    items: [
      {
        q: "What information can I add about my dog?",
        a: "You can add your dog's name, breed, sex, age, city, a bio, photos, and health records (with supporting documents).",
      },
      {
        q: "Can I add more than one dog?",
        a: "Yes. There is no fixed limit on the number of dog profiles in your account.",
      },
      {
        q: "Is my dog's information public?",
        a: "A dog's name, breed, city, age, sex, bio, and photos are visible to anyone browsing Discover — that's how other owners find and connect with your dog. Health record documents are private: Discover only shows whether a dog has a health record on file, never the record itself or its contents. That's visible only to you, the profile owner.",
      },
      {
        q: "Can I delete my dog profile?",
        a: "There's no self-serve delete button for a dog profile in the app today. If you'd like a dog profile removed, contact KINRO support and we'll take care of it.",
      },
    ],
  },
  {
    title: "Connections & safety",
    items: [
      {
        q: "Does KINRO guarantee another user's identity or trustworthiness?",
        a: "No. KINRO does not currently verify user or dog identities, and a connection or match is not an endorsement of the other party. Use your own judgment, meet safely, and verify important details independently — especially anything related to your dog's health or a breeding decision.",
      },
      {
        q: "Can I report another user?",
        a: "Yes. Tap Report or block on a dog profile, or the ⋯ in a conversation. Choose a reason and send it. The KINRO team reviews reports, and the other person isn't told who reported them.",
      },
      {
        q: "Can I block someone?",
        a: "Yes. Tap Report or block on their dog profile, or the ⋯ in your conversation, then choose Block. You'll no longer see each other in Discover or Messages, and they aren't told. You can unblock any time from Profile → Blocked users.",
      },
      {
        q: "What happens when I send a connection request?",
        a: "The dog's owner is notified and can accept or decline. If they accept, you're matched and can start messaging. If they decline or don't respond, no further information is shared.",
      },
      {
        q: "Does sending or accepting a connection request create a legal obligation?",
        a: "No. Sending a request, accepting one, matching and chatting on KINRO do not create a contract, promise or commitment of any kind — with KINRO or with the other person. A match is only an introduction. If you and another owner ever agree on something, that is a separate arrangement between the two of you, and KINRO is not part of it. You can decline a request, stop replying or step away at any time.",
      },
      {
        q: "I'm connected with someone. How do I disconnect later?",
        a: "You are never bound to stay connected, and it costs nothing to leave. Tap Report or block on their dog profile, or the ⋯ in your conversation, then choose Block. Messaging stops and you no longer see each other in Discover or Messages. They are not told. You can unblock any time from Profile → Blocked users. You can also simply stop replying.",
      },
      {
        q: "Can I stop using KINRO after I register?",
        a: "Yes, at any time, with no fee and no notice period. To close your account, go to Profile → Delete account in the app, or sign in on the website, open Profile and choose Delete account. This permanently deletes your profile, your dogs with their photos and health records, and your conversations, and it cannot be undone. Safety reports are kept, as they may involve other people. If you only want a break, you can sign out and stop using the app; nothing renews or is charged.",
      },
    ],
  },
  {
    title: "Privacy",
    items: [
      {
        q: "Does KINRO sell my personal information?",
        a: "No. KINRO does not sell your personal information.",
      },
      {
        q: "Does KINRO share my information?",
        a: "KINRO shares information only with the service providers that help run the app — for things like authentication, email, storage, and hosting — and where necessary to comply with the law, protect users, or keep the platform secure. Your dog's public profile fields are visible to other users browsing Discover; your own contact details (email/phone) are never shown to other users.",
      },
      {
        q: "What happens to my photos and documents?",
        a: "You keep the rights to what you upload. Dog photos are used to show your dog's profile in Discover. Health documents are kept private and are only ever accessible to you — they're never made public or shown to other users.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes. Go to Profile → Delete account. This permanently deletes your profile, your dogs with their photos and health records, and your conversations.",
      },
    ],
  },
  {
    title: "Health & breeding",
    items: [
      {
        q: "Is KINRO a veterinary service?",
        a: "No. KINRO is not a veterinary service, and nothing in the app is veterinary diagnosis or medical advice. KINRO Care lists vets and clinics so you can contact them; any care is provided by them, not by KINRO. Always consult a qualified veterinarian about your dog's health.",
      },
      {
        q: "Can I use KINRO for breeding?",
        a: "KINRO can help you discover and connect with other dog owners, including for breeding-related conversations, but a connection or match is never a recommendation or guarantee that two dogs should be bred.",
      },
      {
        q: "Does KINRO recommend that two dogs should be bred?",
        a: "No. KINRO doesn't evaluate or recommend breeding matches. Owners should independently consider health, pedigree, temperament, and welfare, and consult qualified professionals where appropriate.",
      },
    ],
  },
  {
    title: "KINRO Care",
    items: [
      {
        q: "What is KINRO Care?",
        a: "KINRO Care helps you find vets and clinics and request a visit for your dog. It is separate from Dog Connections: vets do not appear in Discover or in your matches.",
      },
      {
        q: "What does “Verified by KINRO” mean?",
        a: "KINRO has checked the vet's registration with their veterinary council. A listing without that label has not been checked by KINRO, so ask to see their registration before relying on it. Verification is not an endorsement of any treatment.",
      },
      {
        q: "How do I request a visit?",
        a: "Open a vet or clinic, tap Request appointment, choose your dog, the reason and a preferred time, and add your phone number. KINRO emails the request to the vet or clinic. When they confirm or decline, you see the answer in Messages under Care. They then contact you on the number you gave to agree the time.",
      },
      {
        q: "Does KINRO share my dog's health records with vets?",
        a: "No. Your dog's health records stay private to you. A visit request shares only your dog's name, breed and age, the reason, your preferred time, your message and your phone number.",
      },
      {
        q: "Does KINRO charge for vet visits?",
        a: "No. KINRO does not take payments for vet visits. Any fee is set by the vet or clinic and paid to them directly.",
      },
      {
        q: "Can I consult a vet online?",
        a: "Some vets offer online consultation. When they do, you can choose Online when you request a visit. When the vet confirms, they share a video-call link (Google Meet, Zoom, WhatsApp or similar) and you tap Join video call in Messages. The call happens on that service. KINRO does not host or record it. Online consultation is not for emergencies.",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        q: "How can I contact KINRO?",
        a: `Go to Profile → Help & Trust → Contact Support, or email us directly at ${SUPPORT_EMAIL}.`,
      },
    ],
  },
];

function AccordionItem({ item }: { item: FaqItem }) {
  const [expanded, setExpanded] = useState(false);

  function toggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }

  return (
    <View>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={item.q}
        style={({ pressed }) => [
          styles.question,
          pressed ? { opacity: pressedOpacity } : null,
        ]}
      >
        <Text style={[typography.body, styles.questionText]}>{item.q}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>
      {expanded ? (
        <Text style={[typography.bodyMuted, styles.answer]}>{item.a}</Text>
      ) : null}
    </View>
  );
}

export default function FaqScreen() {
  return (
    <Screen>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
      >
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[typography.label, styles.sectionLabel]}>
              {section.title.toUpperCase()}
            </Text>
            <Card style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <View key={item.q}>
                  <AccordionItem item={item} />
                  {index < section.items.length - 1 ? (
                    <View style={styles.divider} />
                  ) : null}
                </View>
              ))}
            </Card>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scroll: { paddingTop: spacing.md, paddingBottom: spacing.xl },
  section: { marginBottom: spacing.lg },
  sectionLabel: { marginBottom: spacing.xs, marginLeft: spacing.xs },
  sectionCard: {},
  question: {
    minHeight: touchTarget.minHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  questionText: { flex: 1, marginRight: spacing.sm, fontWeight: "600" },
  answer: { paddingBottom: spacing.sm },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
