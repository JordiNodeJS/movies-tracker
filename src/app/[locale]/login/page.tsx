import { login } from "@/lib/auth-actions";
import { Link } from "@/i18n/routing";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-6">
      <form
        action={login}
        className="flex flex-col gap-8 p-12 glass rounded-[3rem] w-full max-w-md shadow-2xl"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">
            Login
          </h1>
          <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em]">
            Welcome back to the obsession
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4"
            >
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="your@email.com"
              className="p-6 rounded-2xl bg-foreground/5 border border-foreground/10 focus:outline-none focus:border-accent/50 transition-all"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4"
            >
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="p-6 rounded-2xl bg-foreground/5 border border-foreground/10 focus:outline-none focus:border-accent/50 transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-accent text-white p-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_rgba(124,58,237,0.3)]"
        >
          Enter the Vault
        </button>

        <div className="text-center">
          <p className="text-[10px] font-black opacity-20 uppercase tracking-widest">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-accent hover:underline underline-offset-4"
            >
              Register
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
