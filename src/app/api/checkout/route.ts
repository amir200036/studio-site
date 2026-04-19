import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getAvailableSeats } from "@/lib/utils";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(req: NextRequest) {
  // Rate limiting — 5 הזמנות לדקה מאותה IP
  const ip = getClientIp(req);
  const { allowed } = rateLimit(ip, "checkout", { maxRequests: 5, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json({ error: "יותר מדי בקשות. נסו שוב בעוד דקה." }, { status: 429 });
  }

  try {
    const { workshopId, customerName, customerEmail, seats } = await req.json();

    if (!workshopId || !customerName || !customerEmail || !seats) {
      return NextResponse.json({ error: "חסרים פרטים." }, { status: 400 });
    }

    if (seats < 1 || seats > 4) {
      return NextResponse.json({ error: "ניתן להזמין בין 1 ל-4 מקומות." }, { status: 400 });
    }

    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      include: { bookings: { where: { paymentStatus: "paid" } } },
    });

    if (!workshop || workshop.status !== "active") {
      return NextResponse.json({ error: "הסדנה אינה זמינה." }, { status: 404 });
    }

    const available = getAvailableSeats(workshop.maxParticipants, workshop.bookings);
    if (seats > available) {
      return NextResponse.json({ error: `נותרו ${available} מקומות בלבד.` }, { status: 400 });
    }

    // מניעת הרשמה כפולה לאותו מייל באותה סדנה
    const existing = await prisma.booking.findFirst({
      where: { workshopId, customerEmail, paymentStatus: "paid" },
    });
    if (existing) {
      return NextResponse.json({ error: "כבר קיימת הרשמה עם כתובת מייל זו לסדנה זו." }, { status: 400 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "ils",
            product_data: {
              name: workshop.name,
              description: `${seats} מקומות — ${new Date(workshop.date).toLocaleDateString("he-IL")}`,
            },
            unit_amount: Math.round(workshop.pricePerPerson * 100),
          },
          quantity: seats,
        },
      ],
      metadata: { workshopId, customerName, customerEmail, seats: String(seats) },
      success_url: `${baseUrl}/workshops/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/workshops`,
      locale: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("שגיאת Stripe:", err);
    return NextResponse.json({ error: "שגיאה בעיבוד התשלום." }, { status: 500 });
  }
}
