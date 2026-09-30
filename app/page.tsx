import Link from "next/link";
import Nav from "./Nav";
import { prisma } from "@/lib/prisma";
import { formatTanggal } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await prisma.event.findMany({ orderBy: { id: "asc" } });
  return (
    <div>
      <Nav />
      <main className="max-w-6xl mx-auto px-4 pb-10">
        <h1 className="text-2xl font-bold mb-1">Daftar Event</h1>
        <p className="text-slate-600 mb-6">
          Kelola acara, tamu undangan, RSVP, check-in, dan antrean WhatsApp.
        </p>
        {events.length === 0 ? (
          <p className="text-slate-500">Belum ada event. Tambahkan event baru.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <div key={e.id} className="bg-white rounded-lg shadow p-5">
                <h2 className="font-semibold text-lg">{e.nama}</h2>
                <p className="text-sm text-slate-600 mt-1">
                  {formatTanggal(e.tanggal)} • {e.jam}
                </p>
                <p className="text-sm text-slate-600">{e.lokasi}</p>
                <div className="mt-4 flex gap-2 text-sm">
                  <Link
                    href={`/event/${e.id}`}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Kelola
                  </Link>
                  <Link
                    href={`/dashboard/${e.id}`}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                  >
                    Dashboard
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
