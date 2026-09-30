import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nowIso } from "@/lib/format";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = String(body?.token ?? "").trim();
  if (!token) {
    return NextResponse.json({ error: "token wajib diisi" }, { status: 400 });
  }
  const tamu = await prisma.tamu.findUnique({
    where: { token_unik: token },
    include: { event: true },
  });
  if (!tamu) {
    return NextResponse.json({ error: "token tidak dikenal" }, { status: 404 });
  }
  if (tamu.checkin_at) {
    return NextResponse.json(
      {
        error: "tamu sudah check-in sebelumnya",
        checkin_at: tamu.checkin_at,
        tamu: { id: tamu.id, nama: tamu.nama },
      },
      { status: 409 }
    );
  }
  const updated = await prisma.tamu.update({
    where: { id: tamu.id },
    data: { checkin_at: nowIso() },
    include: { event: true },
  });
  return NextResponse.json({
    id: updated.id,
    nama: updated.nama,
    kategori: updated.kategori,
    rsvp_status: updated.rsvp_status,
    jumlah_hadir: updated.jumlah_hadir,
    checkin_at: updated.checkin_at,
    event: { id: updated.event.id, nama: updated.event.nama },
  });
}
