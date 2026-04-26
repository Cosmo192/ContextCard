"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingState from "./LoadingState";

const STORAGE_KEY = "contextcard-brief";

export default function InputForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !context.trim()) {
      setError("Please add both a name and meeting context.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), context: context.trim() })
      });

      const payload = await response.json();

      if (!response.ok) {
        const message = payload.details
          ? `${payload.error || "Failed to build brief."} ${payload.details}`
          : payload.error || "Failed to build brief.";
        throw new Error(message);
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          name: name.trim(),
          context: context.trim(),
          brief: payload.brief,
          sources: payload.sources || [],
          generatedAt: new Date().toISOString()
        })
      );

      router.push("/brief");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-3xl border border-black/5 bg-white/85 p-7 shadow-soft backdrop-blur md:p-8"
    >
      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-black/80">Who are you meeting?</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dr. James Liu"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-black/80">
            Why are you meeting them?
          </span>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="He is interviewing me for a research internship at Georgia Tech."
            rows={5}
            className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm font-medium text-red-700">{error}</p> : null}

      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 active:brightness-95"
      >
        Build My Brief
      </button>
    </form>
  );
}
