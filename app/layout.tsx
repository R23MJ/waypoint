import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import HydrationGate from "@/components/HydrationGate";
import AppShell from "@/components/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Waypoint — Next Actions",
  description: "A GTD-style project and next-action tracker.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased bg-bg text-text min-h-dvh">
        <HydrationGate>
          <AppShell>{children}</AppShell>
        </HydrationGate>
      </body>
    </html>
  );
}
