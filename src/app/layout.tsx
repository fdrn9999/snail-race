import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  title: "Snail Race - 달팽이 레이싱 추첨 게임 | 무료 온라인 추첨",
  description:
    "참가자 이름을 입력하고 달팽이 레이싱으로 재미있게 추첨하세요! 워크숍, 파티, 팀빌딩, 수업에서 발표 순서 정하기, 당첨자 뽑기에 딱 맞는 무료 온라인 추첨 게임. 최대 15명까지 지원, 설치 없이 브라우저에서 바로 사용 가능합니다.",
  keywords:
    "달팽이 레이싱, 추첨 게임, 무료 추첨, 팀빌딩 게임, 파티 게임, 온라인 추첨, 발표 순서 정하기, 랜덤 추첨기",
  openGraph: {
    title: "Snail Race - 달팽이 레이싱 추첨 게임",
    description:
      "참가자 이름을 입력하고 달팽이 레이싱으로 재미있게 추첨하세요! 워크숍, 파티, 팀빌딩에 딱 맞는 무료 온라인 게임.",
    url: "https://www.snailrace.site/",
    siteName: "Snail Race",
    locale: "ko_KR",
    type: "website",
  },
  alternates: {
    canonical: "https://www.snailrace.site/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7165994147929640"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Snail Race - 달팽이 레이싱 추첨 게임",
              description:
                "참가자 이름을 입력하고 달팽이 레이싱으로 재미있게 추첨하세요! 워크숍, 파티, 팀빌딩에 딱 맞는 무료 온라인 게임.",
              url: "https://www.snailrace.site/",
              applicationCategory: "GameApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "KRW",
              },
              inLanguage: "ko",
            }),
          }}
        />
      </head>
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
