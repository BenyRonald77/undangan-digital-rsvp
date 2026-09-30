"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "../Nav";
import { formatTanggal, formatWaktu, rsvpLabel } from "@/lib/format";

type Event = {
  id: number; nama: string; tanggal: string; jam: string; lokasi: string; slug: string;
};

type Tamu = {
  id: number; nama: string; no_wa: string; token_unik: string; kategori: string;
  rsvp_status: string; jumlah_hadir: number; checkin_at: string | null;
};

export default function KelolaEvent({ params }: { params: { id: string } }) {
  const eventId = params.id;
  const [event, setEvent] = useState<Event | null>(null);
  const [tamu, setTamu] = useState<Tamu[]>([]);
  const [form, setForm] = useState({ nama: "", no_wa: "", kategori: "" });
  const [pesan, setPesan] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  const muat = async () => {
    const [re, rt] = await Promise.all([
      fetch(`/api/events/${eventId}`),
      fetch(`/api/events/${eventId}/tamu`),
    ]);
    if (re.ok) setEvent(await re.json());
    if (rt.ok) setTamu(await rt.json());
  };

  useEffect(() => {
    muat();
    setBaseUrl(window.location.origin);
  }, []);

  const tambah = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesan("");
    const res = await fetch(`/api/events/${eventId}/tamu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setPesan(data.error ?? "Gagal menambah tamu");
      return;
    }
    setForm({ nama: "", no_wa: "", kategori: "" });
    muat();
  };

  const hapus = async (id: number) => {
    if (!confirm("Hapus tamu ini?")) return;
    const res = await fetch(`/api/tamu/${id}`, { method: "DELETE" });
    if (res.ok) muat();
  };

  const salin = async (teks: string) => {
    await navigator.clipboard.writeText(teks);
    setPesan("Link undangan disalin ke clipboard");
    setTimeout(() => setPesan(""), 2500);
  };

  if (!event) return <div><Nav /><p className="p-4">Memuat...</p></div>;

  const warna: Record<string, string> = {
    pending: "bg-slate-200 text-slate-700",
    hadir: "bg-emerald-100 text-emerald-800",
    tidak: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <Nav />
      <main className="max-w-6xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{event.nama}</h1>
            <p className="text-slate-600 text-sm">
              {formatTanggal(event.tanggal)} • {event.jam} • {event.lokasi}
            </p>
          </div>
          <Link
            href={`/dashboard/${event.id}`}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
          >
            Dashboard Realtime
          </Link>
        </div>

        <h2 className="text-lg font-semibold mb-2">Tambah Tamu</h2>
        <form onSubmit={tambah} className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Nama tamu"
              className="border rounded px-3 py-2"
            />
            <input
              value={form.no_wa}
              onChange={(e) => setForm({ ...form, no_wa: e.target.value })}
              placeholder="No. WhatsApp (628...)"
              className="border rounded px-3 py-2"
            />
            <input
              value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              placeholder="Kategori (mis. VIP)"
              className="border rounded px-3 py-2"
            />
          </div>
          <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Tambah Tamu
          </button>
          {pesan && <p className="text-sm mt-2 text-slate-700">{pesan}</p>}
        </form>

        <h2 className="text-lg font-semibold mb-2">
          Daftar Tamu ({tamu.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3">Nama</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">No. WA</th>
                <th className="p-3">RSVP</th>
                <th className="p-3">Check-in</th>
                <th className="p-3">QR</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tamu.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="p-3 font-medium">{t.nama}</td>
                  <td className="p-3">{t.kategori}</td>
                  <td className="p-3">{t.no_wa || "-"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${warna[t.rsvp_status] ?? warna.pending}`}>
                      {rsvpLabel[t.rsvp_status] ?? t.rsvp_status}
                    </span>
                    {t.rsvp_status === "hadir" && (
                      <span className="text-xs text-slate-500 ml-1">({t.jumlah_hadir} org)</span>
                    )}
                  </td>
                  <td className="p-3 text-xs">
                    {t.checkin_at ? formatWaktu(t.checkin_at) : "-"}
                  </td>
                  <td className="p-3">
                    <img
                      src={`/api/tamu/${t.id}/qr`}
                      alt={`QR ${t.nama}`}
                      width={64}
                      height={64}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => salin(`${baseUrl}/u/${t.token_unik}`)}
                        className="px-2 py-1 bg-slate-200 rounded hover:bg-slate-300 text-xs"
                      >
                        Salin Link
                      </button>
                      <button
                        onClick={() => hapus(t.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
