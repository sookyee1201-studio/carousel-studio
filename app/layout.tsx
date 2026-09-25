import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Noto_Sans_SC, Noto_Serif_SC, Fraunces } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["opsz"] });
const notoSerif = Noto_Serif_SC({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-serif-sc", preload: false });
const noto = Noto_Sans_SC({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sc", preload: false });

export const metadata: Metadata = {
  title: "Carousel Studio",
  description: "从一个想法到一套 Carousel：内容策略、Hook、结构与视觉设计",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${geist.variable} ${geistMono.variable} ${instrument.variable} ${noto.variable} ${notoSerif.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
