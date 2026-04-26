export default function BriefCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-soft">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 text-[15px] leading-7 text-black/80">{children}</div>
    </section>
  );
}
