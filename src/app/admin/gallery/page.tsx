export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { GalleryLibraryClient } from "@/components/admin/GalleryLibraryClient";

export default async function AdminGalleryPage() {
  const gallery = await prisma.galleryImage.findMany({ orderBy: { order: "asc" } });
  return <GalleryLibraryClient initialGallery={gallery} />;
}
