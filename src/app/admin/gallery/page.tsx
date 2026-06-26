export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { GalleryLibraryPanel } from "@/components/admin/GalleryLibraryPanel";

export default async function AdminGalleryPage() {
  const gallery = await prisma.galleryImage.findMany({ orderBy: { order: "asc" } });
  return <GalleryLibraryPanel initialGallery={gallery} showPageHeader />;
}
