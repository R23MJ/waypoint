import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import HydrationGate from "@/components/HydrationGate";
import AppShell from "@/components/AppShell";
import PwaRegister from "@/components/PwaRegister";
import ThemeProvider from "@/components/ThemeProvider";
import ViewportFix from "@/components/ViewportFix";

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Waypoint",
  },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#17191c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased bg-bg text-text min-h-dvh">
        <script
          // Runs before hydration so the correct theme paints immediately —
          // no flash of the wrong theme on load.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
              var raw = localStorage.getItem("waypoint-theme");
              var mode = raw ? (JSON.parse(raw).state || {}).mode : "dark";
              var light = mode === "light" || (mode === "system" && window.matchMedia("(prefers-color-scheme: light)").matches);
              if (light) document.documentElement.setAttribute("data-theme", "light");
            }catch(e){}})();`,
          }}
        />
        <PwaRegister />
        <ThemeProvider />
        <ViewportFix />
        <HydrationGate>
          <AppShell>{children}</AppShell>
        </HydrationGate>
      </body>
    </html>
  );
}
