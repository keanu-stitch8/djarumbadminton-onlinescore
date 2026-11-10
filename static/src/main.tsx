import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SkipLink } from "@/components/skip-link";
import { BrandHeader, SponsorFooter } from "@/modules/scores/components/branding";
import { LiveScoresBoard } from "./live-scores-board";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SkipLink />
    <div className="flex min-h-dvh flex-col">
      <BrandHeader />
      <main id="main-content" className="flex-1"><LiveScoresBoard /></main>
      <SponsorFooter />
    </div>
  </StrictMode>,
);
