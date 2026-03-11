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

  const snailSpeeds = Array.from({ length: participantCount }, () => ({
    baseSpeed: 0.3 + Math.random() * 0.4,
    variance: 0.2 + Math.random() * 0.3,
    burstChance: 0.02 + Math.random() * 0.03,
  }));

  // 패배자별 최종 도착 목표 위치 (고정값 — 투명벽 대신 자연스러운 감속 목표)
  const snailFinalTargets = Array.from({ length: participantCount }, (_, i) => {
    if (i === predeterminedWinner) return 100;
    return 82 + Math.random() * 15; // 82~97 사이에 넓게 분산 (고무줄 현상 완화)
  });

  const positions = new Array(participantCount).fill(0);
  const finishOrder: number[] = [];
  const finishedSet = new Set<number>();
  let lastTimestamp = 0;

  /** dt를 기준 프레임(16.67ms)으로 정규화한 배율 */
  function dtScale(dt: number): number {
    return dt / REF_DT;
  }

  function update(elapsed: number): RaceState {
    const dt = elapsed - lastTimestamp;
    lastTimestamp = elapsed;

    if (dt <= 0 || elapsed <= 0) {
      return {
        positions: [...positions],
        finished: false,
        winnerId: predeterminedWinner,
        finishOrder: [...finishOrder],
        elapsedTime: elapsed,
      };
    }

    const progress = elapsed / totalDuration;
    const inFinalPhase = elapsed >= finalPhaseStart;
    const winnerFinished = finishedSet.has(predeterminedWinner);
    const scale = dtScale(dt);

    // 이번 프레임에 결승선을 통과한 달팽이들을 모아둘 버퍼
    const frameFinishers: { index: number; overshoot: number }[] = [];

    for (let i = 0; i < participantCount; i++) {
      if (finishedSet.has(i)) continue;

      const snail = snailSpeeds[i];
      const isWinner = i === predeterminedWinner;

      let speed = snail.baseSpeed;

      // Random variance
      speed += (Math.random() - 0.5) * snail.variance * 2;

      // Random burst — dt 정규화: 60fps 기준 확률 유지
      if (Math.random() < 1 - Math.pow(1 - snail.burstChance, scale)) {
        speed *= 1.5 + Math.random();
      }

      // Slow down occasionally — dt 정규화
      if (Math.random() < 1 - Math.pow(1 - 0.05, scale)) {
        speed *= 0.3;
      }

      const movement = speed * (dt / totalDuration) * 100;

      if (winnerFinished) {
        const orderBias = 0.8 + Math.random() * 0.8;
        positions[i] += movement * 1.5 * orderBias;
      } else if (inFinalPhase) {
        const finalProgress =
          (elapsed - finalPhaseStart) / (totalDuration - finalPhaseStart);

        if (isWinner) {
          const targetPos = 75 + finalProgress * 25;
          const currentGap = targetPos - positions[i];
          // dt 기반 지수 보간: 주사율 무관하게 동일한 수렴 속도
          const convergence = 1 - Math.pow(1 - 0.15, scale);
          positions[i] += Math.max(movement, currentGap * convergence);
        } else {
          // Ease-out 감속: 고정 목표 위치를 향해 자연스럽게 수렴
          const target = snailFinalTargets[i];
          const remaining = target - positions[i];
          if (remaining > 0.05) {
            const easeOut = 1 - Math.pow(1 - 0.08, scale);
            positions[i] += Math.max(movement * 0.3, remaining * easeOut);
          } else {
            // 목표 부근에서 미세한 흔들림 (살아있는 느낌)
            positions[i] += (Math.random() - 0.5) * 0.1 * scale;
          }
        }
      } else {
        const maxAllowed = 75 * progress + 10;
        positions[i] = Math.min(positions[i] + movement, maxAllowed);

        if (isWinner && positions[i] < progress * 50) {
          positions[i] = progress * 50 + Math.random() * 10;
        }
      }

      positions[i] = Math.max(0, Math.min(100, positions[i]));

      // 결승선 통과 감지 — 바로 push 하지 않고 버퍼에 모은다
      if (positions[i] >= 99.5) {
        const overshoot = positions[i] - 99.5; // 얼마나 더 넘었는지
        positions[i] = 100;
        finishedSet.add(i);
        frameFinishers.push({ index: i, overshoot });
      }
    }

    // 동프레임 통과자 처리: 초과 거리(overshoot) 내림차순 정렬
    // → 더 많이 넘은 달팽이가 먼저 들어온 것으로 판정
    if (frameFinishers.length > 1) {
      frameFinishers.sort((a, b) => b.overshoot - a.overshoot);
    }
    for (const f of frameFinishers) {
      finishOrder.push(f.index);
    }

    const allFinished = finishedSet.size === participantCount;

    return {
      positions: [...positions],
      finished: allFinished,
      winnerId: predeterminedWinner,
      finishOrder: [...finishOrder],
      elapsedTime: elapsed,
    };
  }

  function reset() {
    positions.fill(0);
    finishOrder.length = 0;
    finishedSet.clear();
    lastTimestamp = 0;
  }

  return { update, reset };
}
