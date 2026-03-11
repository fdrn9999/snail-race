"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onStart: (names: string[]) => void;
}

const SNAIL_TAG_COLORS = [
  "bg-clay-peach",
  "bg-clay-blue",
  "bg-clay-mint",
  "bg-clay-lilac",
  "bg-clay-yellow",
  "bg-clay-pink",
  "bg-clay-peach",
  "bg-clay-blue",
  "bg-clay-mint",
  "bg-clay-lilac",
];

export default function ParticipantInput({ onStart }: Props) {
  const [text, setText] = useState("");

  const names = text
    .split("\n")
    .map((n) => n.trim())
    .filter(Boolean);
  const validCount = Math.min(names.length, 10);

  function handleStart() {
    const finalNames = names.slice(0, 10);
    if (finalNames.length < 2) return;
    onStart(finalNames);
  }

  function handleShuffle() {
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    setText(shuffled.join("\n"));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-lg mx-auto pt-12 sm:pt-20"
    >
      <div className="bg-clay-card rounded-3xl p-6 sm:p-8 border-[3px] border-clay-border clay-shadow-lg">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-clay-text tracking-tight">
            달팽이 레이싱
          </h1>
          <p className="font-body text-clay-muted text-sm mt-2">
            참가자 이름을 입력하세요 (한 줄에 한 명, 최대 10명)
          </p>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"참가자1\n참가자2\n참가자3\n..."}
            className="w-full h-48 p-4 border-[3px] border-clay-border rounded-2xl text-base
                       font-body font-medium text-clay-text
                       focus:outline-none focus:ring-4 focus:ring-clay-accent/30 focus:border-clay-accent
                       resize-none bg-clay-lilac/20 placeholder-clay-muted/40
                       clay-shadow-inset transition-colors duration-200"
            spellCheck={false}
          />
          {/* Character count indicator */}
          <span className="absolute bottom-3 right-3 text-xs font-body text-clay-muted/60">
            {validCount}/10명
          </span>
        </div>

        {/* Participant Tags */}
        {names.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex flex-wrap gap-2"
          >
            {names.slice(0, 10).map((name, i) => (
              <motion.span
                key={`${i}-${name}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5
                           ${SNAIL_TAG_COLORS[i]}
                           text-clay-text rounded-xl text-sm font-body font-semibold
                           border-2 border-clay-border/30 clay-shadow`}
              >
                <span className="text-base" role="img" aria-label="달팽이">🐌</span>
                <span className="max-w-[100px] truncate">{name}</span>
              </motion.span>
            ))}
            {names.length > 10 && (
              <span className="text-clay-danger text-sm font-bold self-center font-body">
                +{names.length - 10}명 초과
              </span>
            )}
          </motion.div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleShuffle}
            disabled={names.length < 2}
            className="flex-1 py-3 px-4 bg-clay-lilac text-clay-text font-heading font-bold
                       rounded-2xl text-base border-[3px] border-clay-border/30
                       clay-shadow cursor-pointer
                       hover:brightness-95 active:clay-shadow-pressed active:translate-y-[2px]
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100
                       transition-all duration-200"
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
              섞기
            </span>
          </button>

          <button
            onClick={handleStart}
            disabled={validCount < 2}
            className="flex-[2] py-3 px-6 bg-clay-success text-white font-heading font-bold
                       rounded-2xl text-lg border-[3px] border-clay-border/20
                       clay-shadow cursor-pointer
                       hover:brightness-95 active:clay-shadow-pressed active:translate-y-[2px]
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100
                       transition-all duration-200"
          >
            <span className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              레이스 시작! ({validCount}명)
            </span>
          </button>
        </div>

        {validCount > 0 && validCount < 2 && (
          <p className="text-clay-danger text-sm mt-3 text-center font-body font-bold" role="alert">
            최소 2명 이상 입력해주세요!
          </p>
        )}
      </div>
    </motion.div>
  );
}
