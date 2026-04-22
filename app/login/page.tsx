"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || data.details || "Login gagal");
        setLoading(false);
        return;
      }

      setLoading(false);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage("Request gagal");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 md:grid-cols-2">
        <div className="hidden bg-slate-900 p-10 text-white md:block">
          <div className="inline-flex rounded-full bg-white/10 px-4 py-1 text-sm">
            TaskFlow
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-tight">
            Welcome back to your workspace.
          </h1>
          <p className="mt-4 text-slate-300">
            Sign in to manage your priorities, due dates, and project progress.
          </p>
        </div>

        <div className="p-6 md:p-10">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Login
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enter your account information to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
              {message}
            </p>
          )}

          <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-slate-900 underline dark:text-slate-100">
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}