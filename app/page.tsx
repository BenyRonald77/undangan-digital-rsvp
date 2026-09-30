"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "./Nav";
import { formatTanggal } from "@/lib/format";

type Event = {
  id: number;
  nama: string;
  tanggal: string;
  jam: string;
  lokasi: string;
  deskripsi: string | null;
  slug: string;
};

const awal = { nama: "", tanggal: "", jam: "", lokasi: "", slug: "", deskripsi: "" };

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState(awal);
  const [editId, setEditId] = useState<number | null>(null);
  const [pesan, setPesan] = useState("");

  const muat = async () => {
    const res = await fetch("/api/events");
    setEvents(await res.json());
  };
  useEffect(() => {
    muat();
  }, []);

  const isi = (k: keyof typeof awal) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: e.target.value }),
  });

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesan("");
    const url = editId ? `/api/events/${editId}` : "/api/events";
    const res = await fetch(url, {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setPesan(data.error ?? "Gagal menyimpan event");
      return;
    }
    setForm(awal);
    setEditId(null);
    muat();
  };

  const hapus = async (id: number) => {
    if (!confirm("Hapus event ini beserta semua tamu & antreannya?")) return;
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) muat();
    else setPesan("Gagal menghapus event");
  };

  const mulaiEdit = (ev: Event) => {
    setEditId(ev.id);
    setForm({
      nama: ev.nama,
      tanggal: ev.tanggal,
      jam: ev.jam,
      lokasi: ev.lokasi,
      slug: ev.slug,
      deskripsi: ev.deskripsi ?? "",
    });
    window.scrollTo({ top: 0 });
  };

  return (
    <div>
      <Nav />
      <main className="max-w-6xl mx-auto px-4 pb-10">
        <h1 className="text-2xl font-bold mb-6">
          {editId ? "Ubah Event" : "Event Baru"}
        </h1>
        <form onSubmit={simpan} className="bg-white rounded-lg shadow p-5 mb-8">
          <div className="grid gap-3 md:grid-cols-2">
            <input {...isi("nama")} placeholder="Nama acara" className="border rounded px-3 py-2" />
            <input {...isi("slug")} placeholder="slug-unik" className="border rounded px-3 py-2" />
            <input {...isi("tanggal")} type="date" className="border rounded px-3 py-2" />
            <input {...isi("jam")} type="time" className="border rounded px-3 py-2" />
            <input {...isi("lokasi")} placeholder="Lokasi acara" className="border rounded px-3 py-2 md:col-span-2" />
            <textarea {...isi("deskripsi")} placeholder="Deskripsi (opsional)" className="border rounded px-3 py-2 md:col-span-2" rows={2} />
          </div>
          <div className="flex gap-2 mt-3">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              {editId ? "Simpan Perubahan" : "Tambah Event"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(null); setForm(awal); }}
                className="px-4 py-2 bg-slate-300 rounded"
              >
                Batal
              </button>
            )}
          </div>
          {pesan && <p className="text-red-600 text-sm mt-2">{pesan}</p>}
        </form>

        <h2 className="text-xl font-bold mb-3">Daftar Event</h2>
        {events.length === 0 ? (
          <p className="text-slate-500">Belum ada event.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <div key={e.id} className="bg-white rounded-lg shadow p-5">
                <h3 className="font-semibold text-lg">{e.nama}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {formatTanggal(e.tanggal)} • {e.jam}
                </p>
                <p className="text-sm text-slate-600">{e.lokasi}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <Link href={`/event/${e.id}`} className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                    Kelola
                  </Link>
                  <Link href={`/dashboard/${e.id}`} className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                    Dashboard
                  </Link>
                  <button onClick={() => mulaiEdit(e)} className="px-3 py-1.5 bg-amber-500 text-white rounded hover:bg-amber-600">
                    Ubah
                  </button>
                  <button onClick={() => hapus(e.id)} className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600">
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
