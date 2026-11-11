"use client";

import { useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Shown from 1536px (2xl) only. Turning it on sets data-fullscreen on <html>, which switches on the
// `full:` variant (full-width header, board and footer, two court columns) and asks the browser for
// real fullscreen. Leaving browser fullscreen (Esc) turns the layout off again.
//
// The fullscreen layout is designed for a 1920 × 1080 screen (12 courts on one page). --fs-zoom scales
// it to the actual screen, so a 1536 × 864 laptop, a 1080p TV and a 4K TV all show the same page.
const designWidth = 1920;
const designHeight = 1080;
export function FullscreenToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.toggleAttribute("data-fullscreen", on);
    if (!on) return;
    const fit = () => root.style.setProperty("--fs-zoom", String(Math.min(window.innerWidth / designWidth, window.innerHeight / designHeight)));
    fit();
    window.addEventListener("resize", fit);
    return () => { window.removeEventListener("resize", fit); root.removeAttribute("data-fullscreen"); root.style.removeProperty("--fs-zoom"); };
  }, [on]);

  useEffect(() => {
    const onChange = () => { if (!document.fullscreenElement) setOn(false); };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = () => {
    if (on) {
      setOn(false);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    } else {
      setOn(true);
      // The layout still applies if the browser refuses fullscreen.
      void document.documentElement.requestFullscreen?.().catch(() => {});
    }
  };

  const label = on ? "Keluar dari layar penuh" : "Tampilkan layar penuh";
  return <Button variant="ghost" size="icon" className="hidden size-[30px] border border-[#e0e5ed] bg-white text-[#758098] hover:bg-white hover:text-[#758098] 2xl:inline-flex [&_svg]:size-3" onClick={toggle} aria-label={label} aria-pressed={on} title={label}>{on ? <Minimize2 /> : <Maximize2 />}</Button>;
}
