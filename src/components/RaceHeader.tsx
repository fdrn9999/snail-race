"use client";

import { motion, LayoutGroup } from "framer-motion";
import Image from "next/image";
import type { RaceState } from "@/lib/raceEngine";

interface Props {
  participants: string[];
  isRacing: boolean;
  countdown: number | null;
  raceFinished: boolean;
  raceState: RaceState | null;
  bgmMuted: boolean;
  toggleBgm: () => void;
  liveRankings: number[];
  finishOrder: number[];
}

function BgmIcon({ muted, className }: { muted: boolean; className: string }) {
  if (muted) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export default function RaceHeader({
  participants, isRacing, countdown, raceFinished,
  raceState, bgmMuted, toggleBgm, liveRankings, finishOrder,
}: Props) {
  return (
    <div className="shrink-0 mb-1 sm:mb-2">
      {/* 풀 타이틀: 레이스 전/후에만 표시 */}
      {!isRacing && countdown === null && !raceFinished && (
        <div className="text-center mb-3 relative">
          <div className="flex items-center justify-center gap-2">
            <Image src="/logo.svg" alt="" width={36} height={36} aria-hidden="true" />
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-clay-text tracking-tight">
              달팽이 레이싱
            </h1>
          </div>
          <p className="font-body text-clay-muted text-sm mt-1">
            {participants.length}명 참가
          </p>
          <button
            type="button"
            onClick={toggleBgm}
            className="absolute right-0 top-1/2 -translate-y-1/2
                       w-8 h-8 flex items-center justify-center rounded-xl
                       bg-clay-lilac/40 border-2 border-clay-border/15
                       text-clay-muted hover:text-clay-text hover:bg-clay-lilac/60
                       transition-colors duration-150 cursor-pointer"
            aria-label={bgmMuted ? "배경음악 켜기" : "배경음악 끄기"}
          >
            <BgmIcon muted={bgmMuted} className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 컴팩트 타이틀 + 슬림 순위 스트립: 카운트다운/레이스/결과 중 */}
      {(countdown !== null || isRacing || raceFinished) && (
        <div>
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <Image src="/logo.svg" alt="" width={22} height={22} aria-hidden="true" />
            <span className="font-heading text-sm sm:text-base font-bold text-clay-text">
              달팽이 레이싱
            </span>
            <span className="font-body text-clay-muted text-xs">
              {participants.length}명
            </span>
            {raceState && (
              <span className={`font-heading font-bold text-[10px] sm:text-xs uppercase tracking-wide
                ${raceFinished ? "text-clay-success" : "text-clay-muted/60"}`}>
                {raceFinished ? "완료" : "진행 중"}
              </span>
            )}
            <button
              type="button"
              onClick={toggleBgm}
              className="w-6 h-6 flex items-center justify-center rounded-lg
                         bg-clay-lilac/30 border border-clay-border/10
                         text-clay-muted hover:text-clay-text
                         transition-colors duration-150 cursor-pointer"
              aria-label={bgmMuted ? "배경음악 켜기" : "배경음악 끄기"}
            >
              <BgmIcon muted={bgmMuted} className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 슬림 순위 스트립 */}
          <div className="bg-clay-card/90 backdrop-blur-sm rounded-xl border-2 border-clay-border/20
                          px-2 sm:px-3 py-1.5">
            {raceState ? (
              <LayoutGroup>
                <div className="flex items-center justify-center gap-x-1 sm:gap-x-1.5 flex-nowrap overflow-x-auto">
                  {liveRankings.map((participantIdx, rank) => {
                    const isConfirmed = rank < finishOrder.length;
                    const isTop3 = rank < 3;
                    const medal = isConfirmed && isTop3
                      ? (rank === 0 ? "🥇" : rank === 1 ? "🥈" : "🥉")
                      : null;

                    return (
                      <motion.span
                        key={`rank-${participantIdx}`}
                        layout
                        transition={{ type: "spring", stiffness: 200, damping: 35, mass: 1 }}
                        className={`inline-flex items-center gap-0.5 shrink-0
                          ${isTop3
                            ? `px-1.5 sm:px-2 py-0.5 rounded-lg border
                               ${isConfirmed
                                 ? rank === 0
                                   ? "bg-clay-gold/25 border-clay-gold/50"
                                   : rank === 1
                                     ? "bg-clay-lilac/20 border-clay-lilac/40"
                                     : "bg-clay-peach/15 border-clay-peach/35"
                                 : "bg-clay-bg/40 border-clay-border/8"
                               }`
                            : "px-0.5"
                          }`}
                      >
                        <span className={`font-heading font-bold
                          ${isTop3
                            ? `text-[11px] sm:text-xs ${isConfirmed ? "" : "text-clay-muted/50"}`
                            : `text-[9px] sm:text-[10px] ${isConfirmed ? "text-clay-muted/70" : "text-clay-muted/35"}`
                          }`}>
                          {medal || `${rank + 1}`}
                        </span>
                        <span className={`font-body font-semibold truncate
                          ${isTop3
                            ? `text-[11px] sm:text-xs max-w-[48px] sm:max-w-[64px] ${isConfirmed ? "text-clay-text" : "text-clay-muted/50"}`
                            : `text-[9px] sm:text-[10px] max-w-[36px] sm:max-w-[48px] ${isConfirmed ? "text-clay-muted" : "text-clay-muted/40"}`
                          }`}>
                          {participants[participantIdx]}
                        </span>
                      </motion.span>
                    );
                  })}
                </div>
              </LayoutGroup>
            ) : (
              <div className="text-center">
                <span className="font-heading font-bold text-[11px] sm:text-xs text-clay-muted">
                  준비 중...
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
