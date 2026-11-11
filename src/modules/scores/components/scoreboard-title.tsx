import { venueHeading } from "../lib/scoreboard";

// Page heading above the scoreboard; the feed path decides the venue-specific title and subtitle.
export function ScoreboardTitle({ feedPath }: { feedPath: string }) {
  const { title, subtitle } = venueHeading(feedPath);
  return <div className="mb-5 flex items-center justify-center gap-2.5 text-center lg:mb-[15px] full:mb-2"><div>
    <h1 className="mt-[5px] font-display text-[32px] leading-[1.15] font-bold tracking-[0.4px] lg:text-[38px] full:mt-0 full:text-[30px]">{title}</h1>
    {subtitle && <p className="mt-1 text-[14px] leading-[1.4] font-semibold text-[#6c758a] lg:text-[16px] full:mt-0.5 full:text-[14px]">{subtitle}</p>}
  </div></div>;
}
