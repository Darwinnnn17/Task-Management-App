import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200 md:p-12">
        <div className="mb-8 inline-flex rounded-full bg-slate-100 px-4 py-1 text-sm font-medium text-slate-600">
          Fullstack Task Management App
        </div>

        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          TaskFlow
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
          Organize your work with a clean dashboard, simple authentication,
          task priorities, due dates, and progress tracking.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="rounded-xl bg-slate-900 px-5 py-3 text-center font-medium text-white transition hover:bg-slate-800"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}