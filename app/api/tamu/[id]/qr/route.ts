import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buatQrPng } from "@/lib/qr";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  }
  const tamu = await prisma.tamu.findUnique({ where: { id } });
  if (!tamu) {
    return NextResponse.json({ error: "tamu tidak ditemukan" }, { status: 404 });
  }
  const png = await buatQrPng(tamu.token_unik);
  const bytes = Uint8Array.from(png); // ArrayBuffer-backed, valid BodyInit
  return new Response(bytes, {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
  });
}
