import { Suspense } from "react";
import { BrandHeader, SponsorFooter } from "../components/branding";
import { ScoresSection } from "../sections/scores-section";
import { ScoresSkeleton } from "../components/scores-skeleton";

// In the fullscreen layout the page is zoomed to the screen (see FullscreenToggle); the minimum height
// is divided by the same factor so the footer still sits at the bottom of the screen.
export function ScoresView() {
  return <div className="flex min-h-dvh flex-col full:min-h-[calc(100dvh/var(--fs-zoom,1))] full:[zoom:var(--fs-zoom,1)]">
    <BrandHeader />
    <main id="main-content" className="flex-1"><Suspense fallback={<ScoresSkeleton />}><ScoresSection /></Suspense></main>
    <SponsorFooter />
  </div>;
}
