import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Idempoten: tamu yang sudah punya entri 'sent' atau 'pending' tidak
// dibuatkan entri baru.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const event_id = Number(body?.event_id);
  if (!Number.isInteger(event_id)) {
    return NextResponse.json({ error: "event_id tidak valid" }, { status: 400 });
  }
  const event = await prisma.event.findUnique({ where: { id: event_id } });
  if (!event) {
    return NextResponse.json({ error: "event tidak ditemukan" }, { status: 404 });
  }
  const tamu = await prisma.tamu.findMany({ where: { event_id } });
  const sudah = await prisma.waQueue.findMany({
    where: { tamu_id: { in: tamu.map((t) => t.id) } },
  });
  const terkirim = new Set(
    sudah.filter((q) => q.status === "sent" || q.status === "pending").map((q) => q.tamu_id)
  );
  let dibuat = 0;
  for (const t of tamu) {
    if (terkirim.has(t.id)) continue;
    await prisma.waQueue.create({ data: { tamu_id: t.id, status: "pending" } });
    dibuat++;
  }
  return NextResponse.json({ event_id, dibuat, dilewati: tamu.length - dibuat });
}
