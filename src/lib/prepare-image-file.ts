/** הכנת קובץ תמונה להעלאה — המרת HEIC (אייפון) ותיקון MIME חסר */
export async function prepareImageFileForUpload(file: File): Promise<File> {
  const name = file.name.toLowerCase();
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif");

  if (isHeic) {
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    const jpgName = name.replace(/\.heif?$/i, ".jpg");
    return new File([blob], jpgName, { type: "image/jpeg" });
  }

  if ((!file.type || file.type === "application/octet-stream") && /\.(jpe?g|png|webp)$/i.test(name)) {
    const ext = name.match(/\.(jpe?g|png|webp)$/i)?.[1] ?? "jpg";
    const mime = ext.startsWith("jp") ? "image/jpeg" : ext === "png" ? "image/png" : "image/webp";
    return new File([file], file.name, { type: mime });
  }

  return file;
}

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/*";
