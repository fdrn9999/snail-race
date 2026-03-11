"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onStart: (names: string[]) => void;
}

const SNAIL_TAG_COLORS = [
  "#FDBCB4", "#ADD8E6", "#98FF98", "#E6E6FA", "#FFEAA7",
  "#FF9ECD", "#FFB347", "#B5EAD7", "#C7CEEA", "#FFDAC1",
  "#E2F0CB", "#D4A5A5", "#9ED2C6", "#F3D1F4", "#FFE5B4",
];

/** 줄바꿈, 쉼표, 탭 등 다양한 구분자로 이름 분리 */
function parseNames(text: string): {
  names: string[];
  truncatedIndices: Set<number>;
} {
  const truncatedIndices = new Set<number>();
  const raw = text
    .split(/[\n,\t]+/)
    .map((n) => n.trim())
    .filter(Boolean);

  const names = raw.map((n, i) => {
    if (n.length > 8) {
      truncatedIndices.add(i);
      return n.slice(0, 8);
    }
    return n;
  });
  return { names, truncatedIndices };
}

export default function ParticipantInput({ onStart }: Props) {
  const [text, setText] = useState("");

  const { names, truncatedIndices } = parseNames(text);
  const validCount = Math.min(names.length, 15);

  function handleStart() {
    const finalNames = names.slice(0, 15);
    if (finalNames.length < 2) return;
    onStart(finalNames);
  }

  function handleShuffle() {
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    setText(shuffled.join("\n"));
  }

  function handleClear() {
    setText("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleStart();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-lg mx-auto pt-8 sm:pt-20"
    >
      <div className="bg-clay-card rounded-3xl p-6 sm:p-8 border-[3px] border-clay-border clay-shadow-lg">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-clay-text tracking-tight">
            달팽이 레이싱
          </h1>
          <p className="font-body text-clay-muted text-sm mt-2">
            참가자 이름을 입력하세요 (최대 15명, 8자 이내)
          </p>
          <p className="font-body text-clay-muted/60 text-xs mt-1">
            줄바꿈 / 쉼표 / 탭으로 구분 · Ctrl+Enter로 시작
          </p>
        </div>

        {/* Textarea */}
        <div className="relative">
          <label htmlFor="participant-input" className="sr-only">
            참가자 이름 입력
          </label>
          <textarea
            id="participant-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={"철수, 영희, 민수\n또는 한 줄에 한 명씩..."}
            className="w-full h-32 sm:h-48 p-4 pr-10 border-[3px] border-clay-border rounded-2xl text-base
                       font-body font-medium text-clay-text
                       focus:outline-none focus:ring-4 focus:ring-clay-accent/30 focus:border-clay-accent
                       resize-none bg-clay-lilac/20 placeholder-clay-muted/70
                       clay-shadow-inset transition-colors duration-200"
            spellCheck={false}
            aria-label="참가자 이름을 줄바꿈, 쉼표, 탭으로 구분하여 입력"
          />
          {/* Clear button */}
          {text.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center
                         rounded-full bg-clay-muted/15 text-clay-muted
                         hover:bg-clay-danger/20 hover:text-clay-danger
                         transition-colors duration-150 cursor-pointer"
              aria-label="입력 내용 전체 삭제"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          {/* Count indicator */}
          <span className="absolute bottom-3 right-3 text-xs font-body text-clay-muted/60">
            {validCount}/15명
          </span>
        </div>

        {/* Participant Tags */}
        {names.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex flex-wrap gap-2"
          >
            {names.slice(0, 15).map((name, i) => {
              const isTruncated = truncatedIndices.has(i);
              return (
                <motion.span
                  key={`${i}-${name}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5
                             text-clay-text rounded-xl text-sm font-body font-semibold
                             border-2 clay-shadow
                             ${isTruncated
                               ? "border-clay-danger/60"
                               : "border-clay-border/30"
                             }`}
                  style={{ backgroundColor: SNAIL_TAG_COLORS[i] }}
                >
                  <span className="text-base" role="img" aria-label="달팽이">🐌</span>
                  <span className="max-w-[100px] truncate">{name}</span>
                  {isTruncated && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-clay-danger shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="이름이 잘림">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  )}
                </motion.span>
              );
            })}
            {names.length > 15 && (
              <span className="text-clay-danger text-sm font-bold self-center font-body">
                +{names.length - 15}명 초과
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

        {/* Feedback messages */}
        <div className="mt-3 space-y-1 text-center">
          {truncatedIndices.size > 0 && (
            <p className="text-[#E17055] text-xs font-body font-semibold" role="alert">
              8자를 초과한 이름이 자동으로 잘렸습니다
            </p>
          )}
          {validCount < 2 && (
            <p className={`text-sm font-body font-bold ${validCount === 0 ? "text-clay-muted" : "text-clay-danger"}`}>
              {validCount === 0
                ? "최소 2명의 참가자를 입력해주세요"
                : "1명 더 입력해주세요!"}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
