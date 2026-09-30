"use client";

import { useEffect, useState } from "react";
import Nav from "../Nav";
import { formatWaktu } from "@/lib/format";

type Event = { id: number; nama: string };
type Entri = {
  id: number; nama: string; no_wa: string; kategori: string; status: string;
  attempts: number; last_error: string | null; sent_at: string | null;
};

const warnaStatus: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  sent: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-700",
};

export default function WaQueue() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState("");
  const [antrean, setAntrean] = useState<Entri[]>([]);
  const [limit, setLimit] = useState(10);
  const [pesan, setPesan] = useState("");
  const [sibuk, setSibuk] = useState(false);

  useEffect(() => {
    fetch("/api/events").then((r) => r.json()).then(setEvents);
  }, []);

  const muat = async (id: string) => {
    if (!id) return;
    const res = await fetch(`/api/wa/queue?event_id=${id}`);
    if (res.ok) setAntrean(await res.json());
  };

  useEffect(() => {
    muat(eventId);
  }, [eventId]);

  const enqueue = async () => {
    setSibuk(true);
    setPesan("");
    const res = await fetch("/api/wa/enqueue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: Number(eventId) }),
    });
    const data = await res.json();
    setPesan(
      res.ok
        ? `Antrean dibuat: ${data.dibuat} baru, ${data.dilewati} dilewati (sudah terkirim/antri)`
        : data.error ?? "Gagal membuat antrean"
    );
    setSibuk(false);
    muat(eventId);
  };

  const proses = async () => {
    setSibuk(true);
    setPesan("");
    const res = await fetch("/api/wa/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit }),
    });
    const data = await res.json();
    setPesan(
      res.ok
        ? `Diproses ${data.diproses}: ${data.terkirim} terkirim, ${data.gagal} gagal`
        : data.error ?? "Gagal memproses antrean"
    );
    setSibuk(false);
    muat(eventId);
  };

  const hitung = (s: string) => antrean.filter((a) => a.status === s).length;

  return (
    <div>
      <Nav />
      <main className="max-w-6xl mx-auto px-4 pb-10">
        <h1 className="text-2xl font-bold mb-1">Antrean WhatsApp</h1>
        <p className="text-slate-600 text-sm mb-6">
          Buat antrean undangan per event, lalu proses pengirimannya.
        </p>
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm font-medium">Event</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="border rounded px-3 py-2 ml-2"
            >
              <option value="">— pilih event —</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>{e.nama}</option>
              ))}
            </select>
          </div>
          <button
            onClick={enqueue}
            disabled={sibuk || !eventId}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            Buat Antrean
          </button>
          <div className="flex items-center gap-2">
            <label className="text-sm">Limit proses</label>
            <input
              type="number" min={1} max={100} value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border rounded px-2 py-1 w-20"
            />
          </div>
          <button
            onClick={proses}
            disabled={sibuk}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
          >
            Proses Antrean
          </button>
          {pesan && <p className="text-sm text-slate-700 w-full">{pesan}</p>}
        </div>

        {eventId && (
          <>
            <p className="text-sm text-slate-600 mb-2">
              Pending: {hitung("pending")} • Terkirim: {hitung("sent")} • Gagal: {hitung("failed")}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg shadow text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3">Tamu</th>
                    <th className="p-3">No. WA</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Percobaan</th>
                    <th className="p-3">Error</th>
                    <th className="p-3">Terkirim</th>
                  </tr>
                </thead>
                <tbody>
                  {antrean.map((a) => (
                    <tr key={a.id} className="border-b">
                      <td className="p-3 font-medium">{a.nama}</td>
                      <td className="p-3">{a.no_wa || "-"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${warnaStatus[a.status]}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3">{a.attempts}</td>
                      <td className="p-3 text-xs text-red-600">{a.last_error ?? "-"}</td>
                      <td className="p-3 text-xs">{formatWaktu(a.sent_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
