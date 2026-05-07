import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-zinc-100 px-6 py-20 dark:bg-zinc-950">
      <section className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium uppercase tracking-wide text-orange-600 dark:text-orange-400">
          Dragon Burger Restaurant
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Admin Dashboard
        </h1>
        <p className="mt-4 text-base text-zinc-600 dark:text-zinc-300">
          Monitor live operations, track sales, manage staff shifts, and keep menu inventory under control.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="inline-flex rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
          >
            Open Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
