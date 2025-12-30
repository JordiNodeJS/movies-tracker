"use client";

import { register } from "@/lib/auth-actions";
import { Link } from "@/i18n/navigation";
import { FormEvent, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      // Client-side validation
      if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      await register(formData);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ui-bg text-ui-text p-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 p-12 glass w-full max-w-md shadow-2xl"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">
            Join
          </h1>
          <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.3em]">
            Start your cinematic journey
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3 items-center text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-4"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              className="p-6 bg-ui-text/5 border border-ui-border/10 focus:outline-none focus:border-ui-accent-primary/50 transition-all"
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-4"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="p-6 bg-ui-text/5 border border-ui-border/10 focus:outline-none focus:border-ui-accent-primary/50 transition-all"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-ui-accent-primary text-black p-6 font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_var(--ui-glow)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>

        <div className="text-center">
          <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-ui-accent-primary hover:underline underline-offset-4"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
