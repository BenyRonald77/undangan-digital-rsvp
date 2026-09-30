import { PrismaClient } from "@prisma/client";
import { buatToken } from "../lib/token";

const prisma = new PrismaClient();

async function main() {
  const n = await prisma.event.count();
  if (n > 0) {
    console.log("seed dilewati (sudah ada data)");
    return;
  }

  const event = await prisma.event.create({
    data: {
      nama: "Pernikahan Budi & Sari",
      tanggal: "2026-12-20",
      jam: "10:00",
      lokasi: "Gedung Serbaguna Graha Cinta, Jl. Melati No. 12, Jakarta",
      deskripsi:
        "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.",
      slug: "budi-sari-2026",
    },
  });

  const tamuSeed = [
    { nama: "Bapak H. Ahmad Yani", no_wa: "6281234567890", kategori: "Keluarga" },
    { nama: "Ibu Hj. Fatimah", no_wa: "6281234567891", kategori: "Keluarga" },
    { nama: "Bapak Dirjen Santoso", no_wa: "6281234567892", kategori: "VIP" },
    { nama: "Ibu Rina Marlina", no_wa: "6281234567893", kategori: "VIP" },
    { nama: "Andi Pratama", no_wa: "6281234567894", kategori: "Teman" },
    { nama: "Dewi Lestari", no_wa: "6281234567895", kategori: "Teman" },
    { nama: "Pak RT 05", no_wa: "", kategori: "Tetangga" },
    { nama: "Bu Siti Rahma", no_wa: "6281234567896", kategori: "Tetangga" },
  ];

  const dibuat = [];
  for (const t of tamuSeed) {
    dibuat.push(
      await prisma.tamu.create({
        data: {
          event_id: event.id,
          nama: t.nama,
          no_wa: t.no_wa,
          kategori: t.kategori,
          token_unik: buatToken(16),
        },
      })
    );
  }

  // Beberapa entri antrean contoh: 1 sent, 1 failed, 1 pending
  await prisma.waQueue.create({
    data: { tamu_id: dibuat[0].id, status: "sent", attempts: 1, sent_at: new Date().toISOString() },
  });
  await prisma.waQueue.create({
    data: { tamu_id: dibuat[6].id, status: "failed", attempts: 2, last_error: "nomor WhatsApp kosong" },
  });
  await prisma.waQueue.create({
    data: { tamu_id: dibuat[4].id, status: "pending", attempts: 0 },
  });

  console.log(`seed selesai: 1 event, ${dibuat.length} tamu, 3 entri antrean`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
