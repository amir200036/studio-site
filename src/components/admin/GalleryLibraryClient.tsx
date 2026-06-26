"use client";

import { useState } from "react";
import type { GalleryImage } from "@prisma/client";
import { GalleryLibraryPanel } from "@/components/admin/GalleryLibraryPanel";

interface Props {
  initialGallery: GalleryImage[];
}

export function GalleryLibraryClient({ initialGallery }: Props) {
  const [gallery, setGallery] = useState(initialGallery);
  return <GalleryLibraryPanel gallery={gallery} onGalleryUpdate={setGallery} showPageHeader />;
}
