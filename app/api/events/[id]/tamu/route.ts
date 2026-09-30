import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buatToken } from "@/lib/token";

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
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
  return NextResponse.json(tamu);
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  }
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return NextResponse.json({ error: "event tidak ditemukan" }, { status: 404 });
  }
  const body = await req.json().catch(() => null);
  const nama = String(body?.nama ?? "").trim();
  if (!nama) {
    return NextResponse.json({ error: "nama tamu wajib diisi" }, { status: 400 });
  }
  const no_wa = String(body?.no_wa ?? "").trim();
  const kategori = String(body?.kategori ?? "").trim() || "Umum";

  let token_unik = buatToken(16);
  while (await prisma.tamu.findUnique({ where: { token_unik } })) {
    token_unik = buatToken(16);
  }

  const created = await prisma.tamu.create({
    data: { event_id: id, nama, no_wa, kategori, token_unik },
  });
  return NextResponse.json(created, { status: 201 });
}
