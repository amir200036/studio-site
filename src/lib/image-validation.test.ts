import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { sanitizeUploadedImage } from "@/lib/image-validation";

describe("sanitizeUploadedImage", () => {
  it("decodes PNG and removes EXIF when re-encoding", async () => {
    const input = await sharp({
      create: { width: 2, height: 2, channels: 4, background: "#a16207" },
    })
      .png()
      .withExif({ IFD0: { Artist: "private" } })
      .toBuffer();

    const result = await sanitizeUploadedImage(input);
    const metadata = await sharp(result.bytes).metadata();
    expect(result.mime).toBe("image/png");
    expect(result.ext).toBe("png");
    expect(metadata.width).toBe(2);
    expect(metadata.exif).toBeUndefined();
  });

  it.each([
    ["jpeg", "image/jpeg", "jpg"],
    ["webp", "image/webp", "webp"],
  ] as const)("accepts decoded %s", async (format, mime, ext) => {
    const input = await sharp({
      create: { width: 2, height: 2, channels: 3, background: "#a16207" },
    })[format]().toBuffer();
    const result = await sanitizeUploadedImage(input);
    expect(result.mime).toBe(mime);
    expect(result.ext).toBe(ext);
    expect((await sharp(result.bytes).metadata()).format).toBe(format);
  });

  it("rejects a script declared as an image", async () => {
    await expect(sanitizeUploadedImage(Buffer.from("<script>alert(1)</script>")))
      .rejects.toThrow("unsupported or corrupt image");
  });

  it("rejects inputs larger than 8 MiB before decoding", async () => {
    await expect(sanitizeUploadedImage(Buffer.alloc(8 * 1024 * 1024 + 1)))
      .rejects.toThrow("image input too large");
  });

  it("rejects an image wider than 12,000 pixels", async () => {
    const input = await sharp({
      create: { width: 12_001, height: 1, channels: 3, background: "#a16207" },
    }).png().toBuffer();
    await expect(sanitizeUploadedImage(input)).rejects.toThrow("image dimensions too large");
  });

  it("rejects images over 40 megapixels", async () => {
    const input = await sharp({
      create: { width: 7_000, height: 6_000, channels: 3, background: "#a16207" },
    }).png().toBuffer();
    await expect(sanitizeUploadedImage(input)).rejects.toThrow();
  });

  it("rejects animated WebP", async () => {
    const raw = Buffer.alloc(2 * 4 * 4, 255);
    raw.fill(0, 2 * 2 * 4);
    const input = await sharp(raw, {
      raw: { width: 2, height: 4, channels: 4, pageHeight: 2 },
    }).webp({ loop: 0, delay: [100, 100] }).toBuffer();
    expect((await sharp(input, { animated: true }).metadata()).pages).toBe(2);
    await expect(sanitizeUploadedImage(input)).rejects.toThrow("animated images are not supported");
  });
});
