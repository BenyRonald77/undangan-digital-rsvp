export const rupiah = (n: number) =>
  "Rp" + Math.round(n).toLocaleString("id-ID");

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

export const nowIso = () => new Date().toISOString();

export const formatTanggal = (tgl: string) => {
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const hari = [
    "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
  ];
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tgl);
  if (!m) return tgl;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const w = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
  return `${hari[w]}, ${d} ${bulan[mo - 1]} ${y}`;
};

export const formatWaktu = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const isValidTanggal = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

export const isValidJam = (v: unknown): v is string =>
  typeof v === "string" && /^\d{2}:\d{2}$/.test(v);

export const rsvpLabel: Record<string, string> = {
  pending: "Belum Konfirmasi",
  hadir: "Hadir",
  tidak: "Tidak Hadir",
};
