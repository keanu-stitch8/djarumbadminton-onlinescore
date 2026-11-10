import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <main className="state-panel"><h1>Halaman tidak ditemukan</h1><p>Kembali untuk melihat skor pertandingan.</p><Button asChild><Link href="/">Lihat skor</Link></Button></main>;
}
