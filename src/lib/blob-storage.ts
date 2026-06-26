import { del } from "@vercel/blob";

const BLOB_HOST = "blob.vercel-storage.com";

export function isVercelBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.includes(BLOB_HOST);
  } catch {
    return false;
  }
}

/** מוחק קובץ מ-Vercel Blob אם ה-URL שייך ל-Blob (שגיאות נבלעות) */
export async function deleteBlobUrlIfHosted(url: string): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN || !isVercelBlobUrl(url)) return;
  try {
    await del(url);
  } catch (e) {
    console.error("[blob] delete failed:", e instanceof Error ? e.message : e);
  }
}
