"use client";

import { useState } from "react";
import Nav from "../Nav";
import { formatWaktu } from "@/lib/format";

type Hasil = {
  id: number;
  nama: string;
  kategori: string;
  rsvp_status: string;
  jumlah_hadir: number;
  checkin_at: string | null;
  event: { id: number; nama: string };
};

export default function Scan() {
  const [token, setToken] = useState("");
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const [pesan, setPesan] = useState("");
  const [sibuk, setSibuk] = useState(false);

  const cekin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSibuk(true);
    setPesan("");
    setHasil(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setPesan(
          `SUDAH CHECK-IN sebelumnya pada ${formatWaktu(data.checkin_at)} (${data.tamu?.nama ?? ""})`
        );
      } else if (!res.ok) {
        setPesan(data.error ?? "Gagal check-in");
      } else {
        setHasil(data);
        setToken("");
      }
    } catch {
      setPesan("Terjadi kesalahan jaringan");
    } finally {
      setSibuk(false);
    }
  };

  return (
    <div>
      <Nav />
      <main className="max-w-xl mx-auto px-4 pb-10">
        <h1 className="text-2xl font-bold mb-1">Check-in Tamu</h1>
        <p className="text-slate-600 text-sm mb-6">
          Untuk panitia di lokasi. Masukkan token undangan tamu (tertera di QR
          atau link undangannya), lalu tekan Check-in.
        </p>
        <form onSubmit={cekin} className="bg-white rounded-lg shadow p-5">
          <label className="text-sm font-medium">Token undangan</label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="mis. a1b2c3d4e5f60718"
            className="border rounded px-3 py-2 w-full mt-1 font-mono"
            autoFocus
          />
          <button
            disabled={sibuk || !token.trim()}
            className="mt-3 w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
          >
            {sibuk ? "Memproses..." : "Check-in"}
          </button>
        </form>
        {pesan && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mt-4 text-sm">
            {pesan}
          </div>
        )}
        {hasil && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-5 mt-4">
            <p className="text-emerald-700 font-bold text-lg">Check-in berhasil</p>
            <div className="mt-2 text-sm space-y-1">
              <p><span className="font-medium">Nama:</span> {hasil.nama}</p>
              <p><span className="font-medium">Kategori:</span> {hasil.kategori}</p>
              <p><span className="font-medium">Acara:</span> {hasil.event.nama}</p>
              <p><span className="font-medium">Waktu:</span> {formatWaktu(hasil.checkin_at)}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
