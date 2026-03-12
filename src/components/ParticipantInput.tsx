"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Props {
  onStart: (names: string[]) => void;
}

const SNAIL_TAG_COLORS = [
  "#FDBCB4", "#ADD8E6", "#98FF98", "#E6E6FA", "#FFEAA7",
  "#FF9ECD", "#FFB347", "#B5EAD7", "#C7CEEA", "#FFDAC1",
  "#E2F0CB", "#D4A5A5", "#9ED2C6", "#F3D1F4", "#FFE5B4",
];

/** 줄바꿈, 쉼표, 탭 등 다양한 구분자로 이름 분리 (원본 유지) */
function parseNames(text: string): {
  names: string[];
  displayNames: string[];
  tooLongIndices: Set<number>;
} {
  const tooLongIndices = new Set<number>();
  const names = text
    .split(/[\n,\t]+/)
    .map((n) => n.trim())
    .filter(Boolean);

  names.forEach((n, i) => {
    if (n.length > 8) tooLongIndices.add(i);
  });

  // 동명이인 구별: 철수, 철수 → 철수(1), 철수(2)
  const nameCount = new Map<string, number>();
  for (const n of names) {
    nameCount.set(n, (nameCount.get(n) || 0) + 1);
  }
  const nameIndex = new Map<string, number>();
  const displayNames = names.map((name) => {
    if ((nameCount.get(name) || 0) <= 1) return name;
    const idx = (nameIndex.get(name) || 0) + 1;
    nameIndex.set(name, idx);
    return `${name}(${idx})`;
  });

  return { names, displayNames, tooLongIndices };
}

const LS_KEY = "snailrace-participants";

export default function ParticipantInput({ onStart }: Props) {
  const [text, setText] = useState("");
  const [shaking, setShaking] = useState(false);
  const [truncateToast, setTruncateToast] = useState(false);
  const prevTooLongCount = useRef(0);

  // Req 5: localStorage에서 이전 참가자 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setText(saved);
  }, []);

  const { names, displayNames, tooLongIndices } = parseNames(text);
  const validCount = Math.min(names.length, 15);
  const hasTooLong = tooLongIndices.size > 0;
  const hasExcess = names.length > 15;
  const canStart = validCount >= 2 && !hasExcess;

  // 초과 이름이 새로 생기면 shake 트리거
  useEffect(() => {
    if (tooLongIndices.size > prevTooLongCount.current) {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), 400);
      return () => clearTimeout(timer);
    }
    prevTooLongCount.current = tooLongIndices.size;
  }, [tooLongIndices.size]);

  function handleStart() {
    if (!canStart) return;

    let processedText = text;
    // 8자 초과 이름 자동 절삭
    if (hasTooLong) {
      const tokens = processedText.split(/([\n,\t]+)/);
      processedText = tokens.map((token, i) => {
        if (i % 2 === 1) return token; // 구분자
        const trimmed = token.trim();
        if (trimmed.length > 8) {
          const leading = token.match(/^\s*/)?.[0] || "";
          const trailing = token.match(/\s*$/)?.[0] || "";
          return leading + trimmed.substring(0, 8) + trailing;
        }
        return token;
      }).join("");
      setText(processedText);
      setTruncateToast(true);
      setTimeout(() => setTruncateToast(false), 3000);
    }

    localStorage.setItem(LS_KEY, processedText);
    const { displayNames: finalDisplayNames } = parseNames(processedText);
    const finalNames = finalDisplayNames.slice(0, 15);
    onStart(finalNames);
  }

  function handleShuffle() {
    // 원본 구분자 레이아웃을 보존하며 이름만 셔플
    const tokens = text.split(/([\n,\t]+)/);
    const nameTokens: string[] = [];
    const delimiters: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      if (i % 2 === 0) nameTokens.push(tokens[i]);
      else delimiters.push(tokens[i]);
    }
    // Fisher-Yates shuffle
    const shuffled = [...nameTokens];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    let result = "";
    for (let i = 0; i < shuffled.length; i++) {
      result += shuffled[i];
      if (i < delimiters.length) result += delimiters[i];
    }
    setText(result);
  }

  function handleClear() {
    setText("");
    prevTooLongCount.current = 0;
  }

  function handleCleanup() {
    // 원본 구분자 구조를 보존하면서 유효하지 않은 이름만 제거
    const tokens = text.split(/([\n,\t]+)/);
    const cleaned: string[] = [];
    let validCount = 0;
    for (let i = 0; i < tokens.length; i++) {
      if (i % 2 === 1) {
        // 구분자 토큰 — 이전 이름 토큰이 포함됐을 때만 유지
        if (cleaned.length > 0) cleaned.push(tokens[i]);
        continue;
      }
      const trimmed = tokens[i].trim();
      if (!trimmed) continue;
      if (trimmed.length > 8) continue; // 8자 초과 제거
      if (validCount >= 15) continue; // 15명 초과 제거
      if (cleaned.length > 0 && cleaned[cleaned.length - 1].match(/^[\n,\t]+$/)) {
        // 이미 구분자가 있으면 그대로
      } else if (cleaned.length > 0) {
        cleaned.push("\n");
      }
      cleaned.push(trimmed);
      validCount++;
    }
    setText(cleaned.join(""));
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
        {/* Title with Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <Image
              src="/logo.svg"
              alt="SNAIL RACE 로고"
              width={120}
              height={120}
              className=""
              priority
            />
          </div>
          <p className="font-body text-clay-muted text-sm mt-2">
            참가자 이름을 입력하세요 (최대 15명, 8자 이내)
          </p>
          <p className="font-body text-clay-muted/60 text-xs mt-1">
            줄바꿈 / 쉼표 / 탭으로 구분 · Ctrl+Enter로 시작
          </p>
        </div>

        {/* Textarea */}
        <div className={`relative ${shaking ? "animate-input-shake" : ""}`}>
          <label htmlFor="participant-input" className="sr-only">
            참가자 이름 입력
          </label>
          <textarea
            id="participant-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={"철수, 영희, 민수\n또는 한 줄에 한 명씩..."}
            className={`w-full h-32 sm:h-48 p-4 pr-10 border-[3px] rounded-2xl text-base
                       font-body font-medium text-clay-text
                       focus:outline-none focus:ring-4 focus:ring-clay-accent/30 focus:border-clay-accent
                       resize-none bg-clay-lilac/20 placeholder-clay-muted/70
                       clay-shadow-inset transition-colors duration-200
                       ${shaking || hasTooLong ? "border-clay-danger" : "border-clay-border"}`}
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
            {displayNames.slice(0, 15).map((displayName, i) => {
              const isTooLong = tooLongIndices.has(i);
              return (
                <motion.span
                  key={`${i}-${displayName}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5
                             rounded-xl text-sm font-body font-semibold
                             border-2 clay-shadow transition-all duration-200
                             ${isTooLong
                               ? "border-clay-danger/80 text-clay-danger ring-2 ring-clay-danger/20"
                               : "border-clay-border/30 text-clay-text"
                             }`}
                  style={{ backgroundColor: isTooLong ? "#FFEAEA" : SNAIL_TAG_COLORS[i] }}
                >
                  <span className="text-base" role="img" aria-label="달팽이">{isTooLong ? "⚠️" : "🐌"}</span>
                  <span className={`max-w-[120px] sm:max-w-[140px] truncate ${isTooLong ? "line-through decoration-clay-danger/50" : ""}`}>{displayName}</span>
                  {isTooLong && (
                    <span className="text-clay-danger text-[10px] font-bold shrink-0 bg-white/70 px-1 rounded">
                      {names[i].length}/8
                    </span>
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
            disabled={!canStart}
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
        <div className="mt-3 space-y-1 text-center" aria-live="polite" aria-relevant="additions removals">
          {hasTooLong && (
            <p className="text-[#E17055] text-xs font-body font-semibold" role="alert">
              8자를 초과한 이름은 시작 시 자동으로 줄여집니다
            </p>
          )}
          {hasExcess && (
            <p className="text-clay-danger text-xs font-body font-semibold" role="alert">
              최대 15명까지 참가할 수 있습니다 — {names.length - 15}명을 줄여주세요!
            </p>
          )}
          {validCount < 2 && (
            <p className={`text-sm font-body font-bold ${validCount === 0 ? "text-clay-muted" : "text-clay-danger"}`}>
              {validCount === 0
                ? "최소 2명의 참가자를 입력해주세요"
                : "1명 더 입력해주세요!"}
            </p>
          )}
          {(hasTooLong || hasExcess) && (
            <button
              type="button"
              onClick={handleCleanup}
              className="mt-1 inline-flex items-center gap-1 px-3 py-1.5
                         bg-clay-danger/15 text-clay-danger text-xs font-body font-bold
                         rounded-xl border-2 border-clay-danger/30
                         hover:bg-clay-danger/25 transition-colors duration-150 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              유효하지 않은 인원 지우기
            </button>
          )}
        </div>

        {/* 자동 절삭 토스트 */}
        <AnimatePresence>
          {truncateToast && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-2 text-center"
            >
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-clay-accent/15 text-clay-accent text-xs font-body font-bold rounded-xl">
                긴 이름은 자동으로 8자로 줄였습니다
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
