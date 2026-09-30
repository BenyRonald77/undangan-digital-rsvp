# PRD — Undangan Digital + RSVP

## Ringkasan
Aplikasi undangan digital untuk acara (mis. pernikahan) dengan link undangan
personal per tamu, konfirmasi kehadiran (RSVP), QR code untuk check-in di
lokasi, dashboard realtime statistik kehadiran, dan antrean pengiriman
WhatsApp undangan.

## Stack
Next.js 14 + TypeScript + Prisma 5.22 + SQLite + Tailwind CSS. UI berbahasa
Indonesia.

## Model Data

### Event
| Field | Tipe | Keterangan |
|---|---|---|
| id | Int, PK autoincrement | |
| nama | String | Nama acara, mis. "Pernikahan Budi & Sari" |
| tanggal | String (TEXT) | Format `YYYY-MM-DD` |
| jam | String | Format `HH:MM` |
| lokasi | String | Alamat/gedung acara |
| deskripsi | String? | Keterangan tambahan |
| slug | String @unique | Slug publik event |

### Tamu
| Field | Tipe | Keterangan |
|---|---|---|
| id | Int, PK autoincrement | |
| event_id | Int, FK → Event | |
| nama | String | Nama tamu |
| no_wa | String | Nomor WhatsApp (mis. `62812...`); boleh kosong |
| token_unik | String @unique | Token link undangan personal |
| kategori | String | mis. `Keluarga`, `VIP`, `Teman` (default `Umum`) |
| rsvp_status | String | `pending` / `hadir` / `tidak` (default `pending`) |
| jumlah_hadir | Int | Jumlah orang yang hadir (default 0) |
| checkin_at | String? | Timestamp ISO check-in di lokasi (nullable) |

### WaQueue
| Field | Tipe | Keterangan |
|---|---|---|
| id | Int, PK autoincrement | |
| tamu_id | Int, FK → Tamu | |
| status | String | `pending` / `sent` / `failed` (default `pending`) |
| attempts | Int | Jumlah percobaan kirim (default 0) |
| last_error | String? | Pesan error terakhir |
| sent_at | String? | Timestamp ISO pengiriman berhasil |

## Fungsionalitas

### F0 — Setup: schema Prisma, seed, layout, dashboard
- Schema Prisma (3 model di atas), seed 1 event pernikahan + 8 tamu +
  beberapa entri WaQueue.
- Layout global + halaman utama (`/`) berisi daftar event (dashboard).

### F1 — Event CRUD + halaman undangan publik
- API: `GET /api/events`, `POST /api/events`, `GET/PATCH/DELETE /api/events/[id]`.
- Halaman publik `/u/[token]` menampilkan undangan personal: nama tamu,
  detail acara (nama, tanggal, jam, lokasi, deskripsi), tombol RSVP.
- Validasi: nama, tanggal (`YYYY-MM-DD`), jam (`HH:MM`), lokasi, slug
  wajib; slug unik (duplikat → 409).

### F2 — Tamu + RSVP
- API CRUD tamu per event: `GET /api/events/[id]/tamu`, `POST`,
  `PATCH/DELETE /api/tamu/[id]`.
- Setiap tamu punya `token_unik` (dibuat otomatis saat tambah tamu) dan link
  personal `/u/[token_unik]`.
- `POST /api/rsvp` body `{ token, status: "hadir" | "tidak", jumlah_hadir? }`:
  - token tidak dikenal → 404
  - status tidak valid → 400
  - `hadir` dengan `jumlah_hadir <= 0` → 400 (validasi: jumlah_hadir > 0
    jika hadir)
  - `tidak` → `jumlah_hadir` diset 0, `rsvp_status = "tidak"`
  - sukses → 200, update `rsvp_status` + `jumlah_hadir`
- Halaman admin `/event/[id]` menampilkan daftar tamu + status RSVP,
  tambah/hapus tamu, dan link undangan personal per tamu.

### F3 — QR check-in
- `GET /api/tamu/[id]/qr` → PNG QR code berisi token undangan
  (`lib/qrcode` via npm `qrcode`, tanpa canvas/browser).
- Halaman `/scan` (untuk panitia di lokasi): input token manual → `POST
  /api/checkin { token }`:
  - token tidak dikenal → 404
  - tamu sudah check-in → 409 beserta waktu check-in pertama
  - sukses → 200, set `checkin_at` (timestamp ISO), kembalikan data tamu.
- Halaman tamu `/event/[id]` menampilkan QR per tamu.

### F4 — Dashboard realtime
- `GET /api/event/[id]/stats` → `{ total, rsvp: { hadir, tidak, pending },
  checkin, total_pax_hadir, recent_checkins }`.
- Halaman `/dashboard/[event_id]` polling statistik tiap 5 detik,
  menampilkan total tamu, RSVP hadir/tidak/pending, sudah check-in, dan
  daftar tamu yang baru check-in.

### F5 — Antrean WhatsApp
- `POST /api/wa/enqueue { event_id }`: buat entri WaQueue `pending` untuk
  semua tamu event yang belum punya entri `sent` — idempoten (skip tamu
  yang sudah pernah terkirim). Kembalikan jumlah entri baru.
- `POST /api/wa/process { limit }`: ambil hingga `limit` entri pending
  (tertua dulu), kirim lewat `lib/wa.ts` (`kirimWhatsApp`), update
  `status` = `sent` / `failed`, `attempts` +1, `last_error`, `sent_at`.
- `lib/wa.ts`: provider stub — mensimulasikan kirim; GAGAL jika `no_wa`
  kosong. Configurable via env `WA_PROVIDER` (`stub` default). Cara
  mengganti dengan provider sungguhan (Fonnte/Wablas) didokumentasikan di
  README — cukup ganti `lib/wa.ts`.
- Halaman `/wa-queue`: tabel antrean per event + tombol "Proses antrean"
  + tombol "Buat antrean" + status per tamu.
- `GET /api/wa/queue?event_id=...` → daftar entri + data tamu.

## Aturan Bisnis Penting
1. `jumlah_hadir` harus > 0 jika RSVP `hadir` (400 jika dilanggar).
2. Check-in ganda ditolak (409 + info waktu check-in pertama).
3. Slug event unik (409 jika duplikat).
4. `token_unik` tamu unik; dibuat otomatis.
5. Enqueue WA idempoten: tamu dengan entri `sent` tidak di-enqueue lagi.

## Halaman
| Route | Keterangan |
|---|---|
| `/` | Daftar event (dashboard utama) |
| `/event/[id]` | Kelola event: tamu + RSVP + QR |
| `/u/[token]` | Undangan publik personal + tombol RSVP |
| `/scan` | Check-in panitia (input token manual) |
| `/dashboard/[event_id]` | Dashboard realtime (polling 5 detik) |
| `/wa-queue` | Antrean WhatsApp |

## Endpoint API
| Method | Path | Keterangan |
|---|---|---|
| GET/POST | `/api/events` | List / buat event |
| GET/PATCH/DELETE | `/api/events/[id]` | Detail / ubah / hapus event |
| GET/POST | `/api/events/[id]/tamu` | List / tambah tamu |
| GET/PATCH/DELETE | `/api/tamu/[id]` | Detail / ubah / hapus tamu |
| GET | `/api/tamu/[id]/qr` | PNG QR code token |
| POST | `/api/rsvp` | Konfirmasi kehadiran |
| POST | `/api/checkin` | Check-in di lokasi |
| GET | `/api/event/[id]/stats` | Statistik realtime |
| GET | `/api/wa/queue` | Daftar antrean (query event_id) |
| POST | `/api/wa/enqueue` | Buat antrean undangan WA |
| POST | `/api/wa/process` | Proses N antrean teratas |

## Kode Status Error
- 400: validasi gagal (field wajib, format tanggal/jam, RSVP invalid)
- 404: event/tamu/token tidak ditemukan
- 409: slug duplikat, check-in ganda
