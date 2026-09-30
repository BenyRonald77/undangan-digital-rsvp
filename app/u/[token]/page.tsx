import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatTanggal } from "@/lib/format";
import RsvpForm from "./RsvpForm";

export const dynamic = "force-dynamic";

export default async function Undangan({ params }: { params: { token: string } }) {
  const tamu = await prisma.tamu.findUnique({
    where: { token_unik: params.token },
    include: { event: true },
  });
  if (!tamu) notFound();

  const e = tamu.event;
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-100 to-white">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-indigo-600">
            Undangan Digital
          </p>
          <h1 className="text-3xl font-bold mt-2">{e.nama}</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <p className="text-slate-600 text-sm">Kepada Yth.</p>
          <p className="text-xl font-semibold">{tamu.nama}</p>
          <div className="mt-4 space-y-2 text-slate-700">
            <p>
              <span className="font-medium">Tanggal:</span> {formatTanggal(e.tanggal)}
            </p>
            <p>
              <span className="font-medium">Pukul:</span> {e.jam} WIB
            </p>
            <p>
              <span className="font-medium">Lokasi:</span> {e.lokasi}
            </p>
            {e.deskripsi && <p className="text-sm mt-3">{e.deskripsi}</p>}
          </div>
        </div>
        <RsvpForm token={tamu.token_unik} statusAwal={tamu.rsvp_status} />
      </div>
    </main>
  );
}
