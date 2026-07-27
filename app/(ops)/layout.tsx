import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/app/globals.css"; // Reuse Tailwind layer but override background

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "SYSTEM OPERATIONS | RESTRICTED",
  description: "Developer Operations and Monitoring",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OpsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} ${mono.variable} dark ops-portal min-h-screen w-full bg-[#050505] text-[#F5F5F5] font-sans antialiased selection:bg-[#E50914] selection:text-white`}
    >
      {/* Abstract Cyberpunk Background Elements (Scanlines/Noise) */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-10 mix-blend-overlay">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#E50914]/5 mix-blend-multiply" />
      </div>

      {/* Content Layer */}
      <main className="relative z-10 min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
}
