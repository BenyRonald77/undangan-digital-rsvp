import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  }
  const tamu = await prisma.tamu.findUnique({ where: { id } });
  if (!tamu) {
    return NextResponse.json({ error: "tamu tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json(tamu);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  }
  const ada = await prisma.tamu.findUnique({ where: { id } });
  if (!ada) {
    return NextResponse.json({ error: "tamu tidak ditemukan" }, { status: 404 });
  }
  const body = await req.json().catch(() => null);
  const data: Record<string, string | number> = {};
  if (body?.nama !== undefined) {
    const nama = String(body.nama).trim();
    if (!nama) return NextResponse.json({ error: "nama wajib diisi" }, { status: 400 });
    data.nama = nama;
  }
  if (body?.no_wa !== undefined) data.no_wa = String(body.no_wa).trim();
  if (body?.kategori !== undefined) {
    const kategori = String(body.kategori).trim();
    if (!kategori) return NextResponse.json({ error: "kategori wajib diisi" }, { status: 400 });
    data.kategori = kategori;
  }
  const updated = await prisma.tamu.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  }
  const ada = await prisma.tamu.findUnique({ where: { id } });
  if (!ada) {
    return NextResponse.json({ error: "tamu tidak ditemukan" }, { status: 404 });
  }
  await prisma.tamu.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
