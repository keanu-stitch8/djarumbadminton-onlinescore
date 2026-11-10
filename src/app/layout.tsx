import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Live Score · MilkLife Indonesia Junior International Series 2026",
  description: "Pantau skor badminton per lapangan, pemain, dan gim. MilkLife Indonesia Junior International Series 2026.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#172e78" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id" className={`${inter.variable} ${barlow.variable}`}><body suppressHydrationWarning><a className="skip-link" href="#main-content">Langsung ke skor</a><Providers>{children}</Providers></body></html>;
}
