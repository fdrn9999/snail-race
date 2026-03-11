"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { createRaceEngine, type RaceState } from "@/lib/raceEngine";

interface Props {
  participants: string[];
  onReset: () => void;
}

const SHELL_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FDCB6E", "#A29BFE",
  "#FF9ECD", "#6C5CE7", "#E17055", "#00B894", "#74B9FF",
];

const RACE_DURATION = 10000;

/* ── SVG Snail (cartoon) ── */
function SnailSvg({ shellColor, size = 40 }: { shellColor: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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

/** 참가자 수에 따라 레인 높이 계산 (px) */
function getLaneHeight(count: number, isDesktop: boolean): number {
  if (count <= 4) return isDesktop ? 80 : 68;
  if (count <= 6) return isDesktop ? 72 : 62;
  if (count <= 8) return isDesktop ? 64 : 54;
  return isDesktop ? 56 : 48; // 9-10명
}

export default function RaceTrack({ participants, onReset }: Props) {
  const [raceState, setRaceState] = useState<RaceState | null>(null);
  const [isRacing, setIsRacing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const engineRef = useRef<ReturnType<typeof createRaceEngine> | null>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const countIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  /** 각 달팽이의 DOM 요소에 직접 transform 적용 (성능 최적화) */
  const snailRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  /** 우승자 발표 시 자동 스크롤 */
  const scrollToResult = useCallback(() => {
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
  }, []);

  /** 레이스를 즉시 종료 (스킵) */
  const handleSkip = useCallback(() => {
    if (!engineRef.current || !isRacing) return;
    cancelAnimationFrame(animFrameRef.current);

    // 엔진을 끝까지 돌려서 최종 상태 확보
    const finalState = engineRef.current.update(RACE_DURATION + 100);
    setRaceState(finalState);
    setIsRacing(false);
    setTimeout(() => {
      setShowResult(true);
      fireConfetti();
      scrollToResult();
    }, 300);
  }, [isRacing, fireConfetti, scrollToResult]);

  const startRace = useCallback(() => {
    const winnerId = Math.floor(Math.random() * participants.length);

    const engine = createRaceEngine({
      totalDuration: RACE_DURATION,
      participantCount: participants.length,
      predeterminedWinner: winnerId,
    });

    engineRef.current = engine;
    snailRefs.current = new Array(participants.length).fill(null);
    setRaceState(null);
    setShowResult(false);

    setCountdown(3);
    let count = 3;

    countIntervalRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        setCountdown(null);
        if (countIntervalRef.current) clearInterval(countIntervalRef.current);
        setIsRacing(true);
        startTimeRef.current = performance.now();

        const animate = (timestamp: number) => {
          const elapsed = timestamp - startTimeRef.current;
          const state = engine.update(elapsed);

          // GPU 가속: DOM 직접 조작으로 translateX 적용
          const trackEl = trackRef.current;
          if (trackEl) {
            const trackWidth = trackEl.clientWidth;
            for (let i = 0; i < participants.length; i++) {
              const el = snailRefs.current[i];
              if (el) {
                const pxPos = (state.positions[i] / 100) * (trackWidth - 60);
                el.style.transform = `translateY(-50%) translateX(${pxPos}px)`;
              }
            }
          }

          setRaceState(state);

          if (!state.finished) {
            animFrameRef.current = requestAnimationFrame(animate);
          } else {
            setIsRacing(false);
            setTimeout(() => {
              setShowResult(true);
              fireConfetti();
              scrollToResult();
            }, 400);
          }
        };
        animFrameRef.current = requestAnimationFrame(animate);
      }
    }, 1000);
  }, [participants, fireConfetti, scrollToResult]);

  useEffect(() => cleanup, [cleanup]);

  const handleRerace = () => {
    cleanup();
    setRaceState(null);
    setShowResult(false);
    setIsRacing(false);
    setCountdown(null);
    setTimeout(() => startRace(), 80);
  };

  const winnerName =
    raceState && showResult ? participants[raceState.winnerId] : null;

  // 레인 높이 (참가자 수에 따라 유동)
  const laneHeightMobile = getLaneHeight(participants.length, false);
  const laneHeightDesktop = getLaneHeight(participants.length, true);
  const snailSize = participants.length >= 9 ? 32 : 38;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-6 sm:pt-10 pb-8">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-clay-text tracking-tight">
          달팽이 레이싱
        </h1>
        <p className="font-body text-clay-muted text-sm mt-1">
          {participants.length}명 참가
        </p>
      </div>

      {/* ══════ Race Track ══════ */}
      <div className="relative rounded-3xl border-[3px] border-clay-border clay-shadow-lg overflow-hidden">

        {/* Top rail — dark wood fence */}
        <div className="h-10 sm:h-12 bg-gradient-to-b from-[#5D4037] to-[#795548] flex items-center justify-between px-4 sm:px-6
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
        <div className="bg-[#4a8c3f]" ref={trackRef}>
          {participants.map((name, index) => {
            const isWinner = showResult && raceState?.winnerId === index;
            const isEven = index % 2 === 0;

            return (
              <div
                key={index}
                className="relative border-b-[2px] border-[#3d7233] last:border-b-0"
              >
                <div
                  className={`relative ${isEven ? "bg-[#5CA03A]" : "bg-[#4E9132]"}`}
                  style={{
                    height: `${laneHeightMobile}px`,
                  }}
                >
                  {/* Desktop height override via media query inline workaround */}
                  <style>{`@media(min-width:640px){[data-lane="${index}"]{height:${laneHeightDesktop}px!important}}`}</style>
                  <div data-lane={index} className="absolute inset-0" />

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

                  {/* ── SNAIL ── GPU accelerated with transform: translateX */}
                  <div
                    ref={(el) => { snailRefs.current[index] = el; }}
                    className="absolute top-1/2 left-[10px] z-20 will-change-transform"
                    style={{
                      transform: "translateY(-50%) translateX(0px)",
                    }}
                  >
                    {/* Slime trail */}
                    {isRacing && (raceState?.positions[index] || 0) > 2 && (
                      <div
                        className="absolute right-full top-1/2 -translate-y-1/2 h-[6px] rounded-full pointer-events-none opacity-40"
                        style={{
                          width: `${Math.min((raceState?.positions[index] || 0) * 0.6, 40)}px`,
                          background: "linear-gradient(90deg, transparent, #a8d97f)",
                        }}
                      />
                    )}

                    {/* Dust cloud particles */}
                    {isRacing && (raceState?.positions[index] || 0) > 3 && (
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 pointer-events-none">
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
                    )}

                    {/* Snail container */}
                    <div className={`relative flex items-center ${isWinner ? "animate-winner-bounce" : ""}`}>
                      <div className={`relative ${isWinner ? "animate-winner-glow rounded-2xl" : ""}`}>
                        <SnailSvg
                          shellColor={SHELL_COLORS[index % SHELL_COLORS.length]}
                          size={snailSize}
                        />
                      </div>
                      {/* Name tag */}
                      <div className={`absolute -top-5 left-1/2 -translate-x-1/2
                                       px-2 py-0.5 rounded-lg whitespace-nowrap
                                       font-heading font-bold text-[10px] sm:text-[11px]
                                       border-[2px] border-clay-border/30 shadow-sm
                                       ${isWinner
                                         ? "bg-clay-gold text-clay-border"
                                         : "bg-white/95 text-clay-text"
                                       }`}
                      >
                        <span className="max-w-[56px] sm:max-w-[80px] truncate inline-block">
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
        <div className="h-5 sm:h-6 bg-gradient-to-t from-[#5D4037] to-[#795548] border-t-[3px] border-[#3E2723]" />

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
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3 mt-6">
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

        {/* Skip button during race */}
        {isRacing && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3, duration: 0.3 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSkip}
            className="py-2.5 px-5 bg-clay-card text-clay-muted font-heading font-bold
                       rounded-2xl text-sm border-[3px] border-clay-border/15
                       clay-shadow cursor-pointer
                       hover:text-clay-text hover:brightness-95 transition-all duration-200"
          >
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="5 4 15 12 5 20 5 4" />
                <line x1="19" y1="5" x2="19" y2="19" />
              </svg>
              결과 바로보기
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

      {/* Winner announcement */}
      <AnimatePresence>
        {showResult && winnerName && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 32, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: "spring", damping: 18, stiffness: 200 }}
            className="mt-8 text-center pb-8"
          >
            <div className="inline-block bg-clay-card rounded-3xl p-6 sm:p-8 border-[3px] border-clay-border clay-shadow-lg">
              <div className="animate-trophy-pulse">
                <div className="mx-auto mb-3">
                  <SnailSvg
                    shellColor={SHELL_COLORS[raceState!.winnerId % SHELL_COLORS.length]}
                    size={72}
                  />
                </div>

                <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-clay-gold rounded-2xl border-[3px] border-clay-border/20
                                flex items-center justify-center clay-shadow mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 sm:w-8 sm:h-8 text-clay-border" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                  </svg>
                </div>

                <p className="font-heading text-lg sm:text-xl font-bold text-[#E17055] mb-1">
                  1등
                </p>
                <p className="font-heading text-3xl sm:text-5xl font-bold text-clay-text mb-2">
                  {winnerName}
                </p>
                <p className="font-body text-base sm:text-lg text-clay-muted font-semibold">
                  축하합니다!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
