"use client";

import { motion } from "framer-motion";
import type { RaceState } from "@/lib/raceEngine";
import SnailSvg from "./SnailSvg";

const SHELL_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FDCB6E", "#A29BFE",
  "#FF9ECD", "#6C5CE7", "#E17055", "#00B894", "#74B9FF",
  "#FD79A8", "#55E6C1", "#FDA7DF", "#F8C291", "#82CCDD",
];

const MEDALS = ["🥇", "🥈", "🥉"];

interface Props {
  isRacing: boolean;
  countdown: number | null;
  raceState: RaceState | null;
  startRace: () => void;
  handleRerace: () => void;
  onReset: () => void;
  participants?: string[];
}

export default function RaceControls({
  isRacing, countdown, raceState, startRace, handleRerace, onReset, participants,
}: Props) {
  const finishOrder = raceState?.finishOrder ?? [];

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">

      {/* Result board — compact podium + rest */}
      {!isRacing && raceState?.finished && participants && finishOrder.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-[#2D3436]/85 backdrop-blur-sm rounded-2xl border-2 border-white/10
                     px-3 sm:px-4 pt-2.5 pb-2 z-40 relative
                     flex flex-col items-center gap-2 min-w-[200px] sm:min-w-[260px]"
        >
          {/* Mini podium — top 3 inline */}
          <div className="flex items-end gap-1.5 sm:gap-2">
            {/* 2nd */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="flex flex-col items-center px-2 pt-1 pb-1
                         bg-white/10 rounded-xl border border-white/15"
            >
              <span className="text-sm leading-none">{MEDALS[1]}</span>
              <SnailSvg shellColor={SHELL_COLORS[finishOrder[1] % SHELL_COLORS.length]} size={20} />
              <span className="font-heading font-bold text-[9px] sm:text-[10px] text-white/90
                               max-w-[48px] sm:max-w-[64px] truncate">
                {participants[finishOrder[1]]}
              </span>
            </motion.div>

            {/* 1st */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05, duration: 0.3 }}
              className="flex flex-col items-center px-2.5 pt-1 pb-1
                         bg-clay-gold/25 rounded-xl border border-clay-gold/40 -mt-1"
            >
              <span className="text-base leading-none">{MEDALS[0]}</span>
              <SnailSvg shellColor={SHELL_COLORS[finishOrder[0] % SHELL_COLORS.length]} size={24} />
              <span className="font-heading font-bold text-[10px] sm:text-xs text-white
                               max-w-[56px] sm:max-w-[72px] truncate">
                {participants[finishOrder[0]]}
              </span>
            </motion.div>

            {/* 3rd */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className="flex flex-col items-center px-2 pt-1 pb-1
                         bg-white/10 rounded-xl border border-white/15"
            >
              <span className="text-sm leading-none">{MEDALS[2]}</span>
              <SnailSvg shellColor={SHELL_COLORS[finishOrder[2] % SHELL_COLORS.length]} size={20} />
              <span className="font-heading font-bold text-[9px] sm:text-[10px] text-white/90
                               max-w-[48px] sm:max-w-[64px] truncate">
                {participants[finishOrder[2]]}
              </span>
            </motion.div>
          </div>

          {/* 4th ~ last */}
          {finishOrder.length > 3 && (
            <div className="flex flex-wrap justify-center gap-x-2.5 gap-y-0.5 px-1">
              {finishOrder.slice(3).map((pIdx, i) => (
                <span
                  key={pIdx}
                  className="inline-flex items-center gap-1 font-body text-[10px] sm:text-[11px]"
                >
                  <span className="font-heading font-bold text-white/50 w-3.5 text-right text-[9px]">{i + 4}</span>
                  <span className="text-white/80 truncate max-w-[52px] sm:max-w-[68px]">{participants[pIdx]}</span>
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Buttons */}
      <div className="flex justify-center gap-3 sm:gap-4">
        {!isRacing && !raceState && countdown === null && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95, y: 2 }}
            onClick={startRace}
            className="py-3.5 px-8 bg-clay-gold text-clay-border font-heading font-bold
                       rounded-2xl text-lg border-[3px] border-clay-border
                       clay-shadow cursor-pointer
                       hover:brightness-105 transition-all duration-200"
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
              transition={{ duration: 0.3, delay: 0.3 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95, y: 2 }}
              onClick={handleRerace}
              className="py-2.5 px-4 sm:px-5 bg-clay-gold text-clay-border font-heading font-bold
                         rounded-2xl text-sm sm:text-base border-[3px] border-clay-border
                         clay-shadow cursor-pointer
                         hover:brightness-105 transition-all duration-200"
            >
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                다시 레이스
              </span>
            </motion.button>
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.38 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95, y: 2 }}
              onClick={onReset}
              className="py-2.5 px-4 sm:px-5 bg-clay-card text-clay-text font-heading font-bold
                         rounded-2xl text-sm sm:text-base border-[3px] border-clay-border
                         clay-shadow cursor-pointer
                         hover:brightness-95 transition-all duration-200"
            >
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
