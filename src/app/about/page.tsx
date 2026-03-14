import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "소개 - Snail Race | 달팽이 레이싱 추첨 게임",
  description:
    "Snail Race는 워크숍, 수업, 파티에서 사용할 수 있는 무료 온라인 추첨 게임입니다. 프로젝트 소개와 개발 배경을 알아보세요.",
  openGraph: {
    title: "소개 - Snail Race",
    description:
      "달팽이 레이싱으로 재미있게 추첨하세요! Snail Race 프로젝트 소개.",
    url: "https://www.snailrace.site/about",
    siteName: "Snail Race",
    locale: "ko_KR",
    type: "article",
  },
  alternates: {
    canonical: "https://www.snailrace.site/about",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen py-8 sm:py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-body text-sm text-clay-muted
                     hover:text-clay-text transition-colors mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Snail Race로 돌아가기
        </Link>

        <div className="space-y-5">
          {/* Title card */}
          <article className="bg-clay-card rounded-3xl p-6 sm:p-8 border-[3px] border-clay-border/15 clay-shadow-lg">
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-clay-text mb-3">
              Snail Race 소개
            </h1>
            <p className="font-body text-sm text-clay-muted leading-relaxed">
              Snail Race는 누구나 무료로 사용할 수 있는 온라인 추첨 게임입니다.
              단순한 랜덤 뽑기를 넘어, 달팽이 레이싱이라는 재미있는 시각적 연출로
              추첨 과정 자체를 즐길 수 있도록 만들었습니다.
            </p>
          </article>

          {/* Why Snail Race */}
          <article className="bg-clay-card rounded-2xl p-5 sm:p-6 border-[3px] border-clay-border/15 clay-shadow">
            <h2
              className="font-heading text-base sm:text-lg font-bold text-clay-text mb-3
                         flex items-center gap-2"
            >
              <span
                className="w-8 h-8 rounded-xl bg-clay-mint/60 flex items-center justify-center
                           border-2 border-clay-border/10 text-base shrink-0"
              >
                🎯
              </span>
              왜 Snail Race를 만들었나요?
            </h2>
            <div className="font-body text-sm text-clay-muted leading-relaxed space-y-3">
              <p>
                워크숍이나 수업에서 발표 순서를 정하거나 당첨자를 뽑을 때, 대부분
                단순한 랜덤 숫자 생성기나 제비뽑기를 사용합니다. 기능적으로는
                충분하지만, 추첨 과정이 순식간에 끝나버려 참여자들이 함께 즐길 수
                있는 순간이 사라집니다.
              </p>
              <p>
                Snail Race는 이 문제를 해결하기 위해 탄생했습니다.{" "}
                <strong className="text-clay-text">
                  추첨 결과를 달팽이 레이싱이라는 형태로 연출
                </strong>
                함으로써, 결과가 나오기까지의 과정을 모든 참여자가 함께 지켜보고
                응원하는 공유 경험으로 만들어 줍니다.
              </p>
              <p>
                카운트다운이 시작되면 화면에 집중하게 되고, 내 달팽이가 앞서가면
                환호하고, 뒤처지면 안타까워하는 — 이런 작은 감정의 흐름이 모임의
                분위기를 한층 따뜻하게 만들어 줍니다.
              </p>
            </div>
          </article>

          {/* How it works */}
          <article className="bg-clay-card rounded-2xl p-5 sm:p-6 border-[3px] border-clay-border/15 clay-shadow">
            <h2
              className="font-heading text-base sm:text-lg font-bold text-clay-text mb-3
                         flex items-center gap-2"
            >
              <span
                className="w-8 h-8 rounded-xl bg-clay-blue/60 flex items-center justify-center
                           border-2 border-clay-border/10 text-base shrink-0"
              >
                ⚙️
              </span>
              어떻게 작동하나요?
            </h2>
            <div className="font-body text-sm text-clay-muted leading-relaxed space-y-3">
              <p>
                Snail Race의 핵심은{" "}
                <strong className="text-clay-text">공정한 랜덤성</strong>과{" "}
                <strong className="text-clay-text">흥미로운 시각 연출</strong>의
                조합입니다.
              </p>
              <div className="space-y-2">
                <div className="pl-3 border-l-2 border-clay-blue/30">
                  <p className="font-semibold text-clay-text">
                    공정한 결과 보장
                  </p>
                  <p>
                    우승자는 매 레이스마다 완전히 랜덤으로 결정됩니다. 모든
                    참가자에게 동일한 우승 확률이 부여되며, 이름이나 입력 순서가
                    결과에 영향을 미치지 않습니다.
                  </p>
                </div>
                <div className="pl-3 border-l-2 border-clay-blue/30">
                  <p className="font-semibold text-clay-text">
                    개성 있는 달팽이 캐릭터
                  </p>
                  <p>
                    각 참가자의 이름에 따라 달팽이에 고유한 주행 특성이 부여됩니다.
                    스프린터, 뒷심형, 스피드형, 꾸준형 등 4가지 유형이 있어
                    레이스마다 다른 전개가 펼쳐집니다.
                  </p>
                </div>
                <div className="pl-3 border-l-2 border-clay-blue/30">
                  <p className="font-semibold text-clay-text">
                    몰입감 있는 연출
                  </p>
                  <p>
                    배경음악, 효과음, 추월 이펙트, 먼지 파티클, 컨페티 등 다양한
                    시청각 요소가 레이스의 몰입감을 높여줍니다. 상단 바에서는
                    실시간 순위 변동을 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Design philosophy */}
          <article className="bg-clay-card rounded-2xl p-5 sm:p-6 border-[3px] border-clay-border/15 clay-shadow">
            <h2
              className="font-heading text-base sm:text-lg font-bold text-clay-text mb-3
                         flex items-center gap-2"
            >
              <span
                className="w-8 h-8 rounded-xl bg-clay-peach/60 flex items-center justify-center
                           border-2 border-clay-border/10 text-base shrink-0"
              >
                🎨
              </span>
              디자인 철학
            </h2>
            <div className="font-body text-sm text-clay-muted leading-relaxed space-y-3">
              <p>
                Snail Race는{" "}
                <strong className="text-clay-text">클레이 모핑</strong> 스타일의
                부드럽고 따뜻한 디자인을 채택했습니다. 둥근 모서리, 부드러운
                그림자, 파스텔 색상의 조합으로 누구나 편안하게 사용할 수 있는
                친근한 분위기를 만들었습니다.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    title: "접근성",
                    desc: "설치 없이 브라우저에서 바로 사용. 회원가입도 필요 없습니다.",
                  },
                  {
                    title: "반응형",
                    desc: "모바일, 태블릿, 데스크톱 어디서든 최적화된 화면을 제공합니다.",
                  },
                  {
                    title: "프라이버시",
                    desc: "모든 데이터는 브라우저에만 저장. 서버로 전송되지 않습니다.",
                  },
                  {
                    title: "완전 무료",
                    desc: "제한 없이 무료로 사용할 수 있습니다. 숨겨진 유료 기능이 없습니다.",
                  },
                ].map(({ title, desc }, i) => (
                  <div
                    key={i}
                    className="px-3 py-2.5 rounded-xl bg-clay-bg/80 border border-clay-border/8"
                  >
                    <p className="font-semibold text-clay-text text-xs sm:text-sm">
                      {title}
                    </p>
                    <p className="text-clay-muted text-xs mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Use cases summary */}
          <article className="bg-clay-card rounded-2xl p-5 sm:p-6 border-[3px] border-clay-border/15 clay-shadow">
            <h2
              className="font-heading text-base sm:text-lg font-bold text-clay-text mb-3
                         flex items-center gap-2"
            >
              <span
                className="w-8 h-8 rounded-xl bg-clay-yellow/60 flex items-center justify-center
                           border-2 border-clay-border/10 text-base shrink-0"
              >
                💡
              </span>
              이런 분들에게 추천합니다
            </h2>
            <div className="font-body text-sm text-clay-muted leading-relaxed space-y-3">
              <ul className="space-y-2.5">
                {[
                  {
                    who: "워크숍 진행자",
                    why: "발표 순서, 역할 배분을 재미있게 하고 싶은 분. 아이스브레이킹 효과까지 얻을 수 있습니다.",
                  },
                  {
                    who: "선생님 / 강사",
                    why: "수업 중 발표자 선정, 조별 구성, 보상 추첨에 학생들의 참여를 유도하고 싶은 분.",
                  },
                  {
                    who: "파티 주최자",
                    why: "경품 추첨, 벌칙 게임, 메뉴 정하기 등 모임을 더 즐겁게 만들고 싶은 분.",
                  },
                  {
                    who: "팀 리더",
                    why: "회의에서 서기, 타임키퍼 등 역할을 공정하고 재미있게 배분하고 싶은 분.",
                  },
                  {
                    who: "가족 / 친구 모임",
                    why: "누가 설거지를 할지, 어떤 영화를 볼지 같은 일상적인 결정도 게임으로 재미있게.",
                  },
                ].map(({ who, why }, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-clay-accent shrink-0 mt-1.5" />
                    <div>
                      <span className="font-semibold text-clay-text">{who}</span>
                      <span className="text-clay-muted"> — {why}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          {/* Developer info */}
          <article className="bg-clay-card rounded-2xl p-5 sm:p-6 border-[3px] border-clay-border/15 clay-shadow">
            <h2
              className="font-heading text-base sm:text-lg font-bold text-clay-text mb-3
                         flex items-center gap-2"
            >
              <span
                className="w-8 h-8 rounded-xl bg-clay-lilac/80 flex items-center justify-center
                           border-2 border-clay-border/10 text-base shrink-0"
              >
                👨‍💻
              </span>
              개발자 소개
            </h2>
            <div className="font-body text-sm text-clay-muted leading-relaxed space-y-3">
              <p>
                Snail Race는{" "}
                <strong className="text-clay-text">정진호(fdrn9999)</strong>가
                개발한 프로젝트입니다. 다양한 모임에서 사용할 수 있는 재미있고
                공정한 추첨 도구를 만들고 싶다는 생각에서 시작되었습니다.
              </p>
              <p>
                Next.js, React, Framer Motion 등의 최신 웹 기술을 활용하여
                부드러운 애니메이션과 반응형 인터페이스를 구현했습니다.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <a
                  href="https://github.com/fdrn9999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                             bg-clay-bg/80 border border-clay-border/8
                             text-xs text-clay-text hover:bg-clay-bg transition-colors"
                >
                  GitHub
                </a>
                <a
                  href="mailto:ckato9173@gmail.com"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                             bg-clay-bg/80 border border-clay-border/8
                             text-xs text-clay-text hover:bg-clay-bg transition-colors"
                >
                  ckato9173@gmail.com
                </a>
              </div>
            </div>
          </article>

          {/* CTA */}
          <div className="text-center py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl
                         bg-clay-accent text-white font-heading font-bold text-sm
                         border-2 border-clay-accent/30 clay-shadow
                         hover:brightness-110 transition-all"
            >
              🐌 지금 바로 레이스 시작하기
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 py-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-body text-[11px] text-clay-muted/60">
          <Link
            href="/"
            className="whitespace-nowrap hover:text-clay-muted transition-colors"
          >
            홈
          </Link>
          <Link
            href="/guide"
            className="whitespace-nowrap hover:text-clay-muted transition-colors"
          >
            활용 가이드
          </Link>
          <Link
            href="/privacy"
            className="whitespace-nowrap hover:text-clay-muted transition-colors"
          >
            개인정보처리방침
          </Link>
        </footer>
      </div>
    </main>
  );
}
