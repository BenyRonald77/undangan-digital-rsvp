// Pengirim WhatsApp. Stub default mensimulasikan pengiriman tanpa
// memanggil provider sungguhan. Untuk integrasi Fonnte/Wablas/dll,
// cukup ganti isi kirimWhatsApp di bawah (lihat README).
export type WaHasil = { ok: boolean; error?: string };

export async function kirimWhatsApp(
  noWa: string,
  pesan: string
): Promise<WaHasil> {
  const provider = process.env.WA_PROVIDER ?? "stub";
  void pesan;
  if (provider !== "stub") {
    // Hook integrasi: jika WA_PROVIDER diset ke nama provider sungguhan
    // namun implementasinya belum diganti, anggap gagal agar antrean
    // tercatat failed, bukan sent palsu.
    return { ok: false, error: `provider '${provider}' belum diimplementasikan di lib/wa.ts` };
  }
  // Stub: simulasi latensi kecil agar antrean terlihat diproses.
  await new Promise((r) => setTimeout(r, 50));
  if (!noWa || noWa.trim() === "") {
    return { ok: false, error: "nomor WhatsApp kosong" };
  }
  return { ok: true };
}

export const pesanUndangan = (namaTamu: string, namaEvent: string, link: string) =>
  `Assalamu'alaikum ${namaTamu},\n\nAnda diundang ke acara: ${namaEvent}.\nBuka undangan personal Anda: ${link}\n\nMohon konfirmasi kehadiran (RSVP) melalui link di atas.\nTerima kasih.`;
