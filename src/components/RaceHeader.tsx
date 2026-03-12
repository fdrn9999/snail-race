"use client";

import Image from "next/image";
import type { RaceState } from "@/lib/raceEngine";

interface Props {
  participants: string[];
  isRacing: boolean;
  countdown: number | null;
  raceFinished: boolean;
  raceState: RaceState | null;
}

export default function RaceHeader({
  participants, isRacing, countdown, raceFinished, raceState,
}: Props) {
  return (
    <div className="shrink-0 mb-1 sm:mb-2">
      {/* Full title: before race */}
      {!isRacing && countdown === null && !raceFinished && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Image src="/logo.svg" alt="" width={36} height={36} aria-hidden="true" />
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-clay-text tracking-tight">
              달팽이 레이싱
            </h1>
          </div>
          <p className="font-body text-clay-muted text-sm mt-1">
            {participants.length}명 참가
          </p>
        </div>
      )}

      {/* Compact title: countdown/racing/finished */}
      {(countdown !== null || isRacing || raceFinished) && (
        <div className="flex items-center justify-center gap-2">
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
        </div>
      )}
    </div>
  );
}
