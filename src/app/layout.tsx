import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snail Race - 달팽이 레이싱 추첨 게임",
  description: "달팽이 레이싱으로 추첨하는 재미있는 게임!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-clay-bg">
        {/* Sky gradient background */}
        <div className="fixed inset-0 bg-gradient-to-b from-clay-sky-top via-clay-sky-bottom to-clay-bg -z-10" />
        {/* Decorative clouds */}
        <div className="fixed top-8 left-[10%] w-24 h-10 bg-white/60 rounded-full blur-sm -z-10" />
        <div className="fixed top-16 right-[15%] w-32 h-12 bg-white/50 rounded-full blur-sm -z-10" />
        <div className="fixed top-6 left-[55%] w-20 h-8 bg-white/40 rounded-full blur-sm -z-10" />
        {children}
      </body>
    </html>
  );
}
