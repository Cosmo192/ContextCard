"use client";

import { useEffect, useState } from "react";

const messages = [
  "Scanning public profiles",
  "Pulling interviews and talks",
  "Connecting the dots into a useful brief"
];

export default function LoadingState() {
  const [dotCount, setDotCount] = useState(1);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 450);

    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1900);

    return () => {
      clearInterval(dotTimer);
      clearInterval(messageTimer);
    };
  }, []);

  return (
    <div className="mx-auto flex min-h-[45vh] max-w-xl flex-col items-center justify-center rounded-3xl border border-black/5 bg-white/90 px-8 py-14 text-center shadow-soft backdrop-blur">
      <div className="h-12 w-12 animate-pulse rounded-full bg-accent/15" />
      <p className="mt-6 text-base font-semibold text-ink">
        {messages[messageIndex]}
        <span className="inline-block w-8 text-left">{Array.from({ length: dotCount }, () => ".")}</span>
      </p>
      <p className="mt-2 text-sm text-black/55">This usually takes a few seconds.</p>
    </div>
  );
}
