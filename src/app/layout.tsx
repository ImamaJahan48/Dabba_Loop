import type { Metadata } from "next";
import "./globals.css";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: { default: `${brand.name} — Flexible home-style meals`, template: `%s | ${brand.name}` },
  description: "Flexible homemade meal credits for students, hostels and companies in Lahore. Schedule, skip, switch and collect from efficient delivery hubs.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
