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
  const finalPhaseStart = totalDuration - 2500;

  // ── 각 달팽이의 고유 특성 ──
  // 모든 달팽이가 비슷한 속도, 사인파로 자연스러운 엎치락뒤치락
  const snails = Array.from({ length: participantCount }, (_, i) => {
    const isWinner = i === predeterminedWinner;
    return {
      // 기본 순항 속도: 모두 거의 같게
      cruiseRate: isWinner
        ? 0.93 + Math.random() * 0.03 // 0.93–0.96
        : 0.88 + Math.random() * 0.07, // 0.88–0.95 (우승자와 겹침)
      // 사인파 — 진폭을 작게 유지 (±10% 이내 변동)
      wave1: { freq: 0.3 + Math.random() * 0.4, phase: Math.random() * Math.PI * 2, amp: 0.04 + Math.random() * 0.04 },
      wave2: { freq: 0.7 + Math.random() * 0.8, phase: Math.random() * Math.PI * 2, amp: 0.02 + Math.random() * 0.03 },
      wave3: { freq: 1.2 + Math.random() * 1.5, phase: Math.random() * Math.PI * 2, amp: 0.01 + Math.random() * 0.02 },
    };
  });

  const positions = new Array(participantCount).fill(0);
  const finishOrder: number[] = [];
  const finishedSet = new Set<number>();
  let lastTimestamp = 0;
  // 러버밴드용 보정 진행도 — dt 캡과 동기화
  let smoothProgress = 0;

  const _state: RaceState = {
    positions,
    finished: false,
    winnerId: predeterminedWinner,
    finishOrder,
    elapsedTime: 0,
  };
  const frameFinishers: { index: number; overshoot: number }[] = [];

  function update(elapsed: number): RaceState {
    const rawDt = elapsed - lastTimestamp;
    lastTimestamp = elapsed;

    _state.elapsedTime = elapsed;
    _state.finished = false;

    // dt 상한: 탭 전환 등으로 큰 점프 방지 (최대 50ms ≈ 20fps)
    const dt = Math.min(rawDt, 50);

    if (dt <= 0 || elapsed <= 0) {
      return _state;
    }

    // smoothProgress: dt 캡에 맞춰 진행도도 점진적으로 증가 (탭 전환 시 점프 방지)
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

      // 속도 배율: 0.9 ~ 1.1 범위로 제한 (부스터/급정지 없음)
      const speedMul = Math.max(0.9, Math.min(1.1, 1.0 + w1 + w2 + w3));

      // 기본 이동량
      const baseMovement = snail.cruiseRate * (dt / totalDuration) * 100;
      let movement = baseMovement * speedMul;

      if (winnerFinished) {
        // 우승자 통과 후: 나머지 자유 전진
        positions[i] += movement * 1.2;
      } else {
        // ── 소프트 페이싱: smoothProgress 기반 러버밴드 ──
        const expectedPos = snail.cruiseRate * smoothProgress * 100;
        const deviation = positions[i] - expectedPos;

        if (deviation > 4) {
          // 앞서면 살짝 감속 (급정지 없이)
          const dampFactor = Math.max(0.5, 1 - (deviation - 4) / 30);
          movement *= dampFactor;
        } else if (deviation < -4) {
          // 뒤처지면 살짝 가속 (부스터 없이)
          movement *= Math.min(1.12, 1 + (-deviation - 4) / 40);
        }

        positions[i] += movement;

        // ── 우승자 최종 구간 (마지막 2.5초) ──
        if (isWinner && inFinalPhase) {
          const finalProgress =
            (elapsed - finalPhaseStart) / (totalDuration - finalPhaseStart);
          // easeIn 커브: 처음엔 미미하다가 끝에 살짝 앞섬
          const eased = finalProgress * finalProgress;
          const winTarget = 76 + eased * 24;
          const gap = winTarget - positions[i];
          if (gap > 0) {
            // 작은 convergence → 한 프레임에 최대 gap*0.05 이동
            const convergence = 1 - Math.pow(1 - 0.05, scale);
            positions[i] += gap * convergence;
          }
        }

        // ── 패배자: 우승자 추월 시 미세 감속 (뒤로 가지는 않음) ──
        if (!isWinner && inFinalPhase) {
          const winnerPos = positions[predeterminedWinner];
          if (positions[i] > winnerPos + 0.5) {
            movement *= 0.85;
          }
        }

        // ── 우승자 최소 보장: 위치를 덮어쓰지 않고 부드럽게 당김 ──
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
    smoothProgress = 0;
  }

  return { update, snapshot, reset };
}
