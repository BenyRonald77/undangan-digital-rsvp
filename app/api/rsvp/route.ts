import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = String(body?.token ?? "").trim();
  const status = String(body?.status ?? "").trim();
  const jumlah_hadir = Number(body?.jumlah_hadir ?? 0);

  if (!token) {
    return NextResponse.json({ error: "token wajib diisi" }, { status: 400 });
  }
  if (status !== "hadir" && status !== "tidak") {
    return NextResponse.json(
      { error: "status harus 'hadir' atau 'tidak'" },
      { status: 400 }
    );
  }
  if (status === "hadir" && (!Number.isInteger(jumlah_hadir) || jumlah_hadir <= 0)) {
    return NextResponse.json(
      { error: "jumlah_hadir harus lebih dari 0 jika hadir" },
      { status: 400 }
    );
  }
  const tamu = await prisma.tamu.findUnique({ where: { token_unik: token } });
  if (!tamu) {
    return NextResponse.json({ error: "token tidak dikenal" }, { status: 404 });
  }
  const updated = await prisma.tamu.update({
    where: { id: tamu.id },
    data: {
      rsvp_status: status,
      jumlah_hadir: status === "hadir" ? jumlah_hadir : 0,
    },
  });
  return NextResponse.json(updated);
}
