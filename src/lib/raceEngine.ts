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
}

/** 기준 프레임 간격 (60fps = 16.67ms) */
const REF_DT = 16.67;

export function createRaceEngine(config: RaceConfig) {
  const { totalDuration, participantCount, predeterminedWinner } = config;
  const finalPhaseStart = totalDuration - 2000;

  // 각 달팽이의 고유 특성 — 생성 시 확정
  const snails = Array.from({ length: participantCount }, (_, i) => {
    const isWinner = i === predeterminedWinner;
    return {
      baseSpeed: 0.3 + Math.random() * 0.4,
      variance: 0.2 + Math.random() * 0.3,
      burstChance: 0.02 + Math.random() * 0.03,
      // 개인 페이스: 레이스 진행도 대비 어디까지 갈지 결정
      // 우승자는 항상 빠른 축, 나머지는 넓게 분산
      cruiseRate: isWinner
        ? 0.88 + Math.random() * 0.08 // 0.88–0.96
        : 0.45 + Math.random() * 0.45, // 0.45–0.90 (넓은 분산)
    };
  });

  const positions = new Array(participantCount).fill(0);
  const finishOrder: number[] = [];
  const finishedSet = new Set<number>();
  let lastTimestamp = 0;

  // 재사용 가능한 내부 상태 객체 (GC 부담 최소화)
  const _state: RaceState = {
    positions,
    finished: false,
    winnerId: predeterminedWinner,
    finishOrder,
    elapsedTime: 0,
  };
  const frameFinishers: { index: number; overshoot: number }[] = [];

  function dtScale(dt: number): number {
    return dt / REF_DT;
  }

  /**
   * 매 프레임 호출. 내부 배열을 직접 참조하는 객체를 반환합니다.
   * React 상태에 넘길 때만 snapshot()을 사용하세요.
   */
  function update(elapsed: number): RaceState {
    const dt = elapsed - lastTimestamp;
    lastTimestamp = elapsed;

    _state.elapsedTime = elapsed;
    _state.finished = false;

    if (dt <= 0 || elapsed <= 0) {
      return _state;
    }

    const progress = elapsed / totalDuration;
    const inFinalPhase = elapsed >= finalPhaseStart;
    const winnerFinished = finishedSet.has(predeterminedWinner);
    const scale = dtScale(dt);

    frameFinishers.length = 0;

    for (let i = 0; i < participantCount; i++) {
      if (finishedSet.has(i)) continue;

      const snail = snails[i];
      const isWinner = i === predeterminedWinner;

      // ── 기본 속도 계산 ──
      let speed = snail.baseSpeed;
      speed += (Math.random() - 0.5) * snail.variance * 2;

      if (Math.random() < 1 - Math.pow(1 - snail.burstChance, scale)) {
        speed *= 1.5 + Math.random();
      }
      if (Math.random() < 1 - Math.pow(1 - 0.05, scale)) {
        speed *= 0.3;
      }

      let movement = speed * (dt / totalDuration) * 100;

      if (winnerFinished) {
        // ── 우승자 통과 후: 나머지 달팽이들 자유 가속 ──
        const orderBias = 0.8 + Math.random() * 0.8;
        positions[i] += movement * 1.5 * orderBias;
      } else {
        // ── 소프트 페이싱: 개인 목표 위치 기반 러버밴드 ──
        const expectedPos = snail.cruiseRate * progress * 100;
        const deviation = positions[i] - expectedPos;

        if (deviation > 6) {
          movement *= Math.max(0.05, 1 - (deviation - 6) / 20);
        } else if (deviation < -8) {
          movement *= 1.15 + Math.random() * 0.15;
        }

        positions[i] += movement;

        // ── 우승자 최종 스퍼트 (마지막 2초) ──
        if (isWinner && inFinalPhase) {
          const finalProgress =
            (elapsed - finalPhaseStart) / (totalDuration - finalPhaseStart);
          const winTarget = 82 + finalProgress * 18;
          const gap = winTarget - positions[i];
          if (gap > 0) {
            const convergence = 1 - Math.pow(1 - 0.12, scale);
            positions[i] += gap * convergence;
          }
        }

        // ── 패배자: 마지막 국면에서 우승자 추월 방지 ──
        if (!isWinner && inFinalPhase) {
          const winnerPos = positions[predeterminedWinner];
          if (positions[i] > winnerPos - 2) {
            const tooClose = positions[i] - (winnerPos - 2);
            const brake = Math.max(0.02, 1 - tooClose / 8);
            positions[i] -= movement * (1 - brake);
          }
        }

        // ── 우승자 최소 보장: 너무 뒤처지지 않도록 ──
        if (isWinner && positions[i] < progress * 45) {
          positions[i] = progress * 45 + Math.random() * 8;
        }
      }

      positions[i] = Math.max(0, Math.min(100, positions[i]));

      // 결승선 통과 감지
      if (positions[i] >= 99.5) {
        const overshoot = positions[i] - 99.5;
        positions[i] = 100;
        finishedSet.add(i);
        frameFinishers.push({ index: i, overshoot });
      }
    }

    // 동프레임 통과자 정렬
    if (frameFinishers.length > 1) {
      frameFinishers.sort((a, b) => b.overshoot - a.overshoot);
    }
    for (const f of frameFinishers) {
      finishOrder.push(f.index);
    }

    _state.finished = finishedSet.size === participantCount;

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
  }

  return { update, snapshot, reset };
}
