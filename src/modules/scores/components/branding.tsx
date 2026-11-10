import Image from "next/image";
import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

// Phones (< 640px) stack the partners in two centered rows: Djarum Foundation + PBSI, then BWF +
// Badminton Asia (the `order` classes plus the full-width ::before break in the container).
// From 640px they sit in one row in source order. BWF is a vector SVG (served as is), the others
// are separate higher-resolution files; heights keep each visible mark the same size as the
// earlier padded crops.
const partners = [
  { id: "bwf", file: "bwf.svg", name: "BWF", width: 180, height: 145, className: "order-4 h-[45px] sm:order-none sm:h-[31px] lg:h-[38px]" },
  { id: "badminton-asia", file: "badminton-asia.png", name: "Badminton Asia", width: 169, height: 70, className: "order-5 h-[37px] sm:order-none sm:h-[27px] lg:h-[31px]" },
  { id: "pbsi", file: "pbsi.png", name: "PBSI", width: 234, height: 256, className: "order-2 h-[52px] sm:order-none sm:h-9 lg:h-[42px]" },
  { id: "djarum-foundation", file: "djarum-foundation.png", name: "Bakti Olahraga Djarum Foundation", width: 467, height: 91, className: "order-1 h-10 sm:order-none sm:h-[23px] lg:h-7" },
];
const sponsors = [
  ["5-days-croissant", "5 Days Croissant", 134, 53], ["blibli", "Blibli", 120, 50],
  ["caffino", "Caffino", 90, 47], ["foxs", "FOX'S", 89, 40], ["gajah", "Gajah", 56, 55],
  ["hydro-plus", "Hydroplus", 80, 57], ["polytron", "Polytron", 134, 40],
  ["sariwangi", "SariWangi", 112, 54], ["victor", "Victor", 143, 40],
] as const;
// Square-ish marks that read too small at the shared logo height.
const tallSponsors = new Set(["gajah", "hydro-plus"]);

export function BrandHeader() {
  return (
    <header className="border-b border-[#eef0f5] bg-white">
      <div className="page-width flex flex-col items-center justify-center gap-3 py-3.5 sm:min-h-[125px] sm:flex-row sm:justify-between sm:gap-4 sm:py-3 lg:min-h-[120px] lg:justify-start lg:gap-[22px] lg:py-[17px]">
        <Link href="/" aria-label="Beranda live score" className="block flex-none"><Image src={withBasePath("/logos/milklife-ijis-2026.png")} alt="MilkLife Indonesia Junior International Series 2026" width={183} height={144} className="h-auto w-30 sm:w-[114px] lg:w-[116px]" priority /></Link>
        <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-2.5 before:order-3 before:h-0 before:basis-full before:content-[''] sm:flex-nowrap sm:justify-end sm:gap-6 sm:before:hidden lg:ml-auto lg:gap-[27px]" aria-label="Organisasi pendukung">{partners.map((p) => <Image key={p.id} src={withBasePath(`/logos/${p.file}`)} alt={p.name} width={p.width} height={p.height} className={`w-auto object-contain ${p.className}`} unoptimized={p.file.endsWith(".svg")} />)}</div>
      </div>
    </header>
  );
}

export function SponsorFooter() {
  return <footer className="bg-[#111d3d] pt-6 pb-[15px] text-white lg:py-[17px]"><div className="page-width">
    <div className="flex items-center justify-center gap-3.5 text-[8px] font-[650] tracking-[2px] text-[#71809f] lg:hidden"><span className="block h-px w-[38px] bg-[#2a3652]" />SUPPORTED BY<span className="block h-px w-[38px] bg-[#2a3652]" /></div>
    <div className="flex flex-wrap items-center justify-center gap-x-[21px] gap-y-5 py-[22px] sm:gap-[27px] sm:pt-[23px] sm:pb-[27px] lg:gap-[33px] lg:p-0">{sponsors.map(([id, name, width, height]) => <Image key={id} src={withBasePath(`/logos/${id}.png`)} alt={name} width={width} height={height} className={`w-auto max-w-[90px] object-contain sm:max-w-[105px] lg:max-w-[118px] ${tallSponsors.has(id) ? "h-8 lg:h-[39px]" : "h-[26px] sm:h-[29px] lg:h-[34px]"}`} />)}</div>
    <div className="flex flex-wrap justify-between gap-[9px] border-t border-[#25314d] pt-[13px] text-[8px] leading-normal text-[#7886a3] sm:text-[9px] lg:hidden"><span>MilkLife Indonesia Junior International Series 2026</span><span>Every point. Every court.</span></div>
  </div></footer>;
}
