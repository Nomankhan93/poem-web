export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-3 w-24 rounded bg-poem-700/20" />
      <div className="mt-4 h-10 w-80 max-w-full rounded-xl bg-poem-900/10" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-40 rounded-[24px] bg-white"
          />
        ))}
      </div>
    </div>
  );
}
