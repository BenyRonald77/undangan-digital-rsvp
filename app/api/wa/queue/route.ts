import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const raw = new URL(req.url).searchParams.get("event_id");
  if (raw == null || raw.trim() === "") {
    return NextResponse.json({ error: "event_id wajib diisi" }, { status: 400 });
  }
  const event_id = Number(raw);
  if (!Number.isInteger(event_id)) {
    return NextResponse.json({ error: "event_id tidak valid" }, { status: 400 });
  }
  const antrean = await prisma.waQueue.findMany({
    where: { tamu: { event_id } },
    orderBy: { id: "asc" },
    include: { tamu: true },
  });
  return NextResponse.json(
    antrean.map((q) => ({
      id: q.id,
      tamu_id: q.tamu_id,
      nama: q.tamu.nama,
      no_wa: q.tamu.no_wa,
      kategori: q.tamu.kategori,
      status: q.status,
      attempts: q.attempts,
      last_error: q.last_error,
      sent_at: q.sent_at,
    }))
  );
}
