"use client";

import { useState } from "react";
import { rsvpLabel } from "@/lib/format";

export default function RsvpForm({
  token,
  statusAwal,
}: {
  token: string;
  statusAwal: string;
}) {
  const [status, setStatus] = useState<string | null>(statusAwal !== "pending" ? statusAwal : null);
  const [jumlah, setJumlah] = useState(1);
  const [pesan, setPesan] = useState("");
  const [sibuk, setSibuk] = useState(false);

  const kirim = async (pilihan: "hadir" | "tidak") => {
    setSibuk(true);
    setPesan("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          status: pilihan,
          jumlah_hadir: pilihan === "hadir" ? jumlah : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPesan(data.error ?? "Gagal mengirim konfirmasi");
      } else {
        setStatus(pilihan);
        setPesan(
          pilihan === "hadir"
            ? `Terima kasih! Kehadiran ${data.jumlah_hadir} orang tercatat. Sampai jumpa di acara.`
            : "Terima kasih atas konfirmasinya. Doa restu Anda tetap berarti bagi kami."
        );
      }
    } catch {
      setPesan("Terjadi kesalahan jaringan");
    } finally {
      setSibuk(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="font-semibold text-lg mb-1">Konfirmasi Kehadiran (RSVP)</h2>
      {status ? (
        <p className="mt-2 text-emerald-700 font-medium">
          Status Anda: {rsvpLabel[status] ?? status}
        </p>
      ) : (
        <p className="text-sm text-slate-600 mt-1">
          Mohon konfirmasi apakah Anda berkenan hadir.
        </p>
      )}
      <div className="flex items-center gap-3 mt-4">
        <label className="text-sm">Jumlah yang hadir</label>
        <input
          type="number"
          min={1}
          value={jumlah}
          onChange={(e) => setJumlah(Number(e.target.value))}
          className="border rounded px-2 py-1 w-20"
        />
      </div>
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => kirim("hadir")}
          disabled={sibuk}
          className="px-5 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          Saya Hadir
        </button>
        <button
          onClick={() => kirim("tidak")}
          disabled={sibuk}
          className="px-5 py-2 bg-slate-500 text-white rounded hover:bg-slate-600 disabled:opacity-50"
        >
          Berhalangan
        </button>
      </div>
      {pesan && <p className="mt-3 text-sm text-slate-700">{pesan}</p>}
    </div>
  );
}
