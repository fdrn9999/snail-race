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

  // 뷰포트 기반 러버밴드 파라미터: 좁은 화면일수록 데드존 넓게, 보정 완만하게
  const rbDeadzone = 4 + (1 - rbScale) * 4; // 4(데스크톱) ~ 8(모바일)
  const rbDampRange = 30 + (1 - rbScale) * 15; // 30 ~ 45

  // ── 각 달팽이의 고유 특성 ──
  const snails = Array.from({ length: participantCount }, (_, i) => {
    const isWinner = i === predeterminedWinner;
    return {
      cruiseRate: isWinner
        ? 0.93 + Math.random() * 0.03 // 0.93–0.96
        : 0.88 + Math.random() * 0.07, // 0.88–0.95
      wave1: { freq: 0.3 + Math.random() * 0.4, phase: Math.random() * Math.PI * 2, amp: 0.04 + Math.random() * 0.04 },
      wave2: { freq: 0.7 + Math.random() * 0.8, phase: Math.random() * Math.PI * 2, amp: 0.02 + Math.random() * 0.03 },
      wave3: { freq: 1.2 + Math.random() * 1.5, phase: Math.random() * Math.PI * 2, amp: 0.01 + Math.random() * 0.02 },
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

  /** 단일 시뮬레이션 틱 (내부용) */
  function tick(dt: number, elapsed: number): void {
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

      // ── 사인파 조합: 부드러운 속도 변화 (±10% 이내) ──
      const w1 = Math.sin(timeSec * snail.wave1.freq + snail.wave1.phase) * snail.wave1.amp;
      const w2 = Math.sin(timeSec * snail.wave2.freq + snail.wave2.phase) * snail.wave2.amp;
      const w3 = Math.sin(timeSec * snail.wave3.freq + snail.wave3.phase) * snail.wave3.amp;

      const speedMul = Math.max(0.9, Math.min(1.1, 1.0 + w1 + w2 + w3));

      const baseMovement = snail.cruiseRate * (dt / totalDuration) * 100;
      let movement = baseMovement * speedMul;

      if (winnerFinished) {
        positions[i] += movement * 1.2;
      } else {
        // ── 소프트 페이싱: smoothProgress 기반 러버밴드 ──
        const expectedPos = snail.cruiseRate * smoothProgress * 100;
        const deviation = positions[i] - expectedPos;

        if (deviation > rbDeadzone) {
          const dampFactor = Math.max(0.5, 1 - (deviation - rbDeadzone) / rbDampRange);
          movement *= dampFactor;
        } else if (deviation < -rbDeadzone) {
          movement *= Math.min(1.12, 1 + (-deviation - rbDeadzone) / 40);
        }

        positions[i] += movement;

        // ── 우승자 최종 구간 (마지막 2.5초) ──
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

        // ── 패배자: 우승자 추월 시 미세 감속 ──
        if (!isWinner && inFinalPhase) {
          const winnerPos = positions[predeterminedWinner];
          if (positions[i] > winnerPos + 0.5) {
            movement *= 0.85;
          }
        }

        // ── 우승자 최소 보장: 부드러운 당김 ──
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

    if (frameFinishers.length > 1) {
      frameFinishers.sort((a, b) => b.overshoot - a.overshoot);
    }
    for (const f of frameFinishers) {
      finishOrder.push(f.index);
    }

    _state.finished = finishedSet.size === participantCount;
  }

  /**
   * 매 프레임 호출. Catch-up 서브스테핑으로 탭 전환 시에도 동기화 유지.
   * React 상태에 넘길 때만 snapshot()을 사용하세요.
   */
  function update(elapsed: number): RaceState {
    const rawDt = elapsed - lastTimestamp;

    _state.elapsedTime = elapsed;
    _state.finished = false;

    if (rawDt <= 0 || elapsed <= 0) {
      lastTimestamp = elapsed;
      return _state;
    }

    // ── Catch-up 서브스테핑 ──
    // 탭 전환 등으로 rawDt가 클 때, 16.67ms 단위로 분할 실행
    // 최대 500ms(~30틱)까지 시뮬레이션하여 메인 스레드 프리즈 방지
    const MAX_CATCHUP_MS = 500;
    const simulateMs = Math.min(rawDt, MAX_CATCHUP_MS);
    const steps = Math.max(1, Math.round(simulateMs / REF_DT));
    const stepDt = simulateMs / steps; // ≈ 16.67ms

    // 500ms 초과분은 smoothProgress만 빠르게 전진 (러버밴드가 자연스럽게 따라잡음)
    if (rawDt > MAX_CATCHUP_MS) {
      smoothProgress = Math.min(smoothProgress + (rawDt - MAX_CATCHUP_MS) / totalDuration, 1);
    }

    const baseElapsed = elapsed - simulateMs;
    for (let s = 0; s < steps; s++) {
      tick(stepDt, baseElapsed + stepDt * (s + 1));
      if (_state.finished) break;
    }

    lastTimestamp = elapsed;
    return _state;
  }

  /** React 상태용 불변 스냅샷 생성 */
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

  return { update, snapshot, reset };
}
