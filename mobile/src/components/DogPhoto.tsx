import { useState } from "react";
import {
  Image,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { Skeleton } from "@/components/Skeleton";
import { getBreedSamplePhoto, NEUTRAL_DOG_IMAGE } from "@/lib/breed-images";
import { colors } from "@/theme/tokens";

/**
 * A photo url is only ever worth attempting to load if it's an absolute
 * http(s) URL — which is exactly what the backend's publicUrlFor() always
 * produces (see src/lib/storage.ts) when correctly configured. Guards
 * against a misconfigured R2_PUBLIC_HOSTNAME (unset in Render's
 * dashboard) producing a malformed url like "https:///dogs/..." — some
 * platforms never fire an Image's onError for a URI that broken, which
 * would otherwise leave this component stuck silently rendering nothing
 * instead of falling back. Checking up front means the fallback doesn't
 * depend on that callback firing at all — this is deliberate, not just
 * relying on onError (see Phase 6 of the image-implementation notes).
 */
function isLoadableUri(uri: string): boolean {
  return /^https?:\/\/.+/.test(uri);
}

/**
 * Single source of truth for "a dog's photo, or a graceful stand-in" —
 * used anywhere a dog's cover photo appears (Discover cards, My Dog
 * cards, Dog Detail hero, owner profile previews). Photo priority:
 *
 *   1. The dog's own uploaded photo (`uri`), if present and safely loadable.
 *   2. The licensed real sample photo for the dog's `breed`, if the breed
 *      pack has one (see src/lib/breed-images.ts).
 *   3. A neutral, non-illustrated placeholder (NEUTRAL_DOG_IMAGE).
 *
 * This ordering (and rendering the fallback synchronously whenever
 * `uri` is absent or fails validation, rather than waiting on a load
 * attempt) is what makes tiers 2/3 render immediately for guests
 * browsing — no login, no R2, no network round trip, and no
 * dependence on a remote image ever actually erroring out.
 *
 * Handles the loading/error cases throughout: a pulsing skeleton while a
 * real photo is downloading, and a fallback to tier 2/3 if that download
 * ever fails or the url is malformed. Every tier renders through the
 * same <Image resizeMode="cover"> treatment, so rounded corners (set by
 * the caller via `style` + `overflow: hidden`) apply consistently, and
 * every tier gives the Image a non-zero size because `style` always
 * comes from the caller's own fixed-dimension layout (see PublicDogCard,
 * DogCard, and the Dog Detail heroes for the actual width/height).
 */
export function DogPhoto({
  uri,
  breed,
  style,
  emptyLabel,
  sampleLabel,
}: {
  uri: string | null | undefined;
  /** The dog's breed, used to pick its breed sample photo when there's no real uri. */
  breed?: string | null;
  style?: StyleProp<ViewStyle>;
  /** Small caption chip shown over the fallback image, e.g. "No photo yet". Omit for a bare fallback (used in dense card grids, and always omitted for public Discover cards). */
  emptyLabel?: string;
  /** Caption shown ONLY while the breed sample photo is displayed (not over an uploaded photo or the neutral image), e.g. "Sample photo" on public cards. Takes precedence over `emptyLabel`. */
  sampleLabel?: string;
}) {
  const canAttemptLoad = !!uri && isLoadableUri(uri);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    canAttemptLoad ? "loading" : "error",
  );

  // Narrow thumbnails (Discover's list rows) get a smaller caption chip so
  // it fits instead of truncating; wider cards keep the standard chip.
  const [width, setWidth] = useState(0);
  const compactLabel = width > 0 && width < COMPACT_LABEL_MAX_WIDTH;

  const showFallback = !canAttemptLoad || status === "error";
  const samplePhoto = getBreedSamplePhoto(breed);
  const fallbackSource = samplePhoto ?? NEUTRAL_DOG_IMAGE;
  const label = !showFallback
    ? null
    : samplePhoto && sampleLabel
      ? sampleLabel
      : (emptyLabel ?? null);

  return (
    <View style={style} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Image
        source={showFallback ? fallbackSource : { uri: uri as string }}
        // iOS shows this immediately while the real photo above is still
        // downloading, so there's never a blank frame during the network
        // fetch (Android ignores defaultSource; the Skeleton below covers
        // that case instead). Harmless — and never shown at all — in the
        // showFallback branch, since source and defaultSource are then
        // the same image.
        defaultSource={fallbackSource}
        style={styles.image}
        resizeMode="cover"
        onLoadEnd={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
      {!showFallback && status === "loading" ? (
        // height is irrelevant here — absoluteFill's inset-0 positioning
        // stretches this to match the Image regardless of Skeleton's own
        // (number-only) height prop.
        <Skeleton height={1} borderRadius={0} style={StyleSheet.absoluteFill} />
      ) : null}
      {label ? (
        <View
          style={[styles.labelRow, compactLabel && styles.labelRowCompact]}
          pointerEvents="none"
        >
          <View
            style={[styles.labelChip, compactLabel && styles.labelChipCompact]}
          >
            <Text
              style={[
                styles.labelChipText,
                compactLabel && styles.labelChipTextCompact,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={compactLabel}
              minimumFontScale={0.8}
            >
              {label}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const COMPACT_LABEL_MAX_WIDTH = 140;

const styles = StyleSheet.create({
  // Explicit 100% size (not just absoluteFill) so the photo fills its frame
  // on every platform, including react-native-web previews, instead of
  // showing at its natural size in the top-left corner.
  image: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  // Full-width row that centers the chip: an absolutely positioned chip
  // centered with alignSelf alone gets measured too narrow and truncates.
  labelRow: {
    position: "absolute",
    left: 4,
    right: 4,
    bottom: 8,
    alignItems: "center",
  },
  labelRowCompact: { left: 2, right: 2, bottom: 5 },
  labelChip: {
    backgroundColor: "rgba(20,15,10,0.55)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  labelChipText: {
    color: colors.textOnDark,
    fontSize: 12,
    fontWeight: "600",
  },
  labelChipCompact: { paddingHorizontal: 5, paddingVertical: 2 },
  labelChipTextCompact: { fontSize: 10 },
});
