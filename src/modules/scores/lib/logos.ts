// Logo data for the header (partners) and footer (sponsors), served from public/logos.
export type Logo = { id: string; file: string; name: string; width: number; height: number; className: string };

// Phones (< 640px) stack the partners in two centered rows: Djarum Foundation + PBSI, then BWF +
// Badminton Asia (the `order` classes plus the full-width ::before break in the container).
// From 640px they sit in one row in source order. BWF is a vector SVG (served as is), the others
// are separate higher-resolution files; heights keep each visible mark the same size as the
// earlier padded crops.
export const partners: Logo[] = [
  { id: "bwf", file: "bwf.svg", name: "BWF", width: 180, height: 145, className: "order-4 h-[45px] sm:order-none sm:h-[31px] lg:h-[38px]" },
  { id: "badminton-asia", file: "badminton-asia.png", name: "Badminton Asia", width: 169, height: 70, className: "order-5 h-[37px] sm:order-none sm:h-[27px] lg:h-[31px]" },
  { id: "pbsi", file: "pbsi.png", name: "PBSI", width: 234, height: 256, className: "order-2 h-[52px] sm:order-none sm:h-9 lg:h-[42px]" },
  { id: "djarum-foundation", file: "djarum-foundation.png", name: "Bakti Olahraga Djarum Foundation", width: 467, height: 91, className: "order-1 h-10 sm:order-none sm:h-[23px] lg:h-7" },
];
// Sponsor logos are white and cropped tight to the mark. Heights are tuned per shape so every mark
// reads at about the same size: square-ish marks get more height, long wordmarks less. Phones
// (< 640px) show them about 4% larger (15% up, then 10% narrower) in two rows: the first six, then Polytron, SariWangi and Victor
// (`order-2` plus the full-width ::before break in the footer), which splits the width evenly.
const wordmarkHeight = "h-[21px] sm:h-[22px] lg:h-[26px]";
const squareHeight = "h-[30px] sm:h-[29px] lg:h-9";
export const sponsors: Logo[] = [
  { id: "5-days-croissant", file: "5-days-croissant.svg", name: "5 Days Croissant", width: 142, height: 149, className: squareHeight },
  { id: "blibli", file: "blibli.svg", name: "Blibli", width: 240, height: 84, className: wordmarkHeight },
  { id: "caffino", file: "caffino.svg", name: "Caffino", width: 344, height: 147, className: wordmarkHeight },
  { id: "foxs", file: "foxs.svg", name: "FOX'S", width: 242, height: 116, className: wordmarkHeight },
  { id: "gajah", file: "gajah.svg", name: "Gajah", width: 138, height: 147, className: squareHeight },
  { id: "hydro-plus", file: "hydro-plus.svg", name: "Hydroplus", width: 156, height: 112, className: "h-[26px] sm:h-[25px] lg:h-[31px]" },
  { id: "polytron", file: "polytron.svg", name: "Polytron", width: 295, height: 38, className: "order-2 h-3 sm:order-none sm:h-[13px] lg:h-3.5" },
  { id: "sariwangi", file: "sariwangi.png", name: "SariWangi", width: 373, height: 146, className: `order-2 sm:order-none ${wordmarkHeight}` },
  { id: "victor", file: "victor.svg", name: "Victor", width: 405, height: 57, className: "order-2 h-[12.5px] sm:order-none sm:h-3.5 lg:h-4" },
];
