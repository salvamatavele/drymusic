"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h2 className="text-xl font-bold">Algo correu mal</h2>
      <p className="text-sm text-muted">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-full bg-accent px-6 py-2 font-bold text-black hover:bg-accent-hover transition"
      >
        Tentar novamente
      </button>
    </div>
  );
}
