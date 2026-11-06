import sharp from "sharp";
import type { Metadata } from "sharp";

const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const MAX_SIDE_PIXELS = 12_000;
const MAX_TOTAL_PIXELS = 40_000_000;

const OUTPUT_FORMATS = {
  jpeg: { mime: "image/jpeg", ext: "jpg" },
  png: { mime: "image/png", ext: "png" },
  webp: { mime: "image/webp", ext: "webp" },
} as const;

type ImageFormat = keyof typeof OUTPUT_FORMATS;
export type ImageRejectionCategory =
  | "oversized_input"
  | "unsupported_or_corrupt"
  | "dimensions"
  | "animated";

export class ImageValidationError extends Error {
  constructor(message: string, readonly category: ImageRejectionCategory) {
    super(message);
    this.name = "ImageValidationError";
  }
}

export async function sanitizeUploadedImage(
  input: Buffer
): Promise<{
  bytes: Buffer;
  mime: "image/jpeg" | "image/png" | "image/webp";
  ext: "jpg" | "png" | "webp";
}> {
  if (input.length > MAX_INPUT_BYTES) {
    throw new ImageValidationError("image input too large", "oversized_input");
  }

  let metadata: Metadata;
  try {
    metadata = await sharp(input, {
      animated: true,
      limitInputPixels: MAX_TOTAL_PIXELS,
      failOn: "error",
    }).metadata();
  } catch {
    throw new ImageValidationError("unsupported or corrupt image", "unsupported_or_corrupt");
  }

  if (!(metadata.format in OUTPUT_FORMATS)) {
    throw new ImageValidationError("unsupported or corrupt image", "unsupported_or_corrupt");
  }
  if (!metadata.width || !metadata.height ||
      metadata.width > MAX_SIDE_PIXELS || metadata.height > MAX_SIDE_PIXELS ||
      metadata.width * metadata.height > MAX_TOTAL_PIXELS) {
    throw new ImageValidationError("image dimensions too large", "dimensions");
  }
  if ((metadata.pages ?? 1) > 1) {
    throw new ImageValidationError("animated images are not supported", "animated");
  }

  const format = metadata.format as ImageFormat;
  try {
    const pipeline = sharp(input, {
      limitInputPixels: MAX_TOTAL_PIXELS,
      failOn: "error",
    }).rotate();
    const bytes = await pipeline.toFormat(format).toBuffer();
    return { bytes, ...OUTPUT_FORMATS[format] };
  } catch {
    throw new ImageValidationError("unsupported or corrupt image", "unsupported_or_corrupt");
  }
}
