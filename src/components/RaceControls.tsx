"use client";

import { motion } from "framer-motion";
import type { RaceState } from "@/lib/raceEngine";

interface Props {
  isRacing: boolean;
  countdown: number | null;
  raceState: RaceState | null;
  startRace: () => void;
  handleRerace: () => void;
  onReset: () => void;
}

export default function RaceControls({
  isRacing, countdown, raceState, startRace, handleRerace, onReset,
}: Props) {
  return (
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
  );
}
