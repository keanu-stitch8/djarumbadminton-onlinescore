import Image from "next/image";
import Link from "next/link";
import { withBasePath } from "@/lib/base-path";
import { partners, sponsors } from "../lib/logos";

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
    <div className="flex flex-wrap items-center justify-center gap-x-[clamp(12px,calc((100vw_-_296px)/5),25px)] gap-y-2.5 py-[22px] before:order-1 before:h-0 before:basis-full before:content-[''] sm:gap-[31px] sm:pt-[23px] sm:pb-[27px] sm:before:hidden lg:gap-[37px] lg:p-0">{sponsors.map((s) => <Image key={s.id} src={withBasePath(`/logos/${s.file}`)} alt={s.name} width={s.width} height={s.height} className={`w-auto max-w-[94px] object-contain sm:max-w-[105px] lg:max-w-[118px] ${s.className}`} unoptimized={s.file.endsWith(".svg")} />)}</div>
    <div className="flex flex-wrap justify-between gap-[9px] border-t border-[#25314d] pt-[13px] text-[8px] leading-normal text-[#7886a3] sm:text-[9px] lg:hidden"><span>MilkLife Indonesia Junior International Series 2026</span><span>Every point. Every court.</span></div>
  </div></footer>;
}
