import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  }
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return NextResponse.json({ error: "event tidak ditemukan" }, { status: 404 });
  }
  const tamu = await prisma.tamu.findMany({
    where: { event_id: id },
    orderBy: { id: "asc" },
  });
  const rsvp = { hadir: 0, tidak: 0, pending: 0 };
  let checkin = 0;
  let total_pax_hadir = 0;
  for (const t of tamu) {
    if (t.rsvp_status === "hadir") {
      rsvp.hadir++;
      total_pax_hadir += t.jumlah_hadir;
    } else if (t.rsvp_status === "tidak") {
      rsvp.tidak++;
    } else {
      rsvp.pending++;
    }
    if (t.checkin_at) checkin++;
  }
  const recent_checkins = tamu
    .filter((t) => t.checkin_at)
    .sort((a, b) => String(b.checkin_at).localeCompare(String(a.checkin_at)))
    .slice(0, 10)
    .map((t) => ({
      id: t.id,
      nama: t.nama,
      kategori: t.kategori,
      checkin_at: t.checkin_at,
    }));

  return NextResponse.json({
    event: { id: event.id, nama: event.nama },
    total: tamu.length,
    rsvp,
    checkin,
    total_pax_hadir,
    recent_checkins,
  });
}
