# Undangan Digital + RSVP

Undangan digital untuk acara (mis. pernikahan): link undangan personal per
tamu, konfirmasi kehadiran (RSVP), QR code untuk check-in di lokasi,
dashboard realtime statistik kehadiran, dan antrean pengiriman WhatsApp.

## Stack
Next.js 14 + TypeScript + Prisma 5.22 + SQLite + Tailwind CSS. UI berbahasa Indonesia.

## Cara Menjalankan
```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

## Halaman
| Route | Keterangan |
|---|---|
| `/` | Daftar event + tambah/ubah/hapus event |
| `/event/[id]` | Kelola event: daftar tamu, status RSVP, QR, salin link undangan |
| `/u/[token]` | Undangan publik personal + tombol RSVP |
| `/scan` | Check-in panitia (input token manual) |
| `/dashboard/[event_id]` | Dashboard realtime (polling 5 detik) |
| `/wa-queue` | Antrean WhatsApp: buat & proses antrean |

## Endpoint API
| Method | Path | Keterangan |
|---|---|---|
| GET/POST | `/api/events` | List / buat event (slug duplikat → 409) |
| GET/PATCH/DELETE | `/api/events/[id]` | Detail / ubah / hapus event |
| GET/POST | `/api/events/[id]/tamu` | List / tambah tamu (token dibuat otomatis) |
| GET/PATCH/DELETE | `/api/tamu/[id]` | Detail / ubah / hapus tamu |
| GET | `/api/tamu/[id]/qr` | PNG QR code berisi token undangan |
| POST | `/api/rsvp` | `{ token, status: hadir\|tidak, jumlah_hadir? }` — hadir wajib jumlah > 0 (400), token asing (404) |
| POST | `/api/checkin` | `{ token }` — check-in ganda → 409 + info waktu check-in pertama |
| GET | `/api/event/[id]/stats` | Statistik realtime |
| GET | `/api/wa/queue?event_id=` | Daftar antrean per event |
| POST | `/api/wa/enqueue` | `{ event_id }` — idempoten, skip yang sudah sent/pending |
| POST | `/api/wa/process` | `{ limit }` — kirim N antrean pending tertua |

## WhatsApp: mengganti stub dengan provider sungguhan
Pengiriman WhatsApp terpusat di `lib/wa.ts` → fungsi `kirimWhatsApp(noWa, pesan)`.
Secara default `WA_PROVIDER=stub`: simulasi kirim (sukses selalu, kecuali
`no_wa` kosong → gagal). Untuk memakai provider sungguhan (Fonnte/Wablas/dll):

1. Tambahkan API key di `.env`, mis. `FONNTE_TOKEN=...`.
2. Ganti isi `kirimWhatsApp` di `lib/wa.ts` dengan `fetch` ke endpoint
   provider, contoh Fonnte:
   ```ts
   const res = await fetch("https://api.fonnte.com/send", {
     method: "POST",
     headers: { Authorization: process.env.FONNTE_TOKEN! },
     body: new URLSearchParams({ target: noWa, message: pesan }),
   });
   const data = await res.json();
   if (!res.ok || data.status !== true)
     return { ok: false, error: JSON.stringify(data).slice(0, 200) };
   return { ok: true };
   ```
3. Set `WA_PROVIDER=fonnte` di `.env` agar stub tidak dipakai diam-diam.

Semua bagian lain (enqueue, process, halaman antrean) tidak perlu diubah.

## Aturan Bisnis
- `jumlah_hadir` harus > 0 jika RSVP `hadir`.
- Check-in ganda ditolak (409 + waktu check-in pertama).
- Slug event unik; token undangan unik per tamu.
- Enqueue WA idempoten: tamu yang sudah `sent`/`pending` tidak dibuatkan entri baru.
