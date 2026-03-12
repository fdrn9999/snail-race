"use client";

import { useState } from "react";
import ParticipantInput from "@/components/ParticipantInput";
import RaceTrack from "@/components/RaceTrack";

export default function Home() {
  const [participants, setParticipants] = useState<string[] | null>(null);

  return (
    <>
      {!participants ? (
        <>
          <main className="min-h-screen py-8 px-4">
            <ParticipantInput onStart={setParticipants} />

            {/* ══════ Publisher Content — 게임 소개 ══════ */}
            <section className="max-w-lg mx-auto mt-10 mb-16 space-y-5">

              {/* What is Snail Race */}
              <article className="bg-clay-card rounded-2xl p-5 sm:p-6 border-[3px] border-clay-border/15 clay-shadow">
                <h2 className="font-heading text-base sm:text-lg font-bold text-clay-text mb-3
                               flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-clay-mint/60 flex items-center justify-center
                                   border-2 border-clay-border/10 text-base shrink-0">
                    🐌
                  </span>
                  Snail Race란?
                </h2>
                <div className="font-body text-sm text-clay-muted leading-relaxed space-y-2">
                  <p>
                    <strong className="text-clay-text">Snail Race</strong>는 워크숍, 파티, 팀빌딩, 수업 등에서
                    사용할 수 있는 <strong className="text-clay-text">무료 온라인 추첨 게임</strong>입니다.
                    단순한 랜덤 추첨기와 달리, 달팽이 레이싱이라는 시각적 연출을 통해
                    추첨 과정 자체를 함께 즐길 수 있습니다.
                  </p>
                  <p>
                    각 달팽이는 참가자 이름에 따라 고유한 주행 특성을 가집니다.
                    스프린터, 뒷심형, 스피드형, 꾸준형 등 다양한 성격의 달팽이가
                    역동적인 추월과 역전을 펼치며, 효과음과 시각 이펙트가 관전의 재미를 더합니다.
                  </p>
                </div>
              </article>

              {/* How to use */}
              <article className="bg-clay-card rounded-2xl p-5 sm:p-6 border-[3px] border-clay-border/15 clay-shadow">
                <h2 className="font-heading text-base sm:text-lg font-bold text-clay-text mb-3
                               flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-clay-blue/60 flex items-center justify-center
                                   border-2 border-clay-border/10 text-base shrink-0">
                    📋
                  </span>
                  이렇게 사용하세요
                </h2>
                <ol className="font-body text-sm text-clay-muted leading-relaxed space-y-2.5">
                  {[
                    { step: "참가자 이름 입력", desc: "위 입력란에 이름을 쉼표, 줄바꿈, 탭으로 구분하여 입력합니다. 최소 2명, 최대 15명까지 가능합니다." },
                    { step: "레이스 시작", desc: "\"레이스 시작!\" 버튼을 누르면 3초 카운트다운 후 레이스가 시작됩니다." },
                    { step: "관전 & 응원", desc: "각 달팽이가 개성 있는 주행 스타일로 결승선을 향해 달립니다. 상단 바에서 실시간 순위를 확인하세요." },
                    { step: "결과 확인", desc: "1등부터 순서대로 순위가 결정됩니다. 결과로 추첨, 순서 정하기, 당첨자 선정 등에 활용하세요." },
                  ].map(({ step, desc }, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="shrink-0 w-6 h-6 rounded-lg bg-clay-accent/15 text-clay-accent
                                       flex items-center justify-center font-heading font-bold text-xs
                                       border border-clay-accent/20">
                        {i + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-clay-text">{step}</span>
                        <span className="text-clay-muted"> — {desc}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>

              {/* Use cases */}
              <article className="bg-clay-card rounded-2xl p-5 sm:p-6 border-[3px] border-clay-border/15 clay-shadow">
                <h2 className="font-heading text-base sm:text-lg font-bold text-clay-text mb-3
                               flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-clay-yellow/60 flex items-center justify-center
                                   border-2 border-clay-border/10 text-base shrink-0">
                    💡
                  </span>
                  이런 때 사용해보세요
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: "🏢", label: "워크숍 발표 순서" },
                    { icon: "🎉", label: "파티 당첨자 뽑기" },
                    { icon: "📚", label: "수업 발표자 선정" },
                    { icon: "👥", label: "팀빌딩 팀 구성" },
                    { icon: "👨‍👩‍👧‍👦", label: "가족 모임 역할 정하기" },
                    { icon: "🎮", label: "친구들과 순서 정하기" },
                  ].map(({ icon, label }, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl
                                            bg-clay-bg/80 border border-clay-border/8">
                      <span className="text-base">{icon}</span>
                      <span className="font-body text-xs sm:text-sm text-clay-text font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </article>

              {/* Features */}
              <article className="bg-clay-card rounded-2xl p-5 sm:p-6 border-[3px] border-clay-border/15 clay-shadow">
                <h2 className="font-heading text-base sm:text-lg font-bold text-clay-text mb-3
                               flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-clay-peach/60 flex items-center justify-center
                                   border-2 border-clay-border/10 text-base shrink-0">
                    ✨
                  </span>
                  주요 기능
                </h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {[
                    "최대 15명 참가",
                    "이름별 고유 달팽이 특성",
                    "실시간 순위 & 추월 이펙트",
                    "효과음 & 배경음악",
                    "모바일/PC 모두 지원",
                    "브라우저에서 바로 사용",
                    "참가자 이름 자동 저장",
                    "완전 무료",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-1.5 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-clay-success shrink-0" />
                      <span className="font-body text-xs sm:text-sm text-clay-muted">{feature}</span>
                    </div>
                  ))}
                </div>
              </article>

              {/* FAQ */}
              <article className="bg-clay-card rounded-2xl p-5 sm:p-6 border-[3px] border-clay-border/15 clay-shadow">
                <h2 className="font-heading text-base sm:text-lg font-bold text-clay-text mb-3
                               flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-clay-lilac/80 flex items-center justify-center
                                   border-2 border-clay-border/10 text-base shrink-0">
                    ❓
                  </span>
                  자주 묻는 질문
                </h2>
                <div className="space-y-4 font-body text-sm">
                  {[
                    {
                      q: "결과는 공정한가요?",
                      a: "네! 우승자는 매 레이스마다 완전히 랜덤으로 결정됩니다. 레이스의 시각적 연출은 결과를 더 흥미롭게 보여주기 위한 것이며, 모든 참가자에게 동일한 당첨 확률이 부여됩니다.",
                    },
                    {
                      q: "몇 명까지 참가할 수 있나요?",
                      a: "최소 2명부터 최대 15명까지 참가할 수 있습니다. 이름은 8자 이내로 입력하며, 8자를 초과하는 이름은 시작 시 자동으로 줄여집니다.",
                    },
                    {
                      q: "참가자 이름이 저장되나요?",
                      a: "이름은 사용자의 브라우저(localStorage)에만 저장되며, 서버로 전송되지 않습니다. 새로고침 후 이전 참가자 이름이 자동으로 표시되어 편리하게 재사용할 수 있습니다.",
                    },
                    {
                      q: "모바일에서도 사용할 수 있나요?",
                      a: "네! 모바일과 데스크톱 모두 지원합니다. 참가자가 8명 이상이면 가로 모드를 권장합니다.",
                    },
                  ].map(({ q, a }, i) => (
                    <div key={i}>
                      <p className="font-semibold text-clay-text">{q}</p>
                      <p className="text-clay-muted leading-relaxed mt-0.5">{a}</p>
                    </div>
                  ))}
                </div>
              </article>

            </section>
          </main>

          <footer className="py-4 text-center font-body text-[11px] text-clay-muted/60 space-x-3">
            <span>Made by 정진호(fdrn9999)</span>
            <a href="https://github.com/fdrn9999" target="_blank" rel="noopener noreferrer"
               className="hover:text-clay-muted transition-colors">GitHub</a>
            <a href="mailto:ckato9173@gmail.com"
               className="hover:text-clay-muted transition-colors">ckato9173@gmail.com</a>
            <span className="text-clay-muted/30">|</span>
            <a href="/privacy" className="hover:text-clay-muted transition-colors">개인정보처리방침</a>
          </footer>
        </>
      ) : (
        <main className="min-h-screen">
          <RaceTrack
            participants={participants}
            onReset={() => setParticipants(null)}
          />
        </main>
      )}
    </>
  );
}
