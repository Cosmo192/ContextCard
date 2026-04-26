"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BriefCard from "@/components/BriefCard";
import LoadingState from "@/components/LoadingState";

const STORAGE_KEY = "contextcard-brief";

export default function BriefPage() {
  const router = useRouter();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        router.replace("/");
        return;
      }
      setPayload(JSON.parse(stored));
    } catch {
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  function handleStartOver() {
    localStorage.removeItem(STORAGE_KEY);
    router.push("/");
  }

  if (loading) {
    return (
      <main className="px-6 py-14 md:py-20">
        <LoadingState />
      </main>
    );
  }

  if (!payload?.brief) {
    return null;
  }

  const { name, brief, sources = [] } = payload;

  return (
    <main className="px-6 py-10 md:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleStartOver}
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/80 transition hover:bg-black/5"
          >
            Start Over
          </button>
          <p className="text-sm text-black/60">Brief for {name}</p>
        </div>

        <div className="grid gap-4 md:gap-5">
          <BriefCard title="Who They Are">{brief.whoTheyAre}</BriefCard>
          <BriefCard title="What They Care About">{brief.whatTheyCareAbout}</BriefCard>
          <BriefCard title="Recent Activity">{brief.recentActivity}</BriefCard>
          <BriefCard title="Conversation Starters">
            <ol className="list-decimal space-y-2 pl-5">
              {(brief.conversationStarters || []).map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ol>
          </BriefCard>
          <BriefCard title="Common Ground">{brief.commonGround}</BriefCard>
          {brief.watchOut ? <BriefCard title="Watch Out">{brief.watchOut}</BriefCard> : null}
          {sources.length ? (
            <BriefCard title="Sources Used">
              <ul className="space-y-2">
                {sources.map((source, index) => (
                  <li key={`${source.url}-${index}`}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-accent underline decoration-accent/35 underline-offset-2 transition hover:decoration-accent"
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </BriefCard>
          ) : null}
        </div>
      </div>
    </main>
  );
}
