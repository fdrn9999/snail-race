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
}

/** 기준 프레임 간격 (60fps = 16.67ms) */
const REF_DT = 16.67;

export function createRaceEngine(config: RaceConfig) {
  const { totalDuration, participantCount, predeterminedWinner } = config;
  const rbScale = config.rubberBandScale ?? 1.0;
  const finalPhaseStart = totalDuration - 2500;

  // 뷰포트 기반 러버밴드 파라미터
  const rbDeadzone = 4 + (1 - rbScale) * 4;
  const rbDampRange = 30 + (1 - rbScale) * 15;

  const snails = Array.from({ length: participantCount }, (_, i) => {
    const isWinner = i === predeterminedWinner;
    return {
      cruiseRate: isWinner
        ? 0.93 + Math.random() * 0.03
        : 0.88 + Math.random() * 0.07,
      wave1: { freq: 0.3 + Math.random() * 0.4, phase: Math.random() * Math.PI * 2, amp: 0.04 + Math.random() * 0.04 },
      wave2: { freq: 0.7 + Math.random() * 0.8, phase: Math.random() * Math.PI * 2, amp: 0.02 + Math.random() * 0.03 },
      wave3: { freq: 1.2 + Math.random() * 1.5, phase: Math.random() * Math.PI * 2, amp: 0.01 + Math.random() * 0.02 },
      // 극적 역전 서지: 비우승자에게 중반에 간헐적 가속을 부여하는 저주파 파형
      surge: isWinner ? null : {
        freq: 0.15 + Math.random() * 0.1,       // 매우 느린 주기 (~7-10초)
        phase: Math.random() * Math.PI * 2,
        amp: 0.06 + Math.random() * 0.04,        // 최대 ±10% 추가
        activeRange: [0.25 + Math.random() * 0.1, 0.65 + Math.random() * 0.1] as [number, number],
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
    const inFinalPhase = elapsed >= finalPhaseStart;
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
            (elapsed - finalPhaseStart) / (totalDuration - finalPhaseStart);
          const eased = finalProgress * finalProgress;
          const winTarget = 76 + eased * 24;
          const gap = winTarget - positions[i];
          if (gap > 0) {
            const convergence = 1 - Math.pow(1 - 0.05, scale);
            positions[i] += gap * convergence;
          }
        }

        if (!isWinner && inFinalPhase) {
          const winnerPos = positions[predeterminedWinner];
          if (positions[i] > winnerPos + 0.5) {
            movement *= 0.85;
          }
        }

        if (isWinner) {
          const minPos = smoothProgress * 50;
          if (positions[i] < minPos) {
            const pullGap = minPos - positions[i];
            const pull = 1 - Math.pow(1 - 0.04, scale);
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

    // 나머지: 현재 위치 + 랜덤 가중치로 순서 결정
    const remaining: { index: number; score: number }[] = [];
    for (let i = 0; i < participantCount; i++) {
      if (!finishedSet.has(i)) {
        remaining.push({ index: i, score: positions[i] + Math.random() * 15 });
      }
    }
    remaining.sort((a, b) => b.score - a.score);

    for (const r of remaining) {
      positions[r.index] = 100;
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
