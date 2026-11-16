import { Image, StyleSheet } from "react-native";
import { BreedTile } from "@/components/BreedTile";
import { getBreedSamplePhoto, NEUTRAL_DOG_IMAGE } from "@/lib/breed-images";
import { breedTileFor } from "@/lib/breed-tile";

/**
 * Select Breed row thumbnail: the breed's licensed sample photo, else its
 * breed tile (distinct per breed), else — for "Mixed Breed" / "Other" — the
 * neutral image. Fills the square frame the sheet gives it.
 */
export function BreedThumb({ breed }: { breed: string }) {
  const photo = getBreedSamplePhoto(breed);
  if (photo) {
    return <Image source={photo} style={styles.fill} resizeMode="cover" />;
  }
  const tile = breedTileFor(breed);
  if (tile) return <BreedTile tile={tile} />;
  return (
    <Image source={NEUTRAL_DOG_IMAGE} style={styles.fill} resizeMode="cover" />
  );
}

const styles = StyleSheet.create({ fill: { width: "100%", height: "100%" } });
