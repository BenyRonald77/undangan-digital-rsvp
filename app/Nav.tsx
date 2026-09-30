import Link from "next/link";

export default function Nav() {
  return (
    <nav className="bg-white shadow mb-6">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-5 text-sm">
        <Link href="/" className="font-bold text-indigo-700 text-base">
          Undangan Digital
        </Link>
        <Link href="/" className="hover:text-indigo-700">Event</Link>
        <Link href="/scan" className="hover:text-indigo-700">Check-in</Link>
        <Link href="/wa-queue" className="hover:text-indigo-700">Antrean WA</Link>
      </div>
    </nav>
  );
}
