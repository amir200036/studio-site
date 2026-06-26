import { STUDIO_WHATSAPP } from "@/lib/studio-contact";

export function resolveWhatsAppNumber(): string {
  return STUDIO_WHATSAPP.replace(/\D/g, "");
}
