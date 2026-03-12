export interface RaceState {
  positions: number[]; // 0 to 100 (percentage)
  finished: boolean;
  winnerId: number;
  finishOrder: number[]; // indices in finish order (1st, 2nd, ...)
  elapsedTime: number;
}

export interface RaceConfig {
  totalDuration: number; // ms — time for the WINNER to finish (minimum 8000)
  participantCount: number;
  predeterminedWinner: number; // index
  rubberBandScale?: number; // 0~1 — 낮을수록 부드러운 보정 (모바일용). 기본 1.0
  participantNames?: string[]; // 이름 해시 기반 고유 특성 부여용
}

/** 기준 프레임 간격 (60fps = 16.67ms) */
const REF_DT = 16.67;

/** 문자열 → 32비트 정수 해시 */
function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  }
  return h;
}

/** LCG 시드 기반 유사 난수 생성기 */
function seededRandom(seed: number): () => number {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function createRaceEngine(config: RaceConfig) {
  const { totalDuration, participantCount, predeterminedWinner } = config;
  const rbScale = config.rubberBandScale ?? 1.0;
  const finalPhaseStart = totalDuration - 4500;

  // 뷰포트 기반 러버밴드 파라미터
  const rbDeadzone = 4 + (1 - rbScale) * 4;
  const rbDampRange = 30 + (1 - rbScale) * 15;

  // 이름 해시 기반 고유 특성: 0=스프린터, 1=뒷심형, 2=스피드형, 3=꾸준형
  const snails = Array.from({ length: participantCount }, (_, i) => {
    const isWinner = i === predeterminedWinner;
    const name = config.participantNames?.[i];
    const hash = name ? hashName(name) : (Math.random() * 0x7fffffff) | 0;
    const rand = seededRandom(hash);
    const traitType = (hash >>> 0) % 4;
    const cruiseBias  = [0, -0.02, 0.02, 0][traitType];
    const waveScale   = [1.3, 0.7, 1.0, 0.6][traitType];
    const surgeScale  = [0.7, 1.4, 1.0, 0.8][traitType];
    const surgeShift  = [-0.1, 0.15, 0, 0.05][traitType];

    const baseCruise = isWinner
      ? 0.93 + rand() * 0.03
      : 0.88 + rand() * 0.07;

    return {
      cruiseRate: isWinner ? baseCruise : Math.max(0.85, Math.min(0.96, baseCruise + cruiseBias)),
      wave1: { freq: 0.3 + rand() * 0.4, phase: rand() * Math.PI * 2, amp: (0.04 + rand() * 0.04) * waveScale },
      wave2: { freq: 0.7 + rand() * 0.8, phase: rand() * Math.PI * 2, amp: (0.02 + rand() * 0.03) * waveScale },
      wave3: { freq: 1.2 + rand() * 1.5, phase: rand() * Math.PI * 2, amp: (0.01 + rand() * 0.02) * waveScale },
      surge: isWinner ? null : {
        freq: 0.15 + rand() * 0.1,
        phase: rand() * Math.PI * 2,
        amp: (0.06 + rand() * 0.04) * surgeScale,
        activeRange: [
          Math.max(0.1, 0.25 + rand() * 0.1 + surgeShift),
          Math.min(0.85, 0.65 + rand() * 0.1 + surgeShift),
        ] as [number, number],
      },
    };
  });

  const positions = new Array(participantCount).fill(0);
  const finishOrder: number[] = [];
  const finishedSet = new Set<number>();
  let lastTimestamp = 0;
  let smoothProgress = 0;

  const _state: RaceState = {
    positions,
    finished: false,
    winnerId: predeterminedWinner,
    finishOrder,
    elapsedTime: 0,
  };
  const frameFinishers: { index: number; overshoot: number }[] = [];

  /**
   * 매 프레임 호출.
   * 탭 전환 시 시계 일시정지는 호출자(RaceTrack)에서 처리하므로,
   * 엔진은 항상 작은 dt만 받는다고 가정합니다.
   */
  function update(elapsed: number): RaceState {
    const rawDt = elapsed - lastTimestamp;
    lastTimestamp = elapsed;

    _state.elapsedTime = elapsed;
    _state.finished = false;

    // Safety cap for minor frame drops (대형 갭은 호출자에서 처리)
    const dt = Math.min(rawDt, 50);

    if (dt <= 0 || elapsed <= 0) {
      return _state;
    }

    smoothProgress = Math.min(smoothProgress + dt / totalDuration, 1);
    const timeSec = elapsed / 1000;
    // smoothProgress 기반 최종 페이즈 — 프레임 드랍 시 위치와 타이밍 괴리 방지
    const effectiveElapsed = smoothProgress * totalDuration;
    const inFinalPhase = effectiveElapsed >= finalPhaseStart;
    const winnerFinished = finishedSet.has(predeterminedWinner);
    const scale = dt / REF_DT;

    frameFinishers.length = 0;

    for (let i = 0; i < participantCount; i++) {
      if (finishedSet.has(i)) continue;

      const snail = snails[i];
      const isWinner = i === predeterminedWinner;

      const w1 = Math.sin(timeSec * snail.wave1.freq + snail.wave1.phase) * snail.wave1.amp;
      const w2 = Math.sin(timeSec * snail.wave2.freq + snail.wave2.phase) * snail.wave2.amp;
      const w3 = Math.sin(timeSec * snail.wave3.freq + snail.wave3.phase) * snail.wave3.amp;

      // 극적 역전 서지 적용 (중반 구간에서만 활성)
      let surgeBonus = 0;
      if (snail.surge) {
        const progress = smoothProgress;
        const [lo, hi] = snail.surge.activeRange;
        if (progress >= lo && progress <= hi) {
          const surgeWindow = (progress - lo) / (hi - lo);
          const envelope = Math.sin(surgeWindow * Math.PI); // 0→1→0 부드러운 활성 곡선
          surgeBonus = Math.sin(timeSec * snail.surge.freq + snail.surge.phase) * snail.surge.amp * envelope;
        }
      }

      const speedMul = Math.max(0.9, Math.min(1.15, 1.0 + w1 + w2 + w3 + surgeBonus));

      const baseMovement = snail.cruiseRate * (dt / totalDuration) * 100;
      let movement = baseMovement * speedMul;

      if (winnerFinished) {
        positions[i] += movement * 1.2;
      } else {
        const expectedPos = snail.cruiseRate * smoothProgress * 100;
        const deviation = positions[i] - expectedPos;

        if (deviation > rbDeadzone) {
          const dampFactor = Math.max(0.5, 1 - (deviation - rbDeadzone) / rbDampRange);
          movement *= dampFactor;
        } else if (deviation < -rbDeadzone) {
          movement *= Math.min(1.12, 1 + (-deviation - rbDeadzone) / 40);
        }

        positions[i] += movement;

        if (isWinner && inFinalPhase) {
          const finalProgress =
            (effectiveElapsed - finalPhaseStart) / (totalDuration - finalPhaseStart);
          // smoothstep S-curve — 양 끝 기울기 0으로 자연스러운 수렴
          const eased = finalProgress * finalProgress * (3 - 2 * finalProgress);
          const winTarget = 76 + eased * 24;
          const gap = winTarget - positions[i];
          if (gap > 0) {
            // 수렴 강도: 시간이 길어졌으므로 낮춤
            const convergence = Math.min(1, 0.0006 * dt * (1 + finalProgress * 2));
            positions[i] += gap * convergence;
          }
        }

        if (!isWinner && inFinalPhase) {
          const finalProgress =
            (effectiveElapsed - finalPhaseStart) / (totalDuration - finalPhaseStart);
          const winnerPos = positions[predeterminedWinner];
          const lead = positions[i] - winnerPos;
          if (lead > 1.0) {
            // smoothstep 이징으로 통일 — 부드러운 감속
            const intensity = finalProgress * finalProgress * (3 - 2 * finalProgress);
            const dampFactor = Math.max(0.94, 1 - (lead - 1.0) / 80 * intensity);
            movement *= dampFactor;
          }
        }

        if (isWinner) {
          const minPos = smoothProgress * 50;
          if (positions[i] < minPos) {
            const pullGap = minPos - positions[i];
            // dt 기반 선형 보간 — FPS 무관 일관된 수렴
            const pull = Math.min(1, 0.0024 * dt);
            positions[i] += pullGap * pull;
          }
        }
      }

      positions[i] = Math.max(0, Math.min(100, positions[i]));

      if (positions[i] >= 99.5) {
        const overshoot = positions[i] - 99.5;
        positions[i] = 100;
        finishedSet.add(i);
        frameFinishers.push({ index: i, overshoot });
      }
    }

    // 동프레임 통과자 정렬 — 우승자 100% 보장
    if (frameFinishers.length > 1) {
      frameFinishers.sort((a, b) => {
        if (a.index === predeterminedWinner) return -1;
        if (b.index === predeterminedWinner) return 1;
        return b.overshoot - a.overshoot;
      });
    }
    for (const f of frameFinishers) {
      finishOrder.push(f.index);
    }

    _state.finished = finishedSet.size === participantCount;

    return _state;
  }

  /**
   * O(n) 즉시 완료 — 스킵 버튼용.
   * while 루프 대신 한 번에 최종 결과를 생성합니다.
   */
  function skipToEnd(): RaceState {
    // 우승자 우선 통과
    if (!finishedSet.has(predeterminedWinner)) {
      positions[predeterminedWinner] = 100;
      finishedSet.add(predeterminedWinner);
      finishOrder.push(predeterminedWinner);
    }

    // 나머지: 현재 위치(50%) + 랜덤(50%)으로 순서 결정
    // 스킵 타이밍에 따른 조작 가능성을 줄이기 위해 랜덤 비중을 높임
    const remaining: { index: number; score: number }[] = [];
    for (let i = 0; i < participantCount; i++) {
      if (!finishedSet.has(i)) {
        remaining.push({ index: i, score: positions[i] * 0.5 + Math.random() * 50 });
      }
    }
    remaining.sort((a, b) => b.score - a.score);

    // 현재 위치 기반 도착 위치 보간 — 초반 스킵 시 순간이동 느낌 감소
    for (let j = 0; j < remaining.length; j++) {
      const r = remaining[j];
      const rank = finishOrder.length;
      const currentPos = positions[r.index];
      const finishTarget = 100 - rank * 1.5;
      // 레이스 진행도에 비례하여 결승 목표와 현재 위치를 보간
      const blend = Math.max(0.5, smoothProgress);
      const basePos = currentPos + (finishTarget - currentPos) * blend;
      const jitter = (Math.random() - 0.5) * 2;
      positions[r.index] = Math.max(currentPos, Math.min(100, basePos + jitter));
      finishedSet.add(r.index);
      finishOrder.push(r.index);
    }

    _state.finished = true;
    _state.elapsedTime = totalDuration;
    return _state;
  }

  function snapshot(): RaceState {
    return {
      positions: [...positions],
      finished: _state.finished,
      winnerId: predeterminedWinner,
      finishOrder: [...finishOrder],
      elapsedTime: _state.elapsedTime,
    };
  }

  function reset() {
    positions.fill(0);
    finishOrder.length = 0;
    finishedSet.clear();
    lastTimestamp = 0;
    smoothProgress = 0;
  }

  return { update, snapshot, reset, skipToEnd };
}
