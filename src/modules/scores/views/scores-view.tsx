import { Suspense } from "react";
import { BrandHeader, SponsorFooter } from "../components/branding";
import { ScoresSection } from "../sections/scores-section";
import { ScoresSkeleton } from "../components/scores-skeleton";

export function ScoresView() {
  return <div className="flex min-h-dvh flex-col">
    <BrandHeader />
    <main id="main-content" className="flex-1"><Suspense fallback={<ScoresSkeleton />}><ScoresSection /></Suspense></main>
    <SponsorFooter />
  </div>;
}
