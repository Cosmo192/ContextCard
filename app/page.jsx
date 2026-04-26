import InputForm from "@/components/InputForm";

export default function HomePage() {
  return (
    <main className="px-6 py-14 md:py-20">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center md:mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent/80">
            ContextCard
          </p>
          <h1 className="mt-2 font-display text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Know anyone before
            <span className="block">you meet them</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-black/70">
            Turn scattered public information into a practical pre-meeting brief in seconds.
          </p>
        </header>

        <InputForm />
      </div>
    </main>
  );
}
