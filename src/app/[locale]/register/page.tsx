import { register } from "@/lib/auth-actions";
import { Link } from "@/i18n/navigation";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ui-bg text-ui-text p-6">
      <form
        action={register}
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

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-4"
            >
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="your@email.com"
              className="p-6 bg-ui-text/5 border border-ui-border/10 focus:outline-none focus:border-ui-accent-primary/50 transition-all"
              required
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
              name="password"
              type="password"
              placeholder="••••••••"
              className="p-6 bg-ui-text/5 border border-ui-border/10 focus:outline-none focus:border-ui-accent-primary/50 transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-ui-accent-primary text-black p-6 font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_var(--ui-glow)]"
        >
          Create Account
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
