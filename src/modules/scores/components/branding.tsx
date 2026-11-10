import Image from "next/image";
import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

const partners = [
  { id: "bwf", name: "BWF", width: 86, height: 71 },
  { id: "badminton-asia", name: "Badminton Asia", width: 132, height: 63 },
  { id: "pbsi", name: "PBSI", width: 70, height: 76 },
  { id: "djarum-foundation", name: "Bakti Olahraga Djarum Foundation", width: 237, height: 64 },
];
const sponsors = [
  ["5-days-croissant", "5 Days Croissant", 134, 53], ["blibli", "Blibli", 120, 50],
  ["caffino", "Caffino", 90, 47], ["foxs", "FOX'S", 89, 40], ["gajah", "Gajah", 56, 55],
  ["hydro-plus", "Hydroplus", 80, 57], ["polytron", "Polytron", 134, 40],
  ["sariwangi", "SariWangi", 112, 54], ["victor", "Victor", 143, 40],
] as const;

export function BrandHeader() {
  return (
    <header className="brand-header">
      <div className="page-width brand-header-inner">
        <Link href="/" aria-label="Beranda live score" className="event-brand"><Image src={withBasePath("/logos/milklife-ijis-2026.png")} alt="MilkLife Indonesia Junior International Series 2026" width={183} height={144} priority /></Link>
        <div className="brand-event-title" aria-hidden="true"><span>MILKLIFE</span><strong>INDONESIA JUNIOR<br />INTERNATIONAL SERIES <em>2026</em></strong></div>
        <div className="partner-logos" aria-label="Organisasi pendukung">{partners.map((p) => <Image key={p.id} src={withBasePath(`/logos/${p.id}.png`)} alt={p.name} width={p.width} height={p.height} className={`partner-${p.id}`} />)}</div>
      </div>
    </header>
  );
}

export function SponsorFooter() {
  return <footer className="sponsor-footer"><div className="page-width"><div className="sponsor-label"><span />SUPPORTED BY<span /></div><div className="sponsor-logos">{sponsors.map(([id, name, width, height]) => <Image key={id} src={withBasePath(`/logos/${id}.png`)} alt={name} width={width} height={height} />)}</div><div className="footer-note"><span>MilkLife Indonesia Junior International Series 2026</span><span>Every point. Every court.</span></div></div></footer>;
}
