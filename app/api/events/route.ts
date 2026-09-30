import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidJam, isValidTanggal } from "@/lib/format";

export async function GET() {
  const rows = await prisma.event.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const nama = String(body?.nama ?? "").trim();
  const tanggal = String(body?.tanggal ?? "").trim();
  const jam = String(body?.jam ?? "").trim();
  const lokasi = String(body?.lokasi ?? "").trim();
  const slug = String(body?.slug ?? "").trim();
  const deskripsi =
    body?.deskripsi == null ? null : String(body.deskripsi).trim() || null;

  if (!nama || !tanggal || !jam || !lokasi || !slug) {
    return NextResponse.json(
      { error: "nama, tanggal, jam, lokasi, dan slug wajib diisi" },
      { status: 400 }
    );
  }
  if (!isValidTanggal(tanggal)) {
    return NextResponse.json(
      { error: "format tanggal harus YYYY-MM-DD" },
      { status: 400 }
    );
  }
  if (!isValidJam(jam)) {
    return NextResponse.json(
      { error: "format jam harus HH:MM" },
      { status: 400 }
    );
  }
  const duplikat = await prisma.event.findUnique({ where: { slug } });
  if (duplikat) {
    return NextResponse.json(
      { error: "slug sudah dipakai event lain" },
      { status: 409 }
    );
  }
  const created = await prisma.event.create({
    data: { nama, tanggal, jam, lokasi, slug, deskripsi },
  });
  return NextResponse.json(created, { status: 201 });
}
