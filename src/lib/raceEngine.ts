export interface RaceState {
  positions: number[]; // 0 to 100 (percentage)
  finished: boolean;
  winnerId: number;
  elapsedTime: number;
}

export interface RaceConfig {
  totalDuration: number; // ms (minimum 8000)
  participantCount: number;
  predeterminedWinner: number; // index
}

export function createRaceEngine(config: RaceConfig) {
  const { totalDuration, participantCount, predeterminedWinner } = config;
  const finalPhaseStart = totalDuration - 2000; // last 2 seconds

  // Each snail gets random speed characteristics
  const snailSpeeds = Array.from({ length: participantCount }, () => ({
    baseSpeed: 0.3 + Math.random() * 0.4,
    variance: 0.2 + Math.random() * 0.3,
    burstChance: 0.02 + Math.random() * 0.03,
  }));

  // Track accumulated positions
  const positions = new Array(participantCount).fill(0);
  let lastTimestamp = 0;

  function update(elapsed: number): RaceState {
    const dt = elapsed - lastTimestamp;
    lastTimestamp = elapsed;

    if (dt <= 0 || elapsed <= 0) {
      return {
        positions: [...positions],
        finished: false,
        winnerId: predeterminedWinner,
        elapsedTime: elapsed,
      };
    }

    const progress = elapsed / totalDuration; // 0 to 1
    const inFinalPhase = elapsed >= finalPhaseStart;

    for (let i = 0; i < participantCount; i++) {
      const snail = snailSpeeds[i];
      const isWinner = i === predeterminedWinner;

      // Base movement per frame (normalized to total duration)
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

      // Scale movement to frame time
      const movement = speed * (dt / totalDuration) * 100;

      if (inFinalPhase) {
        const finalProgress =
          (elapsed - finalPhaseStart) / (totalDuration - finalPhaseStart);

        if (isWinner) {
          // Winner must reach 100 by end
          const targetPos = 75 + finalProgress * 25;
          const currentGap = targetPos - positions[i];
          positions[i] += Math.max(movement, currentGap * 0.15);
        } else {
          // Non-winners slow down, cap at ~95
          const maxPos = 70 + Math.random() * 22;
          if (positions[i] < maxPos) {
            positions[i] += movement * (0.3 + Math.random() * 0.3);
          }
        }
      } else {
        // Normal phase: everyone moves randomly but stays under ~80%
        const maxAllowed = 75 * progress + 10;
        positions[i] = Math.min(positions[i] + movement, maxAllowed);

        // Keep winner roughly in the pack (not too far behind)
        if (isWinner && positions[i] < progress * 50) {
          positions[i] = progress * 50 + Math.random() * 10;
        }
      }

      // Clamp
      positions[i] = Math.max(0, Math.min(100, positions[i]));
    }

    // Check if winner crossed finish line
    const finished = positions[predeterminedWinner] >= 99.5;
    if (finished) {
      positions[predeterminedWinner] = 100;
    }

    return {
      positions: [...positions],
      finished,
      winnerId: predeterminedWinner,
      elapsedTime: elapsed,
    };
  }

  function reset() {
    positions.fill(0);
    lastTimestamp = 0;
  }

  return { update, reset };
}
