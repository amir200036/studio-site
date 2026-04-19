import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { authorName, content, rating } = await req.json();
  if (!authorName || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const review = await prisma.review.create({
    data: { authorName, content, rating: rating || 5, approved: true },
  });
  return NextResponse.json(review);
}
