"use client";

import { useEffect, useState } from "react";
import Nav from "../../Nav";
import { formatWaktu } from "@/lib/format";

type Stats = {
  event: { id: number; nama: string };
  total: number;
  rsvp: { hadir: number; tidak: number; pending: number };
  checkin: number;
  total_pax_hadir: number;
  recent_checkins: { id: number; nama: string; kategori: string; checkin_at: string | null }[];
};

export default function Dashboard({ params }: { params: { event_id: string } }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let aktif = true;
    const muat = async () => {
      try {
        const res = await fetch(`/api/event/${params.event_id}/stats`);
        const data = await res.json();
        if (!res.ok) {
          if (aktif) setError(data.error ?? "Gagal memuat statistik");
          return;
        }
        if (aktif) {
          setStats(data);
          setError("");
        }
      } catch {
        if (aktif) setError("Kesalahan jaringan");
      }
    };
    muat();
    const timer = setInterval(muat, 5000);
    return () => {
      aktif = false;
      clearInterval(timer);
    };
  }, [params.event_id]);

  if (error && !stats)
    return (
      <div>
        <Nav />
        <p className="p-4 text-red-600">{error}</p>
      </div>
    );
  if (!stats)
    return (
      <div>
        <Nav />
        <p className="p-4">Memuat statistik...</p>
      </div>
    );

  const kartu = [
    { label: "Total Tamu", nilai: stats.total, warna: "bg-slate-600" },
    { label: "RSVP Hadir", nilai: stats.rsvp.hadir, warna: "bg-emerald-600" },
    { label: "RSVP Tidak Hadir", nilai: stats.rsvp.tidak, warna: "bg-red-500" },
    { label: "Belum Konfirmasi", nilai: stats.rsvp.pending, warna: "bg-amber-500" },
    { label: "Sudah Check-in", nilai: stats.checkin, warna: "bg-indigo-600" },
    { label: "Total Pax Hadir", nilai: stats.total_pax_hadir, warna: "bg-teal-600" },
  ];

  return (
    <div>
      <Nav />
      <main className="max-w-6xl mx-auto px-4 pb-10">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold">Dashboard: {stats.event.nama}</h1>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            realtime (5 detik)
          </span>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {kartu.map((k) => (
            <div key={k.label} className={`${k.warna} text-white rounded-lg shadow p-4`}>
              <p className="text-3xl font-bold">{k.nilai}</p>
              <p className="text-sm opacity-90">{k.label}</p>
            </div>
          ))}
        </div>
        <h2 className="text-lg font-semibold mt-8 mb-2">Baru Check-in</h2>
        {stats.recent_checkins.length === 0 ? (
          <p className="text-slate-500 text-sm">Belum ada tamu yang check-in.</p>
        ) : (
          <div className="bg-white rounded-lg shadow divide-y">
            {stats.recent_checkins.map((t) => (
              <div key={t.id} className="p-3 flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium">{t.nama}</span>
                  <span className="text-slate-500 ml-2">{t.kategori}</span>
                </div>
                <span className="text-slate-600">{formatWaktu(t.checkin_at)}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
