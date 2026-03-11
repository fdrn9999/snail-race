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

export function createRaceEngine(config: RaceConfig) {
  const { totalDuration, participantCount, predeterminedWinner } = config;
  const finalPhaseStart = totalDuration - 2000; // last 2 seconds for winner

  // Each snail gets random speed characteristics
  const snailSpeeds = Array.from({ length: participantCount }, () => ({
    baseSpeed: 0.3 + Math.random() * 0.4,
    variance: 0.2 + Math.random() * 0.3,
    burstChance: 0.02 + Math.random() * 0.03,
  }));

  const positions = new Array(participantCount).fill(0);
  const finishOrder: number[] = [];
  const finishedSet = new Set<number>();
  let lastTimestamp = 0;

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
    // After winner finishes, remaining snails get a "catch-up" phase
    const winnerFinished = finishedSet.has(predeterminedWinner);

    for (let i = 0; i < participantCount; i++) {
      // Already crossed finish line
      if (finishedSet.has(i)) continue;

      const snail = snailSpeeds[i];
      const isWinner = i === predeterminedWinner;

      let speed = snail.baseSpeed;

      // Random variance
      speed += (Math.random() - 0.5) * snail.variance * 2;

      // Random burst
      if (Math.random() < snail.burstChance) {
        speed *= 1.5 + Math.random();
      }

      // Slow down occasionally for drama
      if (Math.random() < 0.05) {
        speed *= 0.3;
      }

      const movement = speed * (dt / totalDuration) * 100;

      if (winnerFinished) {
        // Post-winner phase: remaining snails race to finish with boosted speed
        // Stagger them so they arrive at slightly different times
        const remainingCount = participantCount - finishedSet.size;
        const orderBias = 0.8 + Math.random() * 0.8; // random boost factor
        positions[i] += movement * 1.5 * orderBias;
      } else if (inFinalPhase) {
        const finalProgress =
          (elapsed - finalPhaseStart) / (totalDuration - finalPhaseStart);

        if (isWinner) {
          const targetPos = 75 + finalProgress * 25;
          const currentGap = targetPos - positions[i];
          positions[i] += Math.max(movement, currentGap * 0.15);
        } else {
          // Non-winners slow down, cap below finish
          const maxPos = 70 + Math.random() * 22;
          if (positions[i] < maxPos) {
            positions[i] += movement * (0.3 + Math.random() * 0.3);
          }
        }
      } else {
        // Normal phase
        const maxAllowed = 75 * progress + 10;
        positions[i] = Math.min(positions[i] + movement, maxAllowed);

        if (isWinner && positions[i] < progress * 50) {
          positions[i] = progress * 50 + Math.random() * 10;
        }
      }

      positions[i] = Math.max(0, Math.min(100, positions[i]));

      // Check if this snail just crossed finish
      if (positions[i] >= 99.5) {
        positions[i] = 100;
        finishedSet.add(i);
        finishOrder.push(i);
      }
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
