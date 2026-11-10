import { Suspense } from "react";
import { BrandHeader, SponsorFooter } from "../components/branding";
import { ScoresSection } from "../sections/scores-section";
import { ScoresSkeleton } from "../components/scores-skeleton";

export function ScoresView() {
  return <div className="site-shell display-shell">
    <BrandHeader />
    <main id="main-content"><Suspense fallback={<ScoresSkeleton />}><ScoresSection /></Suspense></main>
    <SponsorFooter />
  </div>;
}
