export default function Loading() {
  return (
    <main className="min-h-[70vh] bg-poem-cream">
      <div className="container-poem py-20">
        <div className="animate-pulse">
          <div className="h-3 w-28 rounded bg-poem-700/20" />
          <div className="mt-6 h-14 max-w-3xl rounded-2xl bg-poem-900/10" />
          <div className="mt-4 h-5 max-w-2xl rounded bg-poem-900/10" />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-64 rounded-[28px] bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
