import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { kirimWhatsApp, pesanUndangan } from "@/lib/wa";
import { nowIso } from "@/lib/format";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const limit = body?.limit == null ? 10 : Number(body.limit);
  if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
    return NextResponse.json(
      { error: "limit harus bilangan bulat 1..100" },
      { status: 400 }
    );
  }
  const antrean = await prisma.waQueue.findMany({
    where: { status: "pending" },
    orderBy: { id: "asc" },
    take: limit,
    include: { tamu: { include: { event: true } } },
  });
  const origin = new URL(req.url).origin;
  const hasil = [];
  for (const q of antrean) {
    const link = `${origin}/u/${q.tamu.token_unik}`;
    const pesan = pesanUndangan(q.tamu.nama, q.tamu.event.nama, link);
    const kirim = await kirimWhatsApp(q.tamu.no_wa, pesan);
    const update = kirim.ok
      ? { status: "sent", attempts: q.attempts + 1, last_error: null, sent_at: nowIso() }
      : { status: "failed", attempts: q.attempts + 1, last_error: kirim.error ?? "gagal mengirim" };
    const updated = await prisma.waQueue.update({ where: { id: q.id }, data: update });
    hasil.push({
      id: updated.id,
      tamu: q.tamu.nama,
      no_wa: q.tamu.no_wa || "-",
      status: updated.status,
      attempts: updated.attempts,
      last_error: updated.last_error,
    });
  }
  return NextResponse.json({
    diproses: hasil.length,
    terkirim: hasil.filter((h) => h.status === "sent").length,
    gagal: hasil.filter((h) => h.status === "failed").length,
    hasil,
  });
}
