"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { createRaceEngine, type RaceState } from "@/lib/raceEngine";
import SnailSvg from "./SnailSvg";
import RaceHeader from "./RaceHeader";
import RaceControls from "./RaceControls";

interface Props {
  participants: string[];
  onReset: () => void;
}

const SHELL_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FDCB6E", "#A29BFE",
  "#FF9ECD", "#6C5CE7", "#E17055", "#00B894", "#74B9FF",
  "#FD79A8", "#55E6C1", "#FDA7DF", "#F8C291", "#82CCDD",
];

const RACE_DURATION = 30000;

export default function RaceTrack({ participants, onReset }: Props) {
  const [raceState, setRaceState] = useState<RaceState | null>(null);
  const [isRacing, setIsRacing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showGo, setShowGo] = useState(false);

  // Hydration-safe: 기본값 false, 마운트 후 localStorage에서 읽기
  const [landscapeHintDismissed, setLandscapeHintDismissed] = useState(false);
  const [bgmMuted, setBgmMuted] = useState(false);

  useEffect(() => {
    setLandscapeHintDismissed(localStorage.getItem("snailrace-landscape-dismissed") === "1");
    setBgmMuted(localStorage.getItem("snailrace-bgm-muted") === "1");
  }, []);

  const engineRef = useRef<ReturnType<typeof createRaceEngine> | null>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastTimestamp = useRef<number>(0);
  const countIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const snailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slimeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dustRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sweatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const confettiFrameRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const prevFinishCountRef = useRef(0);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const bgmFadeRef = useRef<number>(0);

  const snailSize = participants.length >= 13 ? 22 : participants.length >= 11 ? 26 : participants.length >= 9 ? 28 : participants.length >= 7 ? 32 : 36;

  const stopBgm = useCallback(() => {
    cancelAnimationFrame(bgmFadeRef.current);
    const audio = bgmRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const fadeOutBgm = useCallback((durationMs: number) => {
    const audio = bgmRef.current;
    if (!audio) return;
    const startVol = audio.volume;
    const startTime = performance.now();
    const fade = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      audio.volume = Math.max(0, startVol * (1 - progress));
      if (progress < 1) {
        bgmFadeRef.current = requestAnimationFrame(fade);
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
    };
    bgmFadeRef.current = requestAnimationFrame(fade);
  }, []);

  const playBgm = useCallback(() => {
    stopBgm();
    if (bgmMuted) return;
    const audio = new Audio("/music/racing.mp3");
    audio.volume = 0.5;
    bgmRef.current = audio;
    audio.play().catch(() => {/* autoplay blocked — silent fail */});
  }, [stopBgm, bgmMuted]);

  const toggleBgm = useCallback(() => {
    setBgmMuted((prev) => {
      const next = !prev;
      localStorage.setItem("snailrace-bgm-muted", next ? "1" : "0");
      if (next) {
        const audio = bgmRef.current;
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      } else {
        if (isRacing) {
          const audio = new Audio("/music/racing.mp3");
          audio.volume = 0.5;
          bgmRef.current = audio;
          audio.play().catch(() => {});
        }
      }
      return next;
    });
  }, [isRacing]);

  const stopConfetti = useCallback(() => {
    cancelAnimationFrame(confettiFrameRef.current);
    confetti.reset();
  }, []);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (countIntervalRef.current) clearInterval(countIntervalRef.current);
    stopBgm();
    stopConfetti();
  }, [stopBgm, stopConfetti]);

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
      if (Date.now() < end) {
        confettiFrameRef.current = requestAnimationFrame(frame);
      }
    };
    confettiFrameRef.current = requestAnimationFrame(frame);
  }, []);

  const updateEffects = useCallback((positions: number[], leadPos: number) => {
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
      const sweatEl = sweatRefs.current[i];
      if (sweatEl) {
        const gap = leadPos - pos;
        sweatEl.style.display = gap > 15 && pos > 5 ? "block" : "none";
      }
    }
  }, []);

  const handleSkip = useCallback(() => {
    if (!engineRef.current || !isRacing) return;
    cancelAnimationFrame(animFrameRef.current);
    fadeOutBgm(400);

    const engine = engineRef.current;
    const state = engine.skipToEnd();

    const trackEl = trackRef.current;
    if (!trackEl) return;

    const tw = trackEl.clientWidth;
    const startPositions = participants.map((_, i) => {
      const el = snailRefs.current[i];
      if (!el) return 0;
      const match = el.style.transform.match(/translateX\(([\d.]+)px\)/);
      return match ? parseFloat(match[1]) : 0;
    });
    const endPositions = participants.map((_, i) => (state.positions[i] / 100) * (tw - 60));

    const skipStart = performance.now();
    const SKIP_DURATION = 400;

    const skipAnimate = (now: number) => {
      const t = Math.min((now - skipStart) / SKIP_DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      for (let i = 0; i < participants.length; i++) {
        const el = snailRefs.current[i];
        if (el) {
          const px = startPositions[i] + (endPositions[i] - startPositions[i]) * eased;
          el.style.transform = `translateY(-50%) translateX(${px}px)`;
          const finishRank = state.finishOrder.indexOf(i);
          el.style.zIndex = `${200 - finishRank}`;
        }
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(skipAnimate);
      } else {
        for (let i = 0; i < participants.length; i++) {
          const slimeEl = slimeRefs.current[i];
          if (slimeEl) slimeEl.style.display = "none";
          const dustEl = dustRefs.current[i];
          if (dustEl) dustEl.style.display = "none";
          const sweatEl = sweatRefs.current[i];
          if (sweatEl) sweatEl.style.display = "none";
        }
        setRaceState(engine.snapshot());
        setIsRacing(false);
        setTimeout(() => fireConfetti(), 200);
      }
    };
    animFrameRef.current = requestAnimationFrame(skipAnimate);
  }, [isRacing, fireConfetti, fadeOutBgm, participants]);

  const startRace = useCallback(() => {
    const winnerId = Math.floor(Math.random() * participants.length);

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
    sweatRefs.current = new Array(participants.length).fill(null);
    frameCountRef.current = 0;
    prevFinishCountRef.current = 0;
    setRaceState(null);

    setCountdown(3);
    playBgm();
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
                const finishRank = state.finishOrder.indexOf(i);
                el.style.zIndex = finishRank >= 0
                  ? `${200 - finishRank}`
                  : `${20 + Math.round(state.positions[i])}`;
              }
            }
          }

          const leadPos = Math.max(...state.positions);
          updateEffects(state.positions, leadPos);

          frameCountRef.current++;
          const finishChanged = state.finishOrder.length !== prevFinishCountRef.current;
          if (finishChanged || frameCountRef.current % 12 === 0 || state.finished) {
            prevFinishCountRef.current = state.finishOrder.length;
            setRaceState(engine.snapshot());
          }

          const remaining = RACE_DURATION - elapsed;
          if (remaining <= 2000 && bgmRef.current && bgmRef.current.volume > 0.01) {
            const ratio = Math.max(0, remaining / 2000);
            bgmRef.current.volume = 0.5 * ratio;
          }

          if (!state.finished) {
            animFrameRef.current = requestAnimationFrame(animate);
          } else {
            setIsRacing(false);
            stopBgm();
            for (let i = 0; i < participants.length; i++) {
              const slimeEl = slimeRefs.current[i];
              if (slimeEl) slimeEl.style.display = "none";
              const dustEl = dustRefs.current[i];
              if (dustEl) dustEl.style.display = "none";
              const sweatEl = sweatRefs.current[i];
              if (sweatEl) sweatEl.style.display = "none";
            }
            setTimeout(() => fireConfetti(), 400);
          }
        };
        animFrameRef.current = requestAnimationFrame(animate);
      }
    }, 1000);
  }, [participants, fireConfetti, updateEffects, playBgm, stopBgm]);

  useEffect(() => cleanup, [cleanup]);

  // BGM 탭 전환 싱크
  useEffect(() => {
    const handleVisibility = () => {
      const audio = bgmRef.current;
      if (!audio) return;
      if (document.hidden) {
        if (!audio.paused) audio.pause();
      } else {
        if (isRacing && !bgmMuted && audio.paused && audio.currentTime > 0) {
          audio.play().catch(() => {});
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isRacing, bgmMuted]);

  const handleRerace = () => {
    cleanup();
    const trackEl = trackRef.current;
    if (trackEl) {
      for (let i = 0; i < participants.length; i++) {
        const el = snailRefs.current[i];
        if (el) el.style.transform = "translateY(-50%) translateX(0px)";
      }
    }
    setRaceState(null);
    setIsRacing(false);
    setCountdown(null);
    setShowGo(false);
    queueMicrotask(() => startRace());
  };

  const finishOrder = raceState?.finishOrder || [];
  const raceFinished = !!raceState?.finished;

  // 실시간 순위
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

      {/* Mobile landscape hint */}
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

      <RaceHeader
        participants={participants}
        isRacing={isRacing}
        countdown={countdown}
        raceFinished={raceFinished}
        raceState={raceState}
        bgmMuted={bgmMuted}
        toggleBgm={toggleBgm}
        liveRankings={liveRankings}
        finishOrder={finishOrder}
      />

      {/* ══════ Race Track ══════ */}
      <div className="flex-1 min-h-0 relative rounded-3xl border-[3px] border-clay-border clay-shadow-lg overflow-hidden flex flex-col">

        {/* Top rail */}
        <div className="shrink-0 h-10 sm:h-12 bg-gradient-to-b from-[#5D4037] to-[#795548] flex items-center justify-between px-4 sm:px-6
                        border-b-[3px] border-[#3E2723] relative overflow-hidden">
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

        {/* Lanes */}
        <div
          className="bg-[#4a8c3f] flex-1 min-h-0 flex flex-col"
          ref={trackRef}
        >
          {participants.map((name, index) => {
            const isWinner = raceFinished && raceState?.winnerId === index;
            const finishRank = raceFinished ? (raceState?.finishOrder.indexOf(index) ?? -1) : -1;
            const is2nd = raceFinished && finishRank === 1;
            const is3rd = raceFinished && finishRank === 2;
            const isEven = index % 2 === 0;
            const currentPos = raceState?.positions[index] ?? 0;
            const nearFinish = currentPos >= 85 || finishRank >= 0;

            return (
              <div
                key={index}
                className="relative border-b-[2px] border-[#3d7233] last:border-b-0 flex-1 min-h-0 max-h-[52px]"
              >
                <div className={`relative h-full ${isEven ? "bg-[#5CA03A]" : "bg-[#4E9132]"}`}>

                  {/* Grass tufts */}
                  <div className="absolute bottom-0 inset-x-0 pointer-events-none" aria-hidden="true">
                    {[8, 22, 38, 55, 68, 82, 93].map((leftPct, j) => (
                      <svg key={j} className="absolute bottom-0 w-3 h-3 text-[#3d7a28] opacity-50"
                           style={{ left: `${leftPct}%` }} viewBox="0 0 12 12" fill="currentColor">
                        <path d="M2 12 L4 5 L6 12 M5 12 L7 3 L9 12 M8 12 L10 6 L12 12" stroke="currentColor" strokeWidth="1" fill="none" />
                      </svg>
                    ))}
                  </div>

                  {/* Dirt track */}
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

                  {/* Lane number */}
                  <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20
                                  w-7 h-7 sm:w-8 sm:h-8
                                  bg-white rounded-full flex items-center justify-center
                                  border-[2.5px] border-clay-border shadow-md">
                    <span className="text-clay-border text-[11px] sm:text-xs font-heading font-bold">
                      {index + 1}
                    </span>
                  </div>

                  {/* Finish line */}
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

                  {/* ── SNAIL ── */}
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

                    {/* 땀방울 */}
                    <div
                      ref={(el) => { sweatRefs.current[index] = el; }}
                      className="absolute -top-1 right-0 pointer-events-none"
                      style={{ display: "none" }}
                    >
                      {[0, 1].map((d) => (
                        <span
                          key={d}
                          className="absolute animate-sweat"
                          style={{
                            animationDelay: `${d * 0.35}s`,
                            animationIterationCount: "infinite",
                            left: `${d * 8}px`,
                            top: `${d * 2}px`,
                            width: "4px",
                            height: "6px",
                            borderRadius: "50% 50% 50% 50% / 30% 30% 70% 70%",
                            backgroundColor: "#74B9FF",
                            opacity: 0.7,
                          }}
                        />
                      ))}
                    </div>

                    <div className={`relative flex items-center ${isWinner ? "animate-winner-bounce" : ""}`}>
                      <div className={`relative ${
                        isWinner ? "animate-winner-glow rounded-2xl"
                        : is2nd ? "animate-silver-glow rounded-2xl"
                        : is3rd ? "animate-bronze-glow rounded-2xl"
                        : ""
                      } ${isRacing ? "animate-snail-crawl" : ""}`}>
                        <SnailSvg
                          shellColor={SHELL_COLORS[index % SHELL_COLORS.length]}
                          size={snailSize}
                        />
                      </div>
                      {/* Name tag — right side (default) */}
                      <div className={`absolute whitespace-nowrap
                                       px-2 py-0.5 rounded-lg
                                       font-heading font-bold
                                       border-[2px] shadow-sm
                                       left-full top-1/2 -translate-y-1/2 ml-1
                                       transition-opacity duration-300
                                       ${nearFinish ? "opacity-0 pointer-events-none" : "opacity-100"}
                                       ${isWinner
                                         ? "bg-clay-gold text-clay-border border-clay-gold/60"
                                         : is2nd
                                           ? "bg-gray-200 text-clay-border border-gray-300/60"
                                           : is3rd
                                             ? "bg-orange-200 text-clay-border border-orange-300/60"
                                             : "bg-white/95 text-clay-text border-clay-border/30"
                                       }
                                       ${participants.length >= 11
                                         ? "text-[8px] sm:text-[10px]"
                                         : "text-[10px] sm:text-[11px]"
                                       }`}
                      >
                        {is2nd && <span className="mr-0.5 text-[9px]">🥈</span>}
                        {is3rd && <span className="mr-0.5 text-[9px]">🥉</span>}
                        <span className={`truncate inline-block
                          ${participants.length >= 11
                            ? "max-w-[72px] sm:max-w-[100px]"
                            : "max-w-[88px] sm:max-w-[120px]"
                          }`}>
                          {name}
                        </span>
                      </div>
                      {/* Name tag — left side (near finish) */}
                      <div className={`absolute whitespace-nowrap
                                       px-2 py-0.5 rounded-lg
                                       font-heading font-bold
                                       border-[2px] shadow-sm
                                       right-full top-1/2 -translate-y-1/2 mr-1
                                       transition-opacity duration-300
                                       ${nearFinish ? "opacity-100" : "opacity-0 pointer-events-none"}
                                       ${isWinner
                                         ? "bg-clay-gold text-clay-border border-clay-gold/60"
                                         : is2nd
                                           ? "bg-gray-200 text-clay-border border-gray-300/60"
                                           : is3rd
                                             ? "bg-orange-200 text-clay-border border-orange-300/60"
                                             : "bg-white/95 text-clay-text border-clay-border/30"
                                       }
                                       ${participants.length >= 11
                                         ? "text-[8px] sm:text-[10px]"
                                         : "text-[10px] sm:text-[11px]"
                                       }`}
                      >
                        {is2nd && <span className="mr-0.5 text-[9px]">🥈</span>}
                        {is3rd && <span className="mr-0.5 text-[9px]">🥉</span>}
                        <span className={`truncate inline-block
                          ${participants.length >= 11
                            ? "max-w-[72px] sm:max-w-[100px]"
                            : "max-w-[88px] sm:max-w-[120px]"
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
              className="absolute top-12 sm:top-14 left-2 sm:left-3 z-25
                         py-1.5 px-3 bg-clay-card text-clay-text font-heading font-bold
                         rounded-xl text-xs border-[3px] border-clay-border
                         clay-shadow cursor-pointer
                         hover:brightness-95 transition-all duration-200"
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

        {/* Controls overlay (inside track) */}
        <AnimatePresence>
          {((!isRacing && !raceState && countdown === null) || (!isRacing && raceState?.finished)) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center z-30 bg-black/30 backdrop-blur-[2px]"
            >
              <RaceControls
                isRacing={isRacing}
                countdown={countdown}
                raceState={raceState}
                startRace={startRace}
                handleRerace={handleRerace}
                onReset={onReset}
                participants={participants}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
