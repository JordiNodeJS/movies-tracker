import { register } from "@/lib/auth-actions";
import { Link } from "@/i18n/routing";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <form
        action={register}
        className="flex flex-col gap-6 p-8 border border-border rounded-lg w-full max-w-md bg-card"
      >
        <h1 className="text-3xl font-bold text-center">Register</h1>
        <div className="flex flex-col gap-2">
          <label htmlFor="email">Email</label>
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="p-3 rounded bg-background border border-border"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password">Password</label>
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="p-3 rounded bg-background border border-border"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-primary-foreground p-3 rounded font-bold hover:opacity-90 transition-opacity"
        >
          Register
        </button>
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}
