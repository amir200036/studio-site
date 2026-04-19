import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendRefundNotification } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { workshop: true },
  });

  if (!booking) return NextResponse.json({ error: "הזמנה לא נמצאה." }, { status: 404 });

  if (booking.paymentStatus === "refunded" || booking.paymentStatus === "cancelled") {
    return NextResponse.json({ error: "ההזמנה כבר בוטלה." }, { status: 400 });
  }

  if (booking.paymentStatus !== "paid") {
    return NextResponse.json({ error: "ניתן להחזיר רק הזמנות ששולמו." }, { status: 400 });
  }

  // בדיקת 90 יום
  const daysSince = (Date.now() - booking.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince > 90) {
    return NextResponse.json(
      { error: "לא ניתן להחזיר תשלום — עברו יותר מ-90 יום מהתשלום. יש לבצע החזר ידני דרך לוח הבקרה של Stripe." },
      { status: 400 }
    );
  }

  // החזר ל-Stripe אם יש סשן
  let refundId: string | null = null;
  if (booking.stripeSessionId) {
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(booking.stripeSessionId);
      if (stripeSession.payment_intent) {
        const refund = await stripe.refunds.create({
          payment_intent: stripeSession.payment_intent as string,
        });
        refundId = refund.id;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: `ה-החזר נכשל ב-Stripe: ${message}. ההזמנה לא בוטלה.` },
        { status: 500 }
      );
    }
  }

  // עדכון הזמנה במסד הנתונים
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: "refunded",
      cancelledAt: new Date(),
      refundId,
    },
  });

  // שליחת מיילים
  await sendRefundNotification({
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    workshopName: booking.workshop.name,
    workshopDate: booking.workshop.date,
    totalAmount: booking.totalAmount,
    refundId,
  }).catch(console.error);

  return NextResponse.json({ success: true });
}
