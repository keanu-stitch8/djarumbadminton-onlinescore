import { venueHeading } from "../lib/scoreboard";

// Page heading above the scoreboard; the feed path decides the venue-specific title and subtitle.
export function ScoreboardTitle({ feedPath }: { feedPath: string }) {
  const { title, subtitle } = venueHeading(feedPath);
  return <div className="display-title-row"><div><h1>{title}</h1>{subtitle && <p className="display-subtitle">{subtitle}</p>}</div></div>;
}
