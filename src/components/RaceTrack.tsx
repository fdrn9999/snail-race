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
  "#FD79A8", "#55E6C1", "#FDA7DF", "#F8C291", "#82CCDD",
];

const RACE_DURATION = 10000;

/* ── SVG Snail (cartoon) ── */
function SnailSvg({ shellColor, size = 40 }: { shellColor: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scaleX(-1)" }} aria-hidden="true">
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

/** 참가자 수에 따라 레인 높이 계산 (px) — mobile / desktop */
function getLaneHeights(count: number): [number, number] {
  if (count <= 4) return [60, 76];
  if (count <= 6) return [52, 66];
  if (count <= 8) return [46, 58];
  if (count <= 10) return [42, 52];
  if (count <= 12) return [38, 46];
  return [34, 42]; // 13-15명
}

export default function RaceTrack({ participants, onReset }: Props) {
  const [raceState, setRaceState] = useState<RaceState | null>(null);
  const [isRacing, setIsRacing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultMinimized, setResultMinimized] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showGo, setShowGo] = useState(false);
  const engineRef = useRef<ReturnType<typeof createRaceEngine> | null>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastTimestamp = useRef<number>(0);
  const countIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const snailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slimeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dustRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameCountRef = useRef(0);
  const prevFinishCountRef = useRef(0);

  // CSS-only 반응형 레인 높이 (Layout Shift 방지)
  const [laneHeightMobile, laneHeightDesktop] = getLaneHeights(participants.length);
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

    let t = lastTimestamp.current;
    let state = engineRef.current.update(t);
    while (!state.finished) {
      t += 16.67;
      state = engineRef.current.update(t);
    }

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
    for (let i = 0; i < participants.length; i++) {
      const slimeEl = slimeRefs.current[i];
      if (slimeEl) slimeEl.style.display = "none";
      const dustEl = dustRefs.current[i];
      if (dustEl) dustEl.style.display = "none";
    }

    setRaceState(state);
    setIsRacing(false);
    setTimeout(() => {
      setShowResult(true);
      setResultMinimized(false);
      fireConfetti();
    }, 300);
  }, [isRacing, fireConfetti, participants.length]);

  const startRace = useCallback(() => {
    const winnerId = Math.floor(Math.random() * participants.length);

    const engine = createRaceEngine({
      totalDuration: RACE_DURATION,
      participantCount: participants.length,
      predeterminedWinner: winnerId,
    });

    engineRef.current = engine;
    snailRefs.current = new Array(participants.length).fill(null);
    slimeRefs.current = new Array(participants.length).fill(null);
    dustRefs.current = new Array(participants.length).fill(null);
    frameCountRef.current = 0;
    prevFinishCountRef.current = 0;
    setRaceState(null);
    setShowResult(false);
    setResultMinimized(false);

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
          const elapsed = timestamp - startTimeRef.current;
          lastTimestamp.current = elapsed;
          const state = engine.update(elapsed);

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

          updateEffects(state.positions);

          frameCountRef.current++;
          const finishChanged = state.finishOrder.length !== prevFinishCountRef.current;
          if (finishChanged || frameCountRef.current % 5 === 0 || state.finished) {
            prevFinishCountRef.current = state.finishOrder.length;
            setRaceState(state);
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
            setTimeout(() => {
              setShowResult(true);
              setResultMinimized(false);
              fireConfetti();
            }, 400);
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
    setShowResult(false);
    setResultMinimized(false);
    setIsRacing(false);
    setCountdown(null);
    setShowGo(false);
    setTimeout(() => startRace(), 80);
  };

  const winnerName =
    raceState && showResult ? participants[raceState.winnerId] : null;
  const rankings = raceState?.finishOrder || [];

  // 실시간 도착 피드 (트랙 내부 플로팅 — 최근 3명만 표시)
  const liveFinishers = raceState?.finishOrder || [];
  const recentFinishers = liveFinishers.slice(-3);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-6 sm:pt-10 pb-8">
      {/* CSS-only 반응형 레인 높이 (hydration-safe) */}
      <style>{`.race-lane{height:${laneHeightMobile}px}@media(min-width:640px){.race-lane{height:${laneHeightDesktop}px}}`}</style>

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
                  className={`race-lane relative ${isEven ? "bg-[#5CA03A]" : "bg-[#4E9132]"}`}
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
                      <div className={`absolute -top-5 left-1/2 -translate-x-1/2
                                       px-2 py-0.5 rounded-lg whitespace-nowrap
                                       font-heading font-bold text-[10px] sm:text-[11px]
                                       border-[2px] border-clay-border/30 shadow-sm
                                       ${isWinner
                                         ? "bg-clay-gold text-clay-border"
                                         : "bg-white/95 text-clay-text"
                                       }`}
                      >
                        <span className="max-w-[72px] sm:max-w-[96px] truncate inline-block text-[9px] sm:text-[11px]">
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

        {/* ═══ Floating Live Ticker (inside track) ═══ */}
        <AnimatePresence>
          {!showResult && raceState && recentFinishers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-8 sm:bottom-9 left-2 sm:left-3 z-20 pointer-events-none"
            >
              <div className="flex flex-col gap-1">
                {recentFinishers.map((participantIdx) => {
                  const rank = liveFinishers.indexOf(participantIdx);
                  const name = participants[participantIdx];
                  const medal = rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : null;
                  const isFirst = rank === 0;

                  return (
                    <motion.div
                      key={`ticker-${participantIdx}`}
                      initial={{ opacity: 0, x: -20, scale: 0.85 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ type: "spring", damping: 20, stiffness: 300 }}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg backdrop-blur-md
                        ${isFirst
                          ? "bg-clay-gold/80 border border-clay-border/20"
                          : "bg-white/75 border border-clay-border/10"
                        }`}
                    >
                      <span className="font-heading font-bold text-[10px] text-clay-border">
                        {medal || `${rank + 1}등`}
                      </span>
                      <span className="font-heading font-bold text-[10px] sm:text-[11px] text-clay-text truncate max-w-[60px] sm:max-w-[80px]">
                        {name}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip button */}
        <AnimatePresence>
          {isRacing && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 3, duration: 0.3 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSkip}
              className="absolute top-12 sm:top-14 right-2 sm:right-3 z-25
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

      {/* Full rankings */}
      <AnimatePresence>
        {showResult && winnerName && rankings.length > 0 && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 32, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: "spring", damping: 18, stiffness: 200 }}
            className="mt-8 pb-8 max-w-md mx-auto"
          >
            <div className="bg-clay-card rounded-3xl border-[3px] border-clay-border clay-shadow-lg overflow-hidden">
              {/* Minimize/Expand header */}
              <button
                type="button"
                onClick={() => setResultMinimized((v) => !v)}
                className="w-full flex items-center justify-between px-5 sm:px-7 py-3
                           bg-clay-gold/20 hover:bg-clay-gold/30 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2 font-heading font-bold text-clay-text text-sm">
                  <span>🏆</span>
                  <span>{winnerName}</span>
                  <span className="text-clay-muted font-body text-xs font-semibold">1등!</span>
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-5 h-5 text-clay-muted transition-transform duration-200 ${resultMinimized ? "" : "rotate-180"}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Collapsible content */}
              <AnimatePresence initial={false}>
                {!resultMinimized && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 sm:p-7 pt-3">
                      {/* Winner hero */}
                      <div className="text-center mb-5 animate-trophy-pulse">
                        <div className="mx-auto mb-2">
                          <SnailSvg
                            shellColor={SHELL_COLORS[raceState!.winnerId % SHELL_COLORS.length]}
                            size={64}
                          />
                        </div>
                        <div className="mx-auto w-12 h-12 bg-clay-gold rounded-xl border-[3px] border-clay-border/20
                                        flex items-center justify-center clay-shadow mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-clay-border" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                            <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                          </svg>
                        </div>
                        <p className="font-heading text-2xl sm:text-3xl font-bold text-clay-text">
                          {winnerName}
                        </p>
                        <p className="font-body text-sm text-clay-muted font-semibold mt-0.5">
                          축하합니다!
                        </p>
                      </div>

                      <div className="h-[2px] bg-clay-border/10 rounded-full mb-4" />

                      {/* Full ranking list */}
                      <div className="space-y-1.5">
                        {rankings.map((participantIdx, rank) => {
                          const name = participants[participantIdx];
                          const isFirst = rank === 0;
                          const isLast = rank === rankings.length - 1;
                          const medal = rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : null;

                          return (
                            <motion.div
                              key={participantIdx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: rank * 0.06, duration: 0.25 }}
                              className={`flex items-center gap-3 px-3 py-2 rounded-xl border-2 transition-colors
                                ${isFirst
                                  ? "bg-clay-gold/30 border-clay-gold"
                                  : isLast
                                    ? "bg-clay-peach/20 border-clay-peach/40"
                                    : "bg-clay-lilac/15 border-transparent"
                                }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                               font-heading font-bold text-sm border-2
                                ${isFirst
                                  ? "bg-clay-gold border-clay-border/20 text-clay-border"
                                  : rank <= 2
                                    ? "bg-white border-clay-border/15 text-clay-text"
                                    : "bg-clay-bg border-clay-border/10 text-clay-muted"
                                }`}>
                                {medal || `${rank + 1}`}
                              </div>
                              <SnailSvg
                                shellColor={SHELL_COLORS[participantIdx % SHELL_COLORS.length]}
                                size={28}
                              />
                              <span className={`font-heading font-bold truncate
                                ${isFirst
                                  ? "text-base text-clay-text"
                                  : "text-sm text-clay-text/80"
                                }`}>
                                {name}
                              </span>
                              <span className={`ml-auto shrink-0 font-body text-xs font-semibold
                                ${isFirst ? "text-[#E17055]" : "text-clay-muted/60"}`}>
                                {rank + 1}등
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
