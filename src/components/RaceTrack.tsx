"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import confetti from "canvas-confetti";
import { createRaceEngine, type RaceState } from "@/lib/raceEngine";

interface Props {
  participants: string[];
  onReset: () => void;
}

const SHELL_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FDCB6E", "#A29BFE",
  "#FF9ECD", "#6C5CE7", "#E17055", "#00B894", "#74B9FF",
  "#FD79A8", "#55E6C1", "#FDA7DF", "#F8C291", "#82CCDD",
];

const RACE_DURATION = 10000;

/* ── SVG Snail (cartoon) ── */
function SnailSvg({ shellColor, size = 40 }: { shellColor: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scaleX(-1)", filter: "drop-shadow(1px 2px 2px rgba(0,0,0,0.35))" }} aria-hidden="true">
      <ellipse cx="32" cy="46" rx="28" ry="10" fill="#FFD993" stroke="#C68B3E" strokeWidth="2" />
      <ellipse cx="28" cy="44" rx="18" ry="5" fill="#FFE8B8" opacity="0.6" />
      <circle cx="36" cy="30" r="18" fill={shellColor} stroke="#2D3436" strokeWidth="2.5" />
      <path d="M36 16 C42 20, 46 26, 44 32 C42 38, 36 40, 32 36 C28 32, 30 26, 36 24 C40 22, 42 28, 38 30"
            stroke="#2D3436" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.5" />
      <circle cx="30" cy="24" r="4" fill="white" opacity="0.35" />
      <ellipse cx="14" cy="40" rx="10" ry="8" fill="#FFD993" stroke="#C68B3E" strokeWidth="1.5" />
      <line x1="10" y1="36" x2="6" y2="26" stroke="#C68B3E" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="35" x2="14" y2="25" stroke="#C68B3E" strokeWidth="2" strokeLinecap="round" />
      <circle cx="6" cy="24" r="3.5" fill="white" stroke="#2D3436" strokeWidth="1.5" />
      <circle cx="14" cy="23" r="3.5" fill="white" stroke="#2D3436" strokeWidth="1.5" />
      <circle cx="7" cy="23.5" r="1.8" fill="#2D3436" />
      <circle cx="15" cy="22.5" r="1.8" fill="#2D3436" />
      <circle cx="6" cy="22" r="0.8" fill="white" />
      <circle cx="14" cy="21" r="0.8" fill="white" />
      <path d="M10 43 Q14 46 18 43" stroke="#C68B3E" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="8" cy="42" rx="2.5" ry="1.5" fill="#FFB5B5" opacity="0.5" />
    </svg>
  );
}


export default function RaceTrack({ participants, onReset }: Props) {
  const [raceState, setRaceState] = useState<RaceState | null>(null);
  const [isRacing, setIsRacing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showGo, setShowGo] = useState(false);
  const [landscapeHintDismissed, setLandscapeHintDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("snailrace-landscape-dismissed") === "1";
    }
    return false;
  });
  const engineRef = useRef<ReturnType<typeof createRaceEngine> | null>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastTimestamp = useRef<number>(0);
  const countIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const snailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slimeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dustRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameCountRef = useRef(0);
  const prevFinishCountRef = useRef(0);

  const snailSize = participants.length >= 13 ? 22 : participants.length >= 11 ? 26 : participants.length >= 9 ? 28 : participants.length >= 7 ? 32 : 36;

  const cleanup = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (countIntervalRef.current) clearInterval(countIntervalRef.current);
  }, []);

  const fireConfetti = useCallback(() => {
    const end = Date.now() + 3500;
    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.65 },
        colors: ["#FDCB6E", "#FF6B6B", "#4ECDC4", "#A29BFE", "#FF9ECD"],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.65 },
        colors: ["#FDCB6E", "#FF6B6B", "#4ECDC4", "#A29BFE", "#FF9ECD"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const updateEffects = useCallback((positions: number[]) => {
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const slimeEl = slimeRefs.current[i];
      if (slimeEl) {
        if (pos > 2) {
          slimeEl.style.display = "block";
          slimeEl.style.width = `${Math.min(pos * 0.6, 40)}px`;
        } else {
          slimeEl.style.display = "none";
        }
      }
      const dustEl = dustRefs.current[i];
      if (dustEl) {
        dustEl.style.display = pos > 3 ? "block" : "none";
      }
    }
  }, []);

  const handleSkip = useCallback(() => {
    if (!engineRef.current || !isRacing) return;
    cancelAnimationFrame(animFrameRef.current);

    const engine = engineRef.current;
    const state = engine.skipToEnd();

    const trackEl = trackRef.current;
    if (trackEl) {
      const trackWidth = trackEl.clientWidth;
      for (let i = 0; i < participants.length; i++) {
        const el = snailRefs.current[i];
        if (el) {
          const pxPos = (state.positions[i] / 100) * (trackWidth - 60);
          el.style.transform = `translateY(-50%) translateX(${pxPos}px)`;
          // 등수 기반 고정 z-index (1등=200, 2등=199, ...)
          const finishRank = state.finishOrder.indexOf(i);
          el.style.zIndex = `${200 - finishRank}`;
        }
      }
    }
    for (let i = 0; i < participants.length; i++) {
      const slimeEl = slimeRefs.current[i];
      if (slimeEl) slimeEl.style.display = "none";
      const dustEl = dustRefs.current[i];
      if (dustEl) dustEl.style.display = "none";
    }

    setRaceState(engine.snapshot());
    setIsRacing(false);
    setTimeout(() => fireConfetti(), 300);
  }, [isRacing, fireConfetti, participants.length]);

  const startRace = useCallback(() => {
    const winnerId = Math.floor(Math.random() * participants.length);

    // 뷰포트 너비 기반 러버밴드 스케일 (좁은 화면 = 부드러운 보정)
    const trackWidth = trackRef.current?.clientWidth ?? 800;
    const rubberBandScale = Math.min(1, trackWidth / 800);

    const engine = createRaceEngine({
      totalDuration: RACE_DURATION,
      participantCount: participants.length,
      predeterminedWinner: winnerId,
      rubberBandScale,
    });

    engineRef.current = engine;
    snailRefs.current = new Array(participants.length).fill(null);
    slimeRefs.current = new Array(participants.length).fill(null);
    dustRefs.current = new Array(participants.length).fill(null);
    frameCountRef.current = 0;
    prevFinishCountRef.current = 0;
    setRaceState(null);

    setCountdown(3);
    let count = 3;

    countIntervalRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        setCountdown(null);
        if (countIntervalRef.current) clearInterval(countIntervalRef.current);

        setShowGo(true);
        setTimeout(() => setShowGo(false), 600);

        setIsRacing(true);
        startTimeRef.current = performance.now();

        const animate = (timestamp: number) => {
          let elapsed = timestamp - startTimeRef.current;

          // ── 탭 전환 감지: 200ms 이상 갭 → 레이스 시계 일시정지 ──
          // 엔진에 큰 dt를 보내지 않아 급발진/순간이동 방지
          if (lastTimestamp.current > 0) {
            const gap = elapsed - lastTimestamp.current;
            if (gap > 200) {
              startTimeRef.current += (gap - 16.67);
              elapsed = lastTimestamp.current + 16.67;
            }
          }

          lastTimestamp.current = elapsed;
          const state = engine.update(elapsed);

          const trackEl = trackRef.current;
          if (trackEl) {
            const tw = trackEl.clientWidth;
            for (let i = 0; i < participants.length; i++) {
              const el = snailRefs.current[i];
              if (el) {
                const pxPos = (state.positions[i] / 100) * (tw - 60);
                el.style.transform = `translateY(-50%) translateX(${pxPos}px)`;
                // 결승 통과: 등수 기반 고정 z-index / 레이스 중: 위치 기반
                const finishRank = state.finishOrder.indexOf(i);
                el.style.zIndex = finishRank >= 0
                  ? `${200 - finishRank}`
                  : `${20 + Math.round(state.positions[i])}`;
              }
            }
          }

          updateEffects(state.positions);

          frameCountRef.current++;
          const finishChanged = state.finishOrder.length !== prevFinishCountRef.current;
          if (finishChanged || frameCountRef.current % 12 === 0 || state.finished) {
            prevFinishCountRef.current = state.finishOrder.length;
            setRaceState(engine.snapshot());
          }

          if (!state.finished) {
            animFrameRef.current = requestAnimationFrame(animate);
          } else {
            setIsRacing(false);
            for (let i = 0; i < participants.length; i++) {
              const slimeEl = slimeRefs.current[i];
              if (slimeEl) slimeEl.style.display = "none";
              const dustEl = dustRefs.current[i];
              if (dustEl) dustEl.style.display = "none";
            }
            setTimeout(() => fireConfetti(), 400);
          }
        };
        animFrameRef.current = requestAnimationFrame(animate);
      }
    }, 1000);
  }, [participants, fireConfetti, updateEffects]);

  useEffect(() => cleanup, [cleanup]);

  const handleRerace = () => {
    cleanup();
    setRaceState(null);
    setIsRacing(false);
    setCountdown(null);
    setShowGo(false);
    setTimeout(() => startRace(), 80);
  };

  const finishOrder = raceState?.finishOrder || [];
  const raceFinished = !!raceState?.finished;

  // 실시간 순위: 확정된 finisher 먼저, 나머지는 현재 위치(높은 순)로 정렬
  const liveRankings: number[] = [];
  if (raceState) {
    const finishedSet = new Set(finishOrder);
    liveRankings.push(...finishOrder);
    const remaining = participants
      .map((_, i) => i)
      .filter((i) => !finishedSet.has(i))
      .sort((a, b) => raceState.positions[b] - raceState.positions[a]);
    liveRankings.push(...remaining);
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3 h-dvh flex flex-col">

      {/* Mobile landscape hint (portrait + many participants) */}
      {participants.length >= 8 && !landscapeHintDismissed && (
        <div className="sm:hidden mb-1 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-clay-gold/30 rounded-xl border-2 border-clay-gold/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-clay-border shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="7" width="20" height="10" rx="2" />
              <path d="M12 7v10" strokeDasharray="2 2" opacity="0.4" />
            </svg>
            <p className="font-body text-xs text-clay-text font-semibold flex-1">
              참가자가 많아요! 가로 모드로 보면 더 잘 보여요
            </p>
            <button
              type="button"
              onClick={() => {
                setLandscapeHintDismissed(true);
                localStorage.setItem("snailrace-landscape-dismissed", "1");
              }}
              className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full
                         text-clay-muted hover:text-clay-text transition-colors cursor-pointer"
              aria-label="가로 모드 안내 닫기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header — 레이스 중에는 축소하여 공간 절약 */}
      <div className="shrink-0 mb-1 sm:mb-2">
        {/* 풀 타이틀: 레이스 전/후에만 표시 */}
        {!isRacing && countdown === null && !raceFinished && (
          <div className="text-center mb-3">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-clay-text tracking-tight">
              달팽이 레이싱
            </h1>
            <p className="font-body text-clay-muted text-sm mt-1">
              {participants.length}명 참가
            </p>
          </div>
        )}

        {/* 컴팩트 타이틀 + 슬림 순위 스트립: 카운트다운/레이스/결과 중 */}
        {(countdown !== null || isRacing || raceFinished) && (
          <div>
            {/* 한 줄 타이틀 */}
            <div className="text-center mb-1.5">
              <span className="font-heading text-sm sm:text-base font-bold text-clay-text">
                달팽이 레이싱
              </span>
              <span className="font-body text-clay-muted text-xs ml-2">
                {participants.length}명
              </span>
              {raceState && (
                <span className={`font-heading font-bold text-[10px] sm:text-xs ml-2 uppercase tracking-wide
                  ${raceFinished ? "text-clay-success" : "text-clay-muted/60"}`}>
                  {raceFinished ? "완료" : "진행 중"}
                </span>
              )}
            </div>

            {/* ═══ 슬림 순위 스트립 ═══ */}
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

      {/* ══════ Race Track ══════ */}
      <div className="flex-1 min-h-0 relative rounded-3xl border-[3px] border-clay-border clay-shadow-lg overflow-hidden flex flex-col">

        {/* Top rail — dark wood fence */}
        <div className="shrink-0 h-10 sm:h-12 bg-gradient-to-b from-[#5D4037] to-[#795548] flex items-center justify-between px-4 sm:px-6
                        border-b-[3px] border-[#3E2723]">
          <div className="flex gap-6 sm:gap-10 absolute inset-x-0 top-0 h-full items-end px-2 pointer-events-none" aria-hidden="true">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="w-[6px] h-full bg-[#4E342E] rounded-t-sm shrink-0 opacity-40" />
            ))}
          </div>
          <span className="font-heading text-xs sm:text-sm font-bold text-white/90 uppercase tracking-widest z-10
                           bg-[#4E342E] px-3 py-1 rounded-lg border border-white/15">
            Start
          </span>
          <span className="font-heading text-xs sm:text-sm font-bold text-white/90 uppercase tracking-widest z-10
                           bg-[#4E342E] px-3 py-1 rounded-lg border border-white/15 flex items-center gap-1.5">
            Finish
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </span>
        </div>

        {/* Lanes area */}
        <div className="bg-[#4a8c3f] flex-1 flex flex-col min-h-0" ref={trackRef}>
          {participants.map((name, index) => {
            const isWinner = raceFinished && raceState?.winnerId === index;
            const isEven = index % 2 === 0;

            return (
              <div
                key={index}
                className="relative border-b-[2px] border-[#3d7233] last:border-b-0 flex-1 min-h-0"
              >
                <div
                  className={`relative h-full ${isEven ? "bg-[#5CA03A]" : "bg-[#4E9132]"}`}
                >
                  {/* Grass mow stripes */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                    <div
                      className="w-full h-full opacity-[0.08]"
                      style={{
                        backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent 30px, rgba(255,255,255,0.6) 30px, rgba(255,255,255,0.6) 60px)`,
                      }}
                    />
                  </div>

                  {/* Grass tufts */}
                  <div className="absolute bottom-0 inset-x-0 pointer-events-none" aria-hidden="true">
                    {[8, 22, 38, 55, 68, 82, 93].map((leftPct, j) => (
                      <svg key={j} className="absolute bottom-0 w-3 h-3 text-[#3d7a28] opacity-50"
                           style={{ left: `${leftPct}%` }} viewBox="0 0 12 12" fill="currentColor">
                        <path d="M2 12 L4 5 L6 12 M5 12 L7 3 L9 12 M8 12 L10 6 L12 12" stroke="currentColor" strokeWidth="1" fill="none" />
                      </svg>
                    ))}
                  </div>

                  {/* Dirt track lane (center strip) */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[60%] mx-1
                                  bg-[#C9A96E] rounded-lg border border-[#a88c4a]/50 overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-30 pointer-events-none"
                      style={{
                        backgroundImage: `
                          radial-gradient(circle at 20% 50%, #b8943f 1px, transparent 1px),
                          radial-gradient(circle at 60% 30%, #b8943f 1px, transparent 1px),
                          radial-gradient(circle at 80% 70%, #b8943f 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 20px",
                      }}
                    />
                    <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-b from-white/15 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-t from-black/10 to-transparent" />
                  </div>

                  {/* Lane number badge */}
                  <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20
                                  w-7 h-7 sm:w-8 sm:h-8
                                  bg-white rounded-full flex items-center justify-center
                                  border-[2.5px] border-clay-border shadow-md">
                    <span className="text-clay-border text-[11px] sm:text-xs font-heading font-bold">
                      {index + 1}
                    </span>
                  </div>

                  {/* Finish line (checkered pattern) */}
                  <div className="absolute right-0 top-0 bottom-0 w-5 sm:w-6 z-10" aria-hidden="true">
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: "repeating-conic-gradient(#1a1a1a 0% 25%, #ffffff 0% 50%)",
                        backgroundSize: "8px 8px",
                      }}
                    />
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#E74C3C]" />
                  </div>

                  {/* ── SNAIL ── GPU accelerated */}
                  <div
                    ref={(el) => { snailRefs.current[index] = el; }}
                    className="absolute top-1/2 left-[10px] z-20 will-change-transform"
                    style={{ transform: "translateY(-50%) translateX(0px)" }}
                  >
                    <div
                      ref={(el) => { slimeRefs.current[index] = el; }}
                      className="absolute right-full top-1/2 -translate-y-1/2 h-[6px] rounded-full pointer-events-none opacity-40"
                      style={{
                        display: "none",
                        width: "0px",
                        background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45))",
                      }}
                    />
                    <div
                      ref={(el) => { dustRefs.current[index] = el; }}
                      className="absolute -left-1 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ display: "none" }}
                    >
                      {[0, 1, 2, 3].map((d) => (
                        <span
                          key={d}
                          className="absolute animate-dust rounded-full"
                          style={{
                            animationDelay: `${d * 0.14}s`,
                            top: `${-6 + d * 4}px`,
                            width: `${5 - d}px`,
                            height: `${5 - d}px`,
                            backgroundColor: "#C9A96E",
                            opacity: 0.6,
                          }}
                        />
                      ))}
                    </div>

                    <div className={`relative flex items-center ${isWinner ? "animate-winner-bounce" : ""}`}>
                      <div className={`relative ${isWinner ? "animate-winner-glow rounded-2xl" : ""} ${isRacing ? "animate-snail-crawl" : ""}`}>
                        <SnailSvg
                          shellColor={SHELL_COLORS[index % SHELL_COLORS.length]}
                          size={snailSize}
                        />
                      </div>
                      <div className={`absolute whitespace-nowrap
                                       px-2 py-0.5 rounded-lg
                                       font-heading font-bold
                                       border-[2px] border-clay-border/30 shadow-sm
                                       ${isWinner
                                         ? "bg-clay-gold text-clay-border"
                                         : "bg-white/95 text-clay-text"
                                       }
                                       ${participants.length >= 11
                                         ? "left-full top-1/2 -translate-y-1/2 ml-1 text-[8px] sm:text-[10px]"
                                         : "-top-5 left-1/2 -translate-x-1/2 text-[10px] sm:text-[11px]"
                                       }`}
                      >
                        <span className={`truncate inline-block
                          ${participants.length >= 11
                            ? "max-w-[48px] sm:max-w-[72px] text-[7px] sm:text-[9px]"
                            : "max-w-[72px] sm:max-w-[96px] text-[9px] sm:text-[11px]"
                          }`}>
                          {name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom rail */}
        <div className="shrink-0 h-5 sm:h-6 bg-gradient-to-t from-[#5D4037] to-[#795548] border-t-[3px] border-[#3E2723]" />


        {/* Skip button (left side) */}
        <AnimatePresence>
          {isRacing && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 3, duration: 0.3 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSkip}
              className="absolute top-12 sm:top-14 left-2 sm:left-3 z-25
                         py-1.5 px-3 bg-white/90 text-clay-muted font-heading font-bold
                         rounded-xl text-xs border-2 border-clay-border/15
                         shadow-md cursor-pointer backdrop-blur-sm
                         hover:text-clay-text hover:bg-white transition-all duration-200"
            >
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
                스킵
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Countdown overlay */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 z-30"
            >
              <motion.div
                key={countdown}
                initial={{ scale: 2.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-24 h-24 sm:w-28 sm:h-28 bg-clay-card rounded-3xl border-[3px] border-clay-border
                           flex items-center justify-center clay-shadow-lg"
              >
                <span className="text-5xl sm:text-6xl font-heading font-bold text-clay-text">
                  {countdown}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* "출발!" Go cue */}
        <AnimatePresence>
          {showGo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 z-30 pointer-events-none"
            >
              <motion.div
                initial={{ scale: 3, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, y: -30 }}
                transition={{ type: "spring", damping: 12, stiffness: 300 }}
                className="px-8 py-4 bg-clay-gold rounded-3xl border-[4px] border-clay-border clay-shadow-lg"
              >
                <span className="text-4xl sm:text-5xl font-heading font-bold text-clay-border tracking-wide">
                  출발!
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="shrink-0 flex justify-center gap-3 mt-2 sm:mt-3">
        {!isRacing && !raceState && countdown === null && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            whileTap={{ scale: 0.95, y: 2 }}
            onClick={startRace}
            className="py-3.5 px-8 bg-clay-success text-white font-heading font-bold
                       rounded-2xl text-lg border-[3px] border-clay-border/20
                       clay-shadow cursor-pointer
                       hover:brightness-95 transition-all duration-200"
          >
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              레이스 시작!
            </span>
          </motion.button>
        )}

        {!isRacing && raceState?.finished && (
          <>
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              whileTap={{ scale: 0.95, y: 2 }}
              onClick={handleRerace}
              className="py-3 px-5 sm:px-6 bg-[#74B9FF] text-white font-heading font-bold
                         rounded-2xl text-base border-[3px] border-clay-border/15
                         clay-shadow cursor-pointer
                         hover:brightness-95 transition-all duration-200"
            >
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                다시 레이스
              </span>
            </motion.button>
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.08 }}
              whileTap={{ scale: 0.95, y: 2 }}
              onClick={onReset}
              className="py-3 px-5 sm:px-6 bg-clay-lilac text-clay-text font-heading font-bold
                         rounded-2xl text-base border-[3px] border-clay-border/15
                         clay-shadow cursor-pointer
                         hover:brightness-95 transition-all duration-200"
            >
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
                참가자 변경
              </span>
            </motion.button>
          </>
        )}
      </div>

    </div>
  );
}
