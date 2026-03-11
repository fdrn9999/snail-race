"use client";

import { useState } from "react";
import ParticipantInput from "@/components/ParticipantInput";
import RaceTrack from "@/components/RaceTrack";

export default function Home() {
  const [participants, setParticipants] = useState<string[] | null>(null);

  return (
    <>
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
      <footer className="py-3 text-center font-body text-[11px] text-clay-muted/60 space-x-3">
        <span>Made by 정진호(fdrn9999)</span>
        <a href="https://github.com/fdrn9999" target="_blank" rel="noopener noreferrer"
           className="hover:text-clay-muted transition-colors">GitHub</a>
        <a href="mailto:ckato9173@gmail.com"
           className="hover:text-clay-muted transition-colors">ckato9173@gmail.com</a>
      </footer>
    </>
  );
}
