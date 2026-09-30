import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidJam, isValidTanggal } from "@/lib/format";

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
  return NextResponse.json(event);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  const ada = await prisma.event.findUnique({ where: { id } });
  if (!ada) {
    return NextResponse.json({ error: "event tidak ditemukan" }, { status: 404 });
  }
  const data: Record<string, string | null> = {};
  if (body?.nama !== undefined) {
    const nama = String(body.nama).trim();
    if (!nama) return NextResponse.json({ error: "nama wajib diisi" }, { status: 400 });
    data.nama = nama;
  }
  if (body?.tanggal !== undefined) {
    if (!isValidTanggal(body.tanggal)) {
      return NextResponse.json({ error: "format tanggal harus YYYY-MM-DD" }, { status: 400 });
    }
    data.tanggal = String(body.tanggal).trim();
  }
  if (body?.jam !== undefined) {
    if (!isValidJam(body.jam)) {
      return NextResponse.json({ error: "format jam harus HH:MM" }, { status: 400 });
    }
    data.jam = String(body.jam).trim();
  }
  if (body?.lokasi !== undefined) {
    const lokasi = String(body.lokasi).trim();
    if (!lokasi) return NextResponse.json({ error: "lokasi wajib diisi" }, { status: 400 });
    data.lokasi = lokasi;
  }
  if (body?.slug !== undefined) {
    const slug = String(body.slug).trim();
    if (!slug) return NextResponse.json({ error: "slug wajib diisi" }, { status: 400 });
    const duplikat = await prisma.event.findUnique({ where: { slug } });
    if (duplikat && duplikat.id !== id) {
      return NextResponse.json({ error: "slug sudah dipakai event lain" }, { status: 409 });
    }
    data.slug = slug;
  }
  if (body?.deskripsi !== undefined) {
    data.deskripsi = body.deskripsi == null ? null : String(body.deskripsi).trim() || null;
  }
  const updated = await prisma.event.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  }
  const ada = await prisma.event.findUnique({ where: { id } });
  if (!ada) {
    return NextResponse.json({ error: "event tidak ditemukan" }, { status: 404 });
  }
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
