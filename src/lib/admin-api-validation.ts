import { isAllowedImageUrl, isValidEmail } from "@/lib/sanitize";

const WORKSHOP_STATUSES = new Set(["active", "blocked", "cancelled"]);

export type WorkshopInput = {
  name: string;
  date: Date | null;
  durationHours: number;
  description: string;
  imageUrl: string | null;
  pricePerPerson: number;
  maxParticipants: number;
  status: string;
  whatsappMessage: string | null;
};

export function parseWorkshopInput(body: unknown): WorkshopInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  if (typeof b.name !== "string" || !b.name.trim() || b.name.length > 200) return null;
  if (typeof b.description !== "string" || b.description.length > 10_000) return null;

  const durationHours = Number(b.durationHours);
  const pricePerPerson = Number(b.pricePerPerson);
  const maxParticipants = Number(b.maxParticipants);
  if (!Number.isFinite(durationHours) || durationHours <= 0 || durationHours > 24) return null;
  if (!Number.isFinite(pricePerPerson) || pricePerPerson < 0 || pricePerPerson > 100_000) return null;
  if (!Number.isFinite(maxParticipants) || maxParticipants < 1 || maxParticipants > 500) return null;

  const status = typeof b.status === "string" && WORKSHOP_STATUSES.has(b.status) ? b.status : "active";

  let date: Date | null = null;
  if (b.date != null && b.date !== "") {
    const d = new Date(String(b.date));
    if (Number.isNaN(d.getTime())) return null;
    date = d;
  }

  const imageUrl =
    typeof b.imageUrl === "string" && b.imageUrl.trim() ? b.imageUrl.trim() : null;
  if (!isAllowedImageUrl(imageUrl)) return null;

  const whatsappMessage =
    typeof b.whatsappMessage === "string" && b.whatsappMessage.trim()
      ? b.whatsappMessage.trim().slice(0, 2000)
      : null;

  return {
    name: b.name.trim(),
    date,
    durationHours,
    description: b.description,
    imageUrl,
    pricePerPerson,
    maxParticipants,
    status,
    whatsappMessage,
  };
}

export type BookingInput = {
  customerName: string;
  customerEmail: string;
  seats: number;
};

export function parseBookingInput(body: unknown): BookingInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  if (typeof b.customerName !== "string" || !b.customerName.trim() || b.customerName.length > 100) {
    return null;
  }
  if (typeof b.customerEmail !== "string" || !isValidEmail(b.customerEmail.trim())) return null;

  const seats = Number(b.seats);
  if (!Number.isInteger(seats) || seats < 1 || seats > 50) return null;

  return {
    customerName: b.customerName.trim(),
    customerEmail: b.customerEmail.trim().toLowerCase(),
    seats,
  };
}

export type FaqInput = { question: string; answer: string; order: number };

export function parseFaqInput(body: unknown): FaqInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.question !== "string" || !b.question.trim() || b.question.length > 500) return null;
  if (typeof b.answer !== "string" || !b.answer.trim() || b.answer.length > 10_000) return null;
  const order =
    typeof b.order === "number" && Number.isFinite(b.order) ? Math.max(0, Math.floor(b.order)) : 0;
  return { question: b.question.trim(), answer: b.answer.trim(), order };
}

export type EventInput = {
  name: string;
  description: string;
  imageUrl: string | null;
  whatsappMessage: string | null;
  active: boolean;
  order: number;
};

export function parseEventInput(body: unknown): EventInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.name !== "string" || !b.name.trim() || b.name.length > 200) return null;
  if (typeof b.description !== "string" || b.description.length > 10_000) return null;

  const imageUrl =
    typeof b.imageUrl === "string" && b.imageUrl.trim() ? b.imageUrl.trim() : null;
  if (!isAllowedImageUrl(imageUrl)) return null;

  const whatsappMessage =
    typeof b.whatsappMessage === "string" && b.whatsappMessage.trim()
      ? b.whatsappMessage.trim().slice(0, 2000)
      : null;

  return {
    name: b.name.trim(),
    description: b.description,
    imageUrl,
    whatsappMessage,
    active: b.active !== false,
    order:
      typeof b.order === "number" && Number.isFinite(b.order) ? Math.max(0, Math.floor(b.order)) : 0,
  };
}

export function parseEventPatch(
  body: unknown,
  existing: { name: string; description: string; imageUrl: string | null; whatsappMessage: string | null; active: boolean; order: number }
): EventInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  if (typeof b.active === "boolean" && Object.keys(b).length === 1) {
    return {
      name: existing.name,
      description: existing.description,
      imageUrl: existing.imageUrl,
      whatsappMessage: existing.whatsappMessage,
      active: b.active,
      order: existing.order,
    };
  }

  return parseEventInput(body);
}

export type ReviewInput = { authorName: string; content: string; rating: number };

export function parseReviewInput(body: unknown): ReviewInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.authorName !== "string" || !b.authorName.trim() || b.authorName.length > 100) return null;
  if (typeof b.content !== "string" || !b.content.trim() || b.content.length > 2000) return null;
  const rating = Number(b.rating ?? 5);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  return { authorName: b.authorName.trim(), content: b.content.trim(), rating };
}

export type AdminEmailInput = { to?: string; subject: string; body: string };

export function parseAdminEmailInput(body: unknown, requireTo = false): AdminEmailInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  if (typeof b.subject !== "string" || !b.subject.trim() || b.subject.length > 200) return null;
  if (typeof b.body !== "string" || !b.body.trim() || b.body.length > 20_000) return null;

  if (requireTo) {
    if (typeof b.to !== "string" || !isValidEmail(b.to.trim())) return null;
    return { to: b.to.trim().toLowerCase(), subject: b.subject.trim(), body: b.body };
  }

  return { subject: b.subject.trim(), body: b.body };
}
