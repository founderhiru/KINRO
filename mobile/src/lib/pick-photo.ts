import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import type { PickedImage } from "@/lib/dog-api";
import { PHOTO_JPEG_QUALITY, resizeTarget } from "@/lib/photo-resize";

/**
 * Opens the native photo library picker (camera roll) and returns a
 * PickedImage ready for uploadDogPhoto(), or null if the user cancelled or
 * permission was denied. Ordinary dog photos are downscaled to about 1280 px
 * on the longest side and re-encoded as JPEG before upload, so storage and
 * loading stay small. If resizing fails for any reason the original is used.
 * Health documents never go through here. Kept as one small function so screens don't each
 * re-derive the {uri, name, type} shape multipart upload needs.
 */
export async function pickDogPhoto(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];

  try {
    const target = resizeTarget(asset.width, asset.height);
    const resized = await ImageManipulator.manipulateAsync(
      asset.uri,
      target ? [{ resize: target }] : [],
      {
        compress: PHOTO_JPEG_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );
    return { uri: resized.uri, name: "photo.jpg", type: "image/jpeg" };
  } catch {
    // Fall back to the original rather than blocking the upload.
  }

  const extension = asset.uri.split(".").pop()?.toLowerCase() ?? "jpg";
  const mimeType =
    extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg";

  return {
    uri: asset.uri,
    name: `photo.${extension === "jpg" || extension === "jpeg" ? "jpg" : extension}`,
    type: mimeType,
  };
}
