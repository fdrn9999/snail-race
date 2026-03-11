"use client";

import { useState } from "react";
import ParticipantInput from "@/components/ParticipantInput";
import RaceTrack from "@/components/RaceTrack";

export default function Home() {
  const [participants, setParticipants] = useState<string[] | null>(null);

  return (
    <main className="min-h-screen py-8 px-4">
      {!participants ? (
        <ParticipantInput onStart={setParticipants} />
      ) : (
        <RaceTrack
          participants={participants}
          onReset={() => setParticipants(null)}
        />
      )}
    </main>
  );
}
