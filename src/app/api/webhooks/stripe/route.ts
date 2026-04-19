import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmation, sendAdminNotification, sendWebhookFailureNotification } from "@/lib/email";
import { getAvailableSeats } from "@/lib/utils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret || webhookSecret === "whsec_...") {
      event = JSON.parse(body) as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    }
  } catch (err) {
    console.error("Webhook שגיאת אימות:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { workshopId, customerName, customerEmail, seats } = session.metadata || {};

    if (!workshopId || !customerName || !customerEmail || !seats) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const seatsNum = parseInt(seats, 10);

    // בדיקה שהסשן לא טופל כבר
    const existing = await prisma.booking.findUnique({ where: { stripeSessionId: session.id } });
    if (existing) return NextResponse.json({ received: true });

    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      include: { bookings: { where: { paymentStatus: "paid" } } },
    });
    if (!workshop) return NextResponse.json({ received: true });

    // בדיקת race condition — האם נותרו מקומות?
    const available = getAvailableSeats(workshop.maxParticipants, workshop.bookings);
    if (seatsNum > available) {
      // החזר תשלום אוטומטי
      try {
        if (session.payment_intent) {
          await stripe.refunds.create({ payment_intent: session.payment_intent as string });
        }
        await sendWebhookFailureNotification({
          reason: `אזלו המקומות לאחר תשלום. זוהה race condition — ${seatsNum} מקומות התבקשו אך נותרו ${available}.`,
          sessionId: session.id,
          customerName,
          customerEmail,
          workshopName: workshop.name,
          refunded: true,
        });
      } catch (refundErr) {
        console.error("שגיאה בהחזר תשלום:", refundErr);
        await sendWebhookFailureNotification({
          reason: `אזלו המקומות — ניסיון החזר נכשל! יש לבצע החזר ידני לסשן ${session.id}.`,
          sessionId: session.id,
          customerName,
          customerEmail,
          workshopName: workshop.name,
          refunded: false,
        });
      }
      return NextResponse.json({ received: true });
    }

    try {
      // יצירת הזמנה
      const booking = await prisma.booking.create({
        data: {
          workshopId,
          customerName,
          customerEmail,
          seats: seatsNum,
          totalAmount: (session.amount_total || 0) / 100,
          stripeSessionId: session.id,
          paymentStatus: "paid",
        },
      });

      // שליחת מיילים
      await Promise.all([
        sendBookingConfirmation({
          customerName,
          customerEmail,
          workshopName: workshop.name,
          workshopDate: workshop.date,
          seats: seatsNum,
          totalAmount: booking.totalAmount,
        }),
        sendAdminNotification({
          customerName,
          customerEmail,
          workshopName: workshop.name,
          workshopDate: workshop.date,
          seats: seatsNum,
          totalAmount: booking.totalAmount,
        }),
      ]);
    } catch (err) {
      console.error("שגיאה בעיבוד webhook:", err);
      await sendWebhookFailureNotification({
        reason: `שגיאה בעיבוד ה-webhook: ${err instanceof Error ? err.message : String(err)}`,
        sessionId: session.id,
        customerName,
        customerEmail,
        workshopName: workshop.name,
        refunded: false,
      }).catch(console.error);
    }
  }

  return NextResponse.json({ received: true });
}
