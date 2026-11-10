import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrandHeader, SponsorFooter } from "@/modules/scores/components/branding";
import { LiveScoresBoard } from "./live-scores-board";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <a className="skip-link" href="#main-content">Langsung ke skor</a>
    <div className="site-shell display-shell">
      <BrandHeader />
      <main id="main-content"><LiveScoresBoard /></main>
      <SponsorFooter />
    </div>
  </StrictMode>,
);
